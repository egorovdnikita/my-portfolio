import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Canvas, type Tool } from './components/Canvas';
import { CasePage } from './components/CasePage';
import { ShareButton } from './components/ShareButton';
import { Avatars } from './components/Avatars';
import { usePresence } from './presence';
import { useIsMobile } from './useMedia';
import { useTheme } from './theme';
import { MobileShare } from './components/MobileShare';
import { ExperienceCard, HeroCard, Icon, ProjectCard, ShotCard, VibeCard } from './components/Cards';
import { initialCamera, zoomAt, NODES, type Camera, type NodeId, type Vec } from './canvas/layout';
import { icons, profile, projects, shots } from './content';
import { findCase } from './cases';

type View = 'canvas' | 'feed';

const ZERO_OFFSETS = Object.fromEntries(Object.keys(NODES).map((id) => [id, { x: 0, y: 0 }])) as Record<NodeId, Vec>;
const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1, 1.5, 2];
const ZOOM_STEP = 1.25;

const PAGE_ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5];
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
    return initialCamera(w, h);
  });
  const [offsets, setOffsets] = useState<Record<NodeId, Vec>>(ZERO_OFFSETS);
  const [zoomMenu, setZoomMenu] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(caseFromHash);
  const [caseClosing, setCaseClosing] = useState(false);
  // Масштаб страницы для ленты и кейса (на холсте масштаб — это камера)
  const [pageZoom, setPageZoom] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const study = findCase(caseId);
  const presence = usePresence();
  const isMobile = useIsMobile();
  const { theme, toggle: toggleTheme } = useTheme();
  const themeLabel = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
  const themeIcon = theme === 'dark' ? icons.sun : icons.moon;

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
    setPageZoom(1);
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
      setCamera(focusHero());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const zoomTo = useCallback(
    (z: number) => {
      // В кейсе и ленте масштаб меняет размер страницы, на холсте — камеру
      if (caseId || view === 'feed') {
        setPageZoom(Math.min(2, Math.max(0.5, Math.round(z * 100) / 100)));
        return;
      }
      touched.current = true;
      const { w, h } = viewportSize();
      animate(zoomAt(camera, z, w / 2, h / 2), undefined, 220);
    },
    [animate, camera, caseId, view],
  );
  const pageMode = Boolean(caseId) || view === 'feed';
  const zoomValue = pageMode ? pageZoom : camera.z;
  const zoomPresets = pageMode ? PAGE_ZOOM_PRESETS : ZOOM_PRESETS;
  // Переключение холст ⇄ лента: карточки плавно переезжают со старых мест на новые (FLIP)
  const flipFrom = useRef<Map<string, DOMRect> | null>(null);
  const switchView = (next: View) => {
    if (next === view) return;
    const rects = new Map<string, DOMRect>();
    document.querySelectorAll<HTMLElement>('[data-flip]').forEach((el) => rects.set(el.dataset.flip!, el.getBoundingClientRect()));
    flipFrom.current = rects;
    setView(next);
    setPageZoom(1);
    setZoomMenu(false);
  };
  useLayoutEffect(() => {
    const from = flipFrom.current;
    if (!from) return;
    flipFrom.current = null;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll<HTMLElement>('[data-flip]').forEach((el) => {
      const o = from.get(el.dataset.flip!);
      const n = el.getBoundingClientRect();
      if (!o || !n.width || !el.offsetWidth) return;
      // Внутри холста элемент масштабирован камерой: сдвиг переводим в его собственные координаты
      const k = n.width / el.offsetWidth;
      const tx = (o.left - n.left) / k;
      const ty = (o.top - n.top) / k;
      el.animate(
        [
          { transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${o.width / n.width}, ${o.height / n.height})` },
          { transformOrigin: '0 0', transform: 'none' },
        ],
        { duration: 560, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
    });
  }, [view]);

  // На телефоне стартовый кадр зависит от высоты вертикальной карточки — меряем её после отрисовки
  const focusHero = useCallback(() => {
    const { w, h } = viewportSize();
    const el = document.querySelector<HTMLElement>('[data-node="hero"]');
    return initialCamera(w, h, el ? { w: el.offsetWidth, h: el.offsetHeight } : undefined);
  }, []);
  useLayoutEffect(() => {
    if (view === 'canvas' && !touched.current) setCamera(focusHero());
  }, [focusHero, isMobile, view]);

  const reset = useCallback(() => {
    touched.current = false;
    animate(focusHero(), ZERO_OFFSETS);
  }, [animate, focusHero]);

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
    hero: <HeroCard variant={isMobile ? 'mobile' : view === 'canvas' ? 'canvas' : 'feed'} />,
    p1: <ProjectCard project={projects[0]} onOpenCase={openCase} />,
    p2: <ProjectCard project={projects[1]} onOpenCase={openCase} />,
    p3: <ProjectCard project={projects[2]} onOpenCase={openCase} />,
    p4: <ProjectCard project={projects[3]} onOpenCase={openCase} />,
    s1: <ShotCard shot={shots[0]} />,
    s2: <ShotCard shot={shots[1]} />,
  };
  const flip = (id: NodeId) => <div data-flip={id}>{nodes[id]}</div>;
  const caseOpen = Boolean(study) && !caseClosing;

  return (
    <div className={`app app--${view}${caseOpen ? ' has-case' : ''}${caseOpen || view === 'feed' ? ' has-page' : ''}`}>
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
          compact={isMobile}
        />
      ) : (
        <main className="feed">
          <div className="feed-column" style={{ zoom: pageZoom }}>
            {flip('hero')}
            {isMobile ? (
              <>
                {flip('exp')}
                {flip('vibe')}
                {flip('p1')}
                {flip('p2')}
                {flip('p3')}
                {flip('p4')}
                {flip('s1')}
                {flip('s2')}
              </>
            ) : (
              <div className="feed-grid">
                <div className="feed-col">
                  {flip('exp')}
                  {flip('p1')}
                  {flip('p3')}
                  {flip('s1')}
                </div>
                <div className="feed-col">
                  {flip('vibe')}
                  {flip('p2')}
                  {flip('p4')}
                  {flip('s2')}
                </div>
              </div>
            )}
            {isMobile && <p className="legal legal--feed">{profile.footerHandle} | {profile.footerNote}</p>}
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
            <span className="crumb crumb--page">Портфолио</span>
          )}
          {isMobile && (
            <button
              type="button"
              className="btn btn--primary share-icon-btn"
              aria-label="Поделиться"
              aria-expanded={shareOpen}
              onClick={() => setShareOpen((v) => !v)}
            >
              <Icon src={icons.link} className="icon--white" />
            </button>
          )}
        </div>
        {!isMobile && (
          <div className="panel panel--share">
            <Avatars self={presence.self} others={presence.others} />
            <ShareButton />
          </div>
        )}
      </header>
      {isMobile && <MobileShare open={shareOpen} onClose={() => setShareOpen(false)} presence={presence} />}

      <footer className="bottombar">
        <div className="bottombar-side">
          {!isMobile && (
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
          {!isMobile && (
            <div className="panel panel--tools">
              <button type="button" className="tool-btn" aria-label={themeLabel} title={themeLabel} onClick={toggleTheme}>
                <Icon src={themeIcon} className="icon--strong" />
              </button>
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
                onClick={() => switchView('canvas')}
              >
                <Icon src={icons.canvas} className={view === 'canvas' ? 'icon--strong' : 'icon--subtle'} />
              </button>
              <button
                type="button"
                className={`segment-btn${view === 'feed' ? ' is-active' : ''}`}
                aria-label="Лента"
                aria-pressed={view === 'feed'}
                onClick={() => switchView('feed')}
              >
                <Icon src={icons.rows} className={view === 'feed' ? 'icon--strong' : 'icon--subtle'} />
              </button>
            </div>
          </div>
        </div>

        <div className="bottombar-side bottombar-side--right">
          <p className="legal">{profile.footerHandle} | {profile.footerNote}</p>
        </div>
      </footer>

      {study && (
        <CasePage study={study} zoom={pageZoom} closing={caseClosing} onClose={closeCase} />
      )}
    </div>
  );
}
