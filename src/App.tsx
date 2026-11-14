import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, type Tool } from './components/Canvas';
import { CasePage } from './components/CasePage';
import { ShareButton } from './components/ShareButton';
import { ExperienceCard, HeroCard, Icon, ProjectCard, VibeCard } from './components/Cards';
import { fitCamera, zoomAt, NODES, type Camera, type NodeId, type Vec } from './canvas/layout';
import { headerAvatars, icons, profile, projects } from './content';
import { findCase } from './cases';

type View = 'canvas' | 'feed';

const ZERO_OFFSETS = Object.fromEntries(Object.keys(NODES).map((id) => [id, { x: 0, y: 0 }])) as Record<NodeId, Vec>;
const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1, 1.5, 2];
const ZOOM_STEP = 1.25;

const CASE_ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5];
const CASE_CLOSE_MS = 200;

// Кейс открывается по адресу #/case/<id>: ссылку можно скопировать и отправить
const caseFromHash = () => {
  const m = window.location.hash.match(/^#\/case\/([\w-]+)/);
  return findCase(m ? m[1] : null)?.id ?? null;
};

const viewportSize = () => ({ w: window.innerWidth, h: window.innerHeight });
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function App() {
  const [view, setView] = useState<View>('canvas');
  const [tool, setTool] = useState<Tool>('hand');
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [camera, setCamera] = useState<Camera>(() => {
    const { w, h } = viewportSize();
    return fitCamera(w, h);
  });
  const [offsets, setOffsets] = useState<Record<NodeId, Vec>>(ZERO_OFFSETS);
  const [zoomMenu, setZoomMenu] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(caseFromHash);
  const [caseClosing, setCaseClosing] = useState(false);
  const [caseZoom, setCaseZoom] = useState(1);
  const study = findCase(caseId);

  // Пока пользователь не трогал холст, при изменении окна кадр подстраивается
  const touched = useRef(false);
  const anim = useRef(0);

  const stopAnimation = useCallback(() => cancelAnimationFrame(anim.current), []);
  const onInteract = useCallback(() => {
    touched.current = true;
    stopAnimation();
  }, [stopAnimation]);

  const animate = useCallback(
    (toCam: Camera, toOffsets?: Record<NodeId, Vec>, duration = 450) => {
      stopAnimation();
      const fromCam = camera;
      const fromOffsets = offsets;
      const t0 = performance.now();
      const step = (now: number) => {
        const t = easeOut(Math.min(1, (now - t0) / duration));
        setCamera({ x: lerp(fromCam.x, toCam.x, t), y: lerp(fromCam.y, toCam.y, t), z: lerp(fromCam.z, toCam.z, t) });
        if (toOffsets) {
          const next = {} as Record<NodeId, Vec>;
          for (const id of Object.keys(toOffsets) as NodeId[]) {
            next[id] = { x: lerp(fromOffsets[id].x, toOffsets[id].x, t), y: lerp(fromOffsets[id].y, toOffsets[id].y, t) };
          }
          setOffsets(next);
        }
        if (t < 1) anim.current = requestAnimationFrame(step);
      };
      anim.current = requestAnimationFrame(step);
    },
    [camera, offsets, stopAnimation],
  );

  // Адрес и кнопка «Назад» в браузере управляют открытым кейсом
  useEffect(() => {
    const sync = () => {
      setCaseClosing(false);
      setCaseId(caseFromHash());
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  const openCase = useCallback((id: string) => {
    setZoomMenu(false);
    setCaseClosing(false);
    setCaseZoom(1);
    if (caseFromHash() !== id) window.history.pushState(null, '', `#/case/${id}`);
    setCaseId(id);
  }, []);

  const closeTimer = useRef(0);
  const closeCase = useCallback(() => {
    setZoomMenu(false);
    setCaseClosing(true);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
      setCaseId(null);
      setCaseClosing(false);
    }, CASE_CLOSE_MS);
  }, []);

  // Меню масштаба закрывается кликом в любом месте вне панели масштаба
  useEffect(() => {
    if (!zoomMenu) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.zoom')) setZoomMenu(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [zoomMenu]);

  useEffect(() => {
    const onResize = () => {
      if (touched.current) return;
      const { w, h } = viewportSize();
      setCamera(fitCamera(w, h));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const zoomTo = useCallback(
    (z: number) => {
      // В кейсе масштаб меняет размер страницы кейса, на холсте — камеру
      if (caseId) {
        setCaseZoom(Math.min(2, Math.max(0.5, Math.round(z * 100) / 100)));
        return;
      }
      touched.current = true;
      const { w, h } = viewportSize();
      animate(zoomAt(camera, z, w / 2, h / 2), undefined, 220);
    },
    [animate, camera, caseId],
  );
  const zoomValue = caseId ? caseZoom : camera.z;
  const zoomPresets = caseId ? CASE_ZOOM_PRESETS : ZOOM_PRESETS;

  const reset = useCallback(() => {
    const { w, h } = viewportSize();
    touched.current = false;
    animate(fitCamera(w, h), ZERO_OFFSETS);
  }, [animate]);

  // Клавиши как в Figma: V — стрелка, H — рука, пробел — временная рука, +/− — масштаб, Esc — закрыть
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) => (e.target as HTMLElement).closest('input, textarea, [contenteditable]');
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomMenu) setZoomMenu(false);
        else if (caseId) closeCase();
        return;
      }
      if (isTyping(e) || caseId || view !== 'canvas') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setSpaceHeld(true);
      } else if (e.metaKey || e.ctrlKey) {
        if (e.key === '=' || e.key === '+') (e.preventDefault(), zoomTo(camera.z * ZOOM_STEP));
        else if (e.key === '-') (e.preventDefault(), zoomTo(camera.z / ZOOM_STEP));
        else if (e.key === '0') (e.preventDefault(), zoomTo(1));
      } else if (e.key === 'v' || e.key === 'V' || e.key === 'м' || e.key === 'М') setTool('select');
      else if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') setTool('hand');
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
    };
    const onBlur = () => setSpaceHeld(false);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [camera.z, caseId, closeCase, view, zoomMenu, zoomTo]);

  const setOffset = useCallback((id: NodeId, v: Vec) => setOffsets((prev) => ({ ...prev, [id]: v })), []);

  const nodes: Record<NodeId, React.ReactNode> = {
    exp: <ExperienceCard />,
    vibe: <VibeCard />,
    hero: <HeroCard />,
    p1: <ProjectCard project={projects[0]} onOpenCase={openCase} />,
    p2: <ProjectCard project={projects[1]} onOpenCase={openCase} />,
    p3: <ProjectCard project={projects[2]} onOpenCase={openCase} />,
    p4: <ProjectCard project={projects[3]} onOpenCase={openCase} />,
  };
  const caseOpen = Boolean(study) && !caseClosing;

  return (
    <div className={`app app--${view}${caseOpen ? ' has-case' : ''}`}>
      {view === 'canvas' ? (
        <Canvas
          camera={camera}
          setCamera={setCamera}
          offsets={offsets}
          setOffset={setOffset}
          tool={tool}
          spaceHeld={spaceHeld}
          onInteract={onInteract}
          nodes={nodes}
        />
      ) : (
        <main className="feed">
          <div className="feed-col feed-col--side">
            {nodes.exp}
            {nodes.vibe}
          </div>
          <div className="feed-col">{nodes.hero}</div>
          <div className="feed-col feed-col--projects">
            {nodes.p1}
            {nodes.p2}
            {nodes.p3}
            {nodes.p4}
          </div>
        </main>
      )}

      <header className="topbar">
        <div className="panel panel--crumbs">
          <span className="crumb">{profile.name}</span>
          <span className="tag">Pro</span>
          <Icon src={icons.chevronRight} className="icon--subtle" />
          {study ? (
            <button type="button" className="crumb crumb--link" onClick={closeCase}>
              Портфолио
            </button>
          ) : (
            <span className="crumb">Портфолио</span>
          )}
        </div>
        <div className="panel panel--share">
          <div className="avatars">
            {headerAvatars.map((a, i) => (
              <span
                key={a.name}
                className={`avatar${i > 0 ? ' avatar--ring' : ''}`}
                data-tooltip={a.name}
                aria-label={a.name}
                tabIndex={0}
              >
                <img src={a.src} alt="" draggable={false} />
              </span>
            ))}
          </div>
          <ShareButton />
        </div>
      </header>

      <footer className="bottombar">
        <div className="bottombar-side">
          {(view === 'canvas' || study) && (
            <div className="panel panel--tools zoom">
              <button type="button" className="tool-btn" aria-label="Приблизить" onClick={() => zoomTo(zoomValue * ZOOM_STEP)}>
                <Icon src={icons.zoomIn} className="icon--strong" />
              </button>
              <button
                type="button"
                className="tool-btn zoom-value"
                aria-haspopup="menu"
                aria-expanded={zoomMenu}
                onClick={() => setZoomMenu((v) => !v)}
              >
                {Math.round(zoomValue * 100)}%
                <Icon src={icons.chevronDown} className="icon--muted zoom-chevron" />
              </button>
              <button type="button" className="tool-btn" aria-label="Отдалить" onClick={() => zoomTo(zoomValue / ZOOM_STEP)}>
                <Icon src={icons.zoomOut} className="icon--strong" />
              </button>
              <div className={`menu${zoomMenu ? ' is-open' : ''}`} role="menu" aria-hidden={!zoomMenu}>
                    {zoomPresets.map((z) => (
                      <button
                        key={z}
                        type="button"
                        role="menuitem"
                        className="menu-item"
                        onClick={() => {
                          zoomTo(z);
                          setZoomMenu(false);
                        }}
                      >
                        {z * 100}%
                      </button>
                    ))}
              </div>
            </div>
          )}
        </div>

        <div className="bottombar-center" hidden={Boolean(study)}>
          {view === 'canvas' && (
            <div className="panel panel--tools">
              <button
                type="button"
                className={`tool-btn${tool === 'select' && !spaceHeld ? ' is-active' : ''}`}
                aria-label="Перемещать карточки (V)"
                aria-pressed={tool === 'select'}
                onClick={() => setTool('select')}
              >
                <Icon src={icons.move} size={28} className={tool === 'select' && !spaceHeld ? 'icon--white' : 'icon--strong'} />
              </button>
              <button
                type="button"
                className={`tool-btn${tool === 'hand' || spaceHeld ? ' is-active' : ''}`}
                aria-label="Двигать холст (H)"
                aria-pressed={tool === 'hand'}
                onClick={() => setTool('hand')}
              >
                <Icon src={icons.hand} size={28} className={tool === 'hand' || spaceHeld ? 'icon--white' : 'icon--strong'} />
              </button>
              <button type="button" className="tool-btn" aria-label="Вернуть как было" onClick={reset}>
                <Icon src={icons.reset} className="icon--strong" />
              </button>
            </div>
          )}
          <div className="panel panel--segment">
            <div className="segment">
              <button
                type="button"
                className={`segment-btn${view === 'canvas' ? ' is-active' : ''}`}
                aria-label="Холст"
                aria-pressed={view === 'canvas'}
                onClick={() => setView('canvas')}
              >
                <Icon src={icons.canvas} className={view === 'canvas' ? 'icon--strong' : 'icon--subtle'} />
              </button>
              <button
                type="button"
                className={`segment-btn${view === 'feed' ? ' is-active' : ''}`}
                aria-label="Лента"
                aria-pressed={view === 'feed'}
                onClick={() => setView('feed')}
              >
                <Icon src={icons.rows} className={view === 'feed' ? 'icon--strong' : 'icon--subtle'} />
              </button>
            </div>
          </div>
        </div>

        <div className="bottombar-side bottombar-side--right">
          <p className="legal">{profile.footerHandle} | Policy | Cookies</p>
        </div>
      </footer>

      {study && (
        <CasePage study={study} zoom={caseZoom} closing={caseClosing} onClose={closeCase} onOpenCase={openCase} />
      )}
    </div>
  );
}
