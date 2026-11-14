// Раскладка холста в координатах макета (кадр 1920×1080).
// x, y — точка привязки карточки, ax — доля ширины слева от точки (0 — левый край, 0.5 — центр, 1 — правый).
// По вертикали точка привязки всегда в центре карточки.

export const WORLD = { width: 1920, height: 1080 };

export type NodeId = 'exp' | 'vibe' | 'hero' | 'p1' | 'p2' | 'p3' | 'p4';

export const NODES: Record<NodeId, { x: number; y: number; ax: number }> = {
  exp: { x: 80, y: 312, ax: 0 },
  vibe: { x: 154, y: 736, ax: 0 },
  hero: { x: 960.5, y: 540, ax: 0.5 },
  p1: { x: 1619, y: 327, ax: 0.5 },
  p2: { x: 1872, y: 802, ax: 1 },
  // Все кейсы связаны с главной карточкой веером, линии не проходят под другими карточками.
  // 1win и Wink стоят как в макете, Базис — выше 1win, Лицей — ниже Wink, с тем же шагом 475px
  p3: { x: 1422, y: -148, ax: 0 },
  p4: { x: 1394, y: 1277, ax: 0 },
};

export type Edge = {
  from: NodeId;
  to: NodeId;
  /** С какой стороны выходит связь и входит в цель */
  side: 'left' | 'right';
  /** Выход на уровне цели (как связь между кейсами в макете), а не из центра стороны */
  alignToTarget?: boolean;
  /** Точка на старте связи (в макете есть только у главной карточки) */
  dot?: boolean;
};

export const EDGES: Edge[] = [
  { from: 'hero', to: 'exp', side: 'left', dot: true },
  { from: 'hero', to: 'vibe', side: 'left', dot: true },
  { from: 'hero', to: 'p1', side: 'right', dot: true },
  { from: 'hero', to: 'p2', side: 'right', dot: true },
  { from: 'hero', to: 'p3', side: 'right', dot: true },
  { from: 'hero', to: 'p4', side: 'right', dot: true },
];

export type Vec = { x: number; y: number };
export type Size = { w: number; h: number };
export type Rect = { left: number; top: number; right: number; bottom: number; cy: number };
export type Camera = { x: number; y: number; z: number };

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;
export const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export function nodeRect(id: NodeId, size: Size, offset: Vec): Rect {
  const n = NODES[id];
  const left = n.x - n.ax * size.w + offset.x;
  const top = n.y - size.h / 2 + offset.y;
  return { left, top, right: left + size.w, bottom: top + size.h, cy: top + size.h / 2 };
}

/** Камера, при которой кадр макета целиком помещается в окно (на 1920×1080 — ровно 100%). */
export function fitCamera(vw: number, vh: number): Camera {
  const z = Math.min(1, vw / WORLD.width, vh / WORLD.height);
  return { x: vw / 2 - (WORLD.width / 2) * z, y: vh / 2 - (WORLD.height / 2) * z, z };
}

export const MOBILE_MAX = 767;
const TOP_UI = 96; // шапка
const BOTTOM_UI = 96; // нижняя панель

/**
 * Стартовый кадр — фокус на карточке «обо мне».
 * Десктоп: как у референса, ближе обычного — 120% на 1920, меньше на узких экранах.
 * Телефон: вертикальная карточка целиком между шапкой и нижней панелью (размер карточки измеряется).
 */
export function initialCamera(vw: number, vh: number, hero?: Size): Camera {
  const h = NODES.hero;
  if (vw <= MOBILE_MAX) {
    const size = hero ?? { w: 359, h: 640 };
    const avail = vh - TOP_UI - BOTTOM_UI;
    const z = clampZoom(Math.min((vw - 16) / size.w, avail / size.h, 1));
    const cy = TOP_UI + avail / 2;
    return { x: vw / 2 - h.x * z, y: cy - h.y * z, z };
  }
  const z = clampZoom(Math.min(1.2, Math.max(0.6, vw / 1600)));
  return { x: vw / 2 - h.x * z, y: vh / 2 - h.y * z, z };
}

/** Масштабирование вокруг точки экрана (курсора или центра окна). */
export function zoomAt(cam: Camera, nextZ: number, sx: number, sy: number): Camera {
  const z = clampZoom(nextZ);
  const wx = (sx - cam.x) / cam.z;
  const wy = (sy - cam.y) / cam.z;
  return { x: sx - wx * z, y: sy - wy * z, z };
}

// Отступ старта связи от карточки: в макете левая точка на 4px снаружи, правая ровно на краю
const START_GAP = { left: 4, right: 0 };
const ARROW_GAP = 6; // наконечник не касается карточки

/** Плавная связь с горизонтальными касательными, как у connector в Figma. */
export function edgeGeometry(edge: Edge, from: Rect, to: Rect) {
  const dir = edge.side === 'right' ? 1 : -1;
  const sx = dir === 1 ? from.right + START_GAP.right : from.left - START_GAP.left;
  const sy = edge.alignToTarget ? Math.min(from.bottom - 24, Math.max(from.top + 24, to.cy)) : from.cy;
  const tx = dir === 1 ? to.left - ARROW_GAP : to.right + ARROW_GAP;
  const ty = to.cy;
  const k = Math.max(32, Math.abs(tx - sx) / 2);
  const path = `M ${sx} ${sy} C ${sx + dir * k} ${sy}, ${tx - dir * k} ${ty}, ${tx} ${ty}`;
  return { path, start: { x: sx, y: sy }, end: { x: tx, y: ty }, dir };
}
