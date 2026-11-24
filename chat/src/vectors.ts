// Векторы базы в int8: kb/vectors.bin — все векторы подряд по DIM байт, kb/vectors.index.json — порядок.
// Порядок: кейсы → записи → формулировки, затем общие записи, затем примеры запретных тем.
// Так база в 4 раза меньше float и помещается в бесплатный тариф Workers.
import type { KbVectors } from './logic';

export type VectorIndex = {
  model: string;
  dim: number;
  cases: Record<string, Record<string, number>>;
  common: Record<string, number>;
  forbidden: number;
};
export type Vectors = { model: string; cases: Record<string, KbVectors>; common: KbVectors; forbidden: Int8Array[] };

/** Нормирует вектор и переводит в int8: косинус не зависит от масштаба, поэтому точность почти та же */
export function quantize(v: ArrayLike<number>): Int8Array {
  let n = 0;
  for (let i = 0; i < v.length; i++) n += v[i] * v[i];
  n = Math.sqrt(n) || 1;
  const out = new Int8Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = Math.max(-127, Math.min(127, Math.round((v[i] / n) * 127)));
  return out;
}

export function loadVectors(bin: ArrayBuffer | Uint8Array, index: VectorIndex): Vectors {
  const all = bin instanceof Uint8Array ? new Int8Array(bin.buffer, bin.byteOffset, bin.byteLength) : new Int8Array(bin);
  let at = 0;
  const take = (count: number) => Array.from({ length: count }, () => all.subarray(index.dim * at, index.dim * ++at));
  const group = (counts: Record<string, number>): KbVectors => Object.fromEntries(Object.entries(counts).map(([id, n]) => [id, take(n)]));
  const cases = Object.fromEntries(Object.entries(index.cases).map(([caseId, counts]) => [caseId, group(counts)]));
  const common = group(index.common);
  const forbidden = take(index.forbidden);
  if (at * index.dim !== all.length) throw new Error(`vectors.bin: ожидалось ${at * index.dim} байт, есть ${all.length}`);
  return { model: index.model, cases, common, forbidden };
}
