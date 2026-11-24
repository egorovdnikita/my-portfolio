// Пересчитывает векторы базы: все формулировки вопросов из chat/kb/*.json и примеры запретных тем.
// Запускать после каждого изменения базы: npm run embed
// Нужны CLOUDFLARE_ACCOUNT_ID и CLOUDFLARE_API_TOKEN (права Workers AI: Read) в окружении — не в репозитории.
import { readFileSync, writeFileSync } from 'node:fs';
import { FORBIDDEN_EXAMPLES } from '../src/logic.ts';
import { quantize } from '../src/vectors.ts';

const MODEL = '@cf/baai/bge-m3';
const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_API_TOKEN: token } = process.env;
if (!account || !token) {
  console.error('Нужны CLOUDFLARE_ACCOUNT_ID и CLOUDFLARE_API_TOKEN');
  process.exit(1);
}

async function embed(texts) {
  const out = [];
  for (let i = 0; i < texts.length; i += 50) {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: texts.slice(i, i + 50) }),
    });
    const body = await res.json();
    if (!body.success) throw new Error(JSON.stringify(body.errors));
    out.push(...body.result.data);
  }
  return out;
}

// Векторы в int8 подряд + индекс порядка (см. src/vectors.ts)
const parts = [];
const floats = []; // для сверки точности: FLOAT=1 npm run embed пишет ещё и vectors.float.json (в .gitignore)
const index = { model: MODEL, dim: 0, cases: {}, common: {}, forbidden: 0 };
const add = (list) => {
  for (const v of list) {
    index.dim ||= v.length;
    parts.push(quantize(v));
    floats.push(v);
  }
  return list.length;
};
for (const file of ['cashier', 'design-system']) {
  const kb = JSON.parse(readFileSync(new URL(`../kb/${file}.json`, import.meta.url), 'utf8'));
  index.cases[kb.caseId] = {};
  for (const entry of kb.entries) index.cases[kb.caseId][entry.id] = add(await embed(entry.questions));
  console.log(`${file}: ${kb.entries.length} записей`);
}
const commonKb = JSON.parse(readFileSync(new URL('../kb/common.json', import.meta.url), 'utf8'));
for (const entry of commonKb.entries) index.common[entry.id] = add(await embed(entry.questions));
console.log(`common: ${commonKb.entries.length} записей`);
index.forbidden = add(await embed(FORBIDDEN_EXAMPLES));
const bin = new Int8Array(parts.length * index.dim);
parts.forEach((v, i) => bin.set(v, i * index.dim));
writeFileSync(new URL('../kb/vectors.bin', import.meta.url), bin);
writeFileSync(new URL('../kb/vectors.index.json', import.meta.url), JSON.stringify(index));
if (process.env.FLOAT) writeFileSync(new URL('../kb/vectors.float.json', import.meta.url), JSON.stringify(floats));
console.log(`kb/vectors.bin обновлён: ${parts.length} векторов, ${(bin.length / 1048576).toFixed(2)} МБ`);
