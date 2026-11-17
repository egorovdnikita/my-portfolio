// Раскладка холста в координатах макета (кадр 1920×1080).
// x, y — точка привязки карточки, ax — доля ширины слева от точки (0 — левый край, 0.5 — центр, 1 — правый).
// По вертикали точка привязки всегда в центре карточки.

export const WORLD = { width: 1920, height: 1080 };

export type NodeId = 'exp' | 'vibe' | 'hero' | 'p1' | 'p2' | 'p3' | 'p4' | 's1' | 's2' | 's3';

export const NODES: Record<NodeId, { x: number; y: number; ax: number }> = {
  exp: { x: 80, y: 312, ax: 0 },
  vibe: { x: 136, y: 736, ax: 0 }, // карточка 382px, правый край как раньше
  hero: { x: 960.5, y: 540, ax: 0.5 },
  // Кейсы с обложками 450×506 стоят как в макете: левый край и центр по вертикали
  p1: { x: 1416, y: 98 + 506 / 2, ax: 0 },
  p2: { x: 1500, y: 643 + 506 / 2, ax: 0 },
  // Все кейсы связаны с главной карточкой веером, линии не проходят под другими карточками.
  // Базис — над первым кейсом, Лицей — под вторым, с зазором 94px (компактные карточки: 238 и 220px высотой)
  // и тем же сдвигом 28px по горизонтали, что был до обложек
  p3: { x: 1416 + 28, y: 98 - 94 - 238 / 2, ax: 0 },
  p4: { x: 1500 - 28, y: 643 + 506 + 94 + 220 / 2, ax: 0 },
  // Новые карточки: позиции относительно первого кейса в макете, без связей.
  s1: { x: 1194 + 859.0553588867188, y: -110.5 + 16.010597229003906 + 225, ax: 0 },
  s2: { x: 1194 + 1347.4727783203125, y: -110.5 + 33.591773986816406 + 225, ax: 0 },
  s3: { x: 1194 + 1162.5052490234375, y: -110.5 + 510.88037109375 + 225, ax: 0 },
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
  /** Связь вниз выходит не из центра карточки, а на уровне текстового блока — как в макете */
  low?: boolean;
  /** Сдвиг точки старта по вертикали, чтобы связи с одной стороны не выходили из одной точки */
  dy?: number;
  /** Сдвиг точки старта по горизонтали: плюс — наружу от карточки, минус — внутрь (на пустое поле у фото) */
  dx?: number;
};

export const EDGES: Edge[] = [
  // Точки старта разбросаны по вертикали и горизонтали, чтобы связи не выходили ровным столбиком
  { from: 'hero', to: 'exp', side: 'left', dot: true, dx: -36 },
  { from: 'hero', to: 'vibe', side: 'left', dot: true, low: true, dx: 18 },
  { from: 'hero', to: 'p1', side: 'right', dot: true, dx: 14 },
  { from: 'hero', to: 'p2', side: 'right', dot: true, low: true, dx: 28 },
  { from: 'hero', to: 'p3', side: 'right', dot: true, dy: -74, dx: -44 },
  { from: 'hero', to: 'p4', side: 'right', dot: true, low: true, dy: 38, dx: -12 },
];

export type Vec = { x: number; y: number };
export type Size = { w: number; h: number };
export type Rect = { left: number; top: number; right: number; bottom: number; cy: number };
export type Camera = { x: number; y: number; z: number };

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;
export const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

// На телефоне главная карточка вертикальная и уже десктопной (359 вместо 693px):
// боковые карточки придвигаются на разницу, чтобы зазоры остались как на десктопе
const COMPACT_SHIFT = (693 - 359) / 2;
const LEFT_SIDE: NodeId[] = ['exp', 'vibe'];

export function nodePos(id: NodeId, compact = false) {
  const n = NODES[id];
  if (!compact || id === 'hero') return n;
  const dx = LEFT_SIDE.includes(id) ? COMPACT_SHIFT : -COMPACT_SHIFT;
  return { ...n, x: n.x + dx };
}

export function nodeRect(id: NodeId, size: Size, offset: Vec, compact = false): Rect {
  const n = nodePos(id, compact);
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
 * Десктоп: как у референса, ближе обычного — 120% на 1920, меньше на узких и низких экранах.
 * Телефон: вертикальная карточка целиком между шапкой и нижней панелью (размер карточки измеряется).
 */
export function initialCamera(vw: number, vh: number, hero?: Size): Camera {
  const h = NODES.hero;
  if (vw <= MOBILE_MAX) {
    const size = hero ?? { w: 359, h: 640 };
    const avail = vh - TOP_UI - BOTTOM_UI;
    // Чуть дальше, чем во всю ширину: по бокам видны соседние карточки
    const z = clampZoom(Math.min((vw - 16) / size.w, avail / size.h, 1) * 0.85);
    // По центру между шапкой (низ на 96px) и нижней панелью (верх в 80px от низа).
    // У фото прозрачный верх ~14px — центрируем видимую часть
    const PHOTO_EMPTY_TOP = 14;
    const cy = (TOP_UI + vh - 80) / 2;
    return { x: vw / 2 - h.x * z, y: cy - (h.y + PHOTO_EMPTY_TOP / 2) * z, z };
  }
  // Ближе обычного, но карточка целиком между шапкой и нижней панелью — кнопки не заходят под панель
  const size = hero ?? { w: 457, h: 556 };
  const avail = vh - TOP_UI - BOTTOM_UI;
  const z = clampZoom(Math.min(1.2, Math.max(0.6, vw / 1600), avail / size.h));
  const cy = TOP_UI + avail / 2;
  return { x: vw / 2 - h.x * z, y: cy - h.y * z, z };
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
export const ARROW_LEN = 8; // длина наконечника
// Линия обрывается у основания наконечника (с заходом 1px под него), чтобы не торчать на кончике

/** Плавная связь с горизонтальными касательными, как у connector в Figma. */
export function edgeGeometry(edge: Edge, from: Rect, to: Rect, lowY?: number, compact = false) {
  const dir = edge.side === 'right' ? 1 : -1;
  // На телефоне карточка уже и фото почти у края — внутрь точки не сдвигаем, чтобы не лечь на фото
  const dx = compact ? Math.max(0, edge.dx ?? 0) : (edge.dx ?? 0);
  const sx = (dir === 1 ? from.right + START_GAP.right : from.left - START_GAP.left) + dir * dx;
  const sy = edge.alignToTarget
    ? Math.min(from.bottom - 24, Math.max(from.top + 24, to.cy))
    : edge.low && lowY !== undefined
      ? from.top + lowY + (edge.dy ?? 0)
      : from.cy + (edge.dy ?? 0);
  const tx = dir === 1 ? to.left - ARROW_GAP : to.right + ARROW_GAP;
  const ty = to.cy;
  const lx = tx - dir * (ARROW_LEN - 1);
  const k = Math.max(32, Math.abs(lx - sx) / 2);
  const path = `M ${sx} ${sy} C ${sx + dir * k} ${sy}, ${lx - dir * k} ${ty}, ${lx} ${ty}`;
  return { path, start: { x: sx, y: sy }, end: { x: tx, y: ty }, dir };
}
