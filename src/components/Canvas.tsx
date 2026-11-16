import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  ARROW_LEN,
  EDGES,
  NODES,
  nodePos,
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
  /** Телефон: вертикальная главная карточка, боковые придвинуты */
  compact: boolean;
};

const INTERACTIVE = 'a, button, input, select, textarea, [role="menu"]';
// Точечная сетка масштабируется вместе с холстом, как у референса:
// шаг, радиус точки и её мягкий край умножаются на масштаб, поэтому при отдалении
// точки становятся мельче и бледнее, а не сливаются в серую массу

type Drag =
  | { kind: 'pan'; id: number; sx: number; sy: number; cam: Camera; moved: boolean }
  | { kind: 'pinch'; id: number; dist: number; mx: number; my: number; cam: Camera; moved: boolean }
  | { kind: 'node'; id: number; node: NodeId; sx: number; sy: number; start: Vec; moved: boolean };

export function Canvas({ camera, setCamera, offsets, setOffset, tool, spaceHeld, onInteract, nodes, compact }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Partial<Record<NodeId, HTMLDivElement>>>({});
  const [sizes, setSizes] = useState<Partial<Record<NodeId, Size>>>({});
  const [drag, setDrag] = useState<Drag | null>(null);
  // Все пальцы/курсоры на холсте: два пальца — щипок для масштаба
  const pointers = useRef(new Map<number, { x: number; y: number }>());

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
    // Safari на iPhone иначе масштабирует всю страницу вместо холста
    const stopGesture = (e: Event) => e.preventDefault();
    el.addEventListener('gesturestart', stopGesture);
    el.addEventListener('gesturechange', stopGesture);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('gesturestart', stopGesture);
      el.removeEventListener('gesturechange', stopGesture);
    };
  }, []);

  const panMode = tool === 'hand' || spaceHeld;

  const localPoint = (x: number, y: number) => {
    const r = viewportRef.current!.getBoundingClientRect();
    return { x: x - r.left, y: y - r.top };
  };

  const startPinch = () => {
    const [a, b] = [...pointers.current.values()];
    const m = localPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
    setDrag({ kind: 'pinch', id: -1, dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: m.x, my: m.y, cam: camera, moved: true });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    if (e.pointerType === 'touch') {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size === 2) {
        interactRef.current();
        e.currentTarget.setPointerCapture(e.pointerId);
        startPinch();
        return;
      }
    }
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
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (drag?.kind === 'pinch') {
      if (pointers.current.size < 2) return;
      const [a, b] = [...pointers.current.values()];
      const m = localPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      // Точка холста под пальцами остаётся под пальцами: масштаб вокруг середины + сдвиг вслед за ней
      const zoomed = zoomAt(drag.cam, drag.cam.z * (dist / drag.dist), drag.mx, drag.my);
      setCamera({ ...zoomed, x: zoomed.x + (m.x - drag.mx), y: zoomed.y + (m.y - drag.my) });
      return;
    }
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
    pointers.current.delete(e.pointerId);
    if (drag?.kind === 'pinch') {
      // Один палец остался — продолжаем двигать холст им
      const rest = [...pointers.current.entries()][0];
      setDrag(rest ? { kind: 'pan', id: rest[0], sx: rest[1].x, sy: rest[1].y, cam: camera, moved: true } : null);
      return;
    }
    if (drag && drag.id === e.pointerId) setDrag(null);
  };

  const rects = (Object.keys(NODES) as NodeId[]).reduce(
    (acc, id) => {
      const s = sizes[id];
      if (s) acc[id] = nodeRect(id, s, offsets[id], compact);
      return acc;
    },
    {} as Partial<Record<NodeId, ReturnType<typeof nodeRect>>>,
  );

  const cursor = drag?.kind === 'pan' && drag.moved ? 'grabbing' : panMode ? 'grab' : 'default';

  return (
    <div
      ref={viewportRef}
      className={`viewport${drag?.moved ? ' is-dragging' : ''}`}
      style={{
        cursor,
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
            const back = -g.dir * ARROW_LEN;
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
          const n = nodePos(id, compact);
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
              <div data-flip={id}>{nodes[id]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
