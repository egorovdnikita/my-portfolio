import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  EDGES,
  NODES,
  edgeGeometry,
  nodeRect,
  zoomAt,
  type Camera,
  type NodeId,
  type Size,
  type Vec,
} from '../canvas/layout';

export type Tool = 'select' | 'hand';

type Props = {
  camera: Camera;
  setCamera: (c: Camera) => void;
  offsets: Record<NodeId, Vec>;
  setOffset: (id: NodeId, v: Vec) => void;
  tool: Tool;
  spaceHeld: boolean;
  onInteract: () => void;
  nodes: Record<NodeId, ReactNode>;
};

const INTERACTIVE = 'a, button, input, select, textarea, [role="menu"]';
const DOT_STEP = 17.25; // шаг точечной сетки в макете

type Drag =
  | { kind: 'pan'; id: number; sx: number; sy: number; cam: Camera; moved: boolean }
  | { kind: 'node'; id: number; node: NodeId; sx: number; sy: number; start: Vec; moved: boolean };

export function Canvas({ camera, setCamera, offsets, setOffset, tool, spaceHeld, onInteract, nodes }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Partial<Record<NodeId, HTMLDivElement>>>({});
  const [sizes, setSizes] = useState<Partial<Record<NodeId, Size>>>({});
  const [drag, setDrag] = useState<Drag | null>(null);

  // Актуальные значения для обработчиков, которые вешаются один раз
  const camRef = useRef(camera);
  camRef.current = camera;
  const setCamRef = useRef(setCamera);
  setCamRef.current = setCamera;
  const interactRef = useRef(onInteract);
  interactRef.current = onInteract;

  // Размеры карточек нужны для связей; размер в мировых координатах не зависит от масштаба
  useLayoutEffect(() => {
    const measure = () => {
      const next: Partial<Record<NodeId, Size>> = {};
      for (const id of Object.keys(NODES) as NodeId[]) {
        const el = nodeRefs.current[id];
        if (el) next[id] = { w: el.offsetWidth, h: el.offsetHeight };
      }
      setSizes(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    Object.values(nodeRefs.current).forEach((el) => el && ro.observe(el));
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  // Колесо: прокрутка двигает холст, щипок / Ctrl+колесо масштабирует к курсору
  useEffect(() => {
    const el = viewportRef.current!;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('[role="menu"]')) return;
      e.preventDefault();
      interactRef.current();
      const cam = camRef.current;
      const scale = e.deltaMode === 1 ? 16 : 1;
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect();
        // Щипок трекпада даёт малые шаги, колесо мыши — по 100px; ограничиваем, чтобы шаг колеса был ~×1.2
        const delta = Math.max(-20, Math.min(20, e.deltaY * scale));
        const factor = Math.exp(-delta * 0.01);
        setCamRef.current(zoomAt(cam, cam.z * factor, e.clientX - rect.left, e.clientY - rect.top));
      } else {
        setCamRef.current({ ...cam, x: cam.x - e.deltaX * scale, y: cam.y - e.deltaY * scale });
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const panMode = tool === 'hand' || spaceHeld;

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    const target = e.target as HTMLElement;
    if (e.button === 0 && !spaceHeld && target.closest(INTERACTIVE)) return;
    const nodeEl = target.closest<HTMLElement>('[data-node]');
    interactRef.current();
    e.currentTarget.setPointerCapture(e.pointerId);
    if (!panMode && e.button === 0 && nodeEl) {
      const node = nodeEl.dataset.node as NodeId;
      setDrag({ kind: 'node', id: e.pointerId, node, sx: e.clientX, sy: e.clientY, start: offsets[node], moved: false });
    } else {
      setDrag({ kind: 'pan', id: e.pointerId, sx: e.clientX, sy: e.clientY, cam: camera, moved: false });
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 3) return;
    if (!drag.moved) setDrag({ ...drag, moved: true });
    if (drag.kind === 'pan') {
      setCamera({ ...drag.cam, x: drag.cam.x + dx, y: drag.cam.y + dy });
    } else {
      setOffset(drag.node, { x: drag.start.x + dx / camera.z, y: drag.start.y + dy / camera.z });
    }
  };

  const endDrag = (e: React.PointerEvent) => {
    if (drag && drag.id === e.pointerId) setDrag(null);
  };

  const rects = (Object.keys(NODES) as NodeId[]).reduce(
    (acc, id) => {
      const s = sizes[id];
      if (s) acc[id] = nodeRect(id, s, offsets[id]);
      return acc;
    },
    {} as Partial<Record<NodeId, ReturnType<typeof nodeRect>>>,
  );

  const cursor = drag?.kind === 'pan' && drag.moved ? 'grabbing' : panMode ? 'grab' : 'default';
  const dotStep = DOT_STEP * camera.z;

  return (
    <div
      ref={viewportRef}
      className={`viewport${drag?.moved ? ' is-dragging' : ''}`}
      style={{
        cursor,
        backgroundSize: `${dotStep}px ${dotStep}px`,
        backgroundPosition: `${camera.x}px ${camera.y}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDragStart={(e) => e.preventDefault()}
    >
      <div
        className="world"
        style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})` }}
      >
        <svg className="edges" width="1" height="1" aria-hidden>
          {EDGES.map((edge) => {
            const a = rects[edge.from];
            const b = rects[edge.to];
            if (!a || !b) return null;
            const g = edgeGeometry(edge, a, b);
            const tip = g.end;
            const back = -g.dir * 8;
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <path d={g.path} className="edge-line" />
                <path
                  d={`M ${tip.x} ${tip.y} L ${tip.x + back} ${tip.y - 4.5} L ${tip.x + back} ${tip.y + 4.5} Z`}
                  className="edge-arrow"
                />
                {edge.dot && <circle cx={g.start.x} cy={g.start.y} r={5} className="edge-dot" />}
              </g>
            );
          })}
        </svg>
        {(Object.keys(NODES) as NodeId[]).map((id) => {
          const n = NODES[id];
          const o = offsets[id];
          return (
            <div
              key={id}
              ref={(el) => {
                if (el) nodeRefs.current[id] = el;
              }}
              data-node={id}
              className={`node${drag?.kind === 'node' && drag.node === id && drag.moved ? ' is-lifted' : ''}`}
              style={{
                left: n.x + o.x,
                top: n.y + o.y,
                transform: `translate(${-n.ax * 100}%, -50%)`,
                cursor: panMode ? undefined : 'move',
              }}
            >
              {nodes[id]}
            </div>
          );
        })}
      </div>
    </div>
  );
}
