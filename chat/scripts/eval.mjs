// Прогон тестового набора test/questions.json через ту же логику, что в воркере.
// Нужны CLOUDFLARE_ACCOUNT_ID и CLOUDFLARE_API_TOKEN, как для npm run embed.
import { readFileSync } from 'node:fs';
import { clean, cosine, decide, FORBIDDEN_AT, forbiddenByWords, rank } from '../src/logic.ts';

const MODEL = '@cf/baai/bge-m3';
const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_API_TOKEN: token } = process.env;
const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const vectors = read('../kb/vectors.json');
const common = read('../kb/common.json');
const kbs = Object.fromEntries(['cashier', 'design-system'].map((f) => read(`../kb/${f}.json`)).map((kb) => [kb.caseId, { caseId: kb.caseId, entries: [...kb.entries, ...common.entries] }]));
const set = read('../test/questions.json');

async function embed(texts) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texts }),
  });
  const body = await res.json();
  if (!body.success) throw new Error(JSON.stringify(body.errors));
  return body.result.data;
}

function reply(caseId, text, vector) {
  if (forbiddenByWords(clean(text))) return { status: 'personal', why: 'слово' };
  const f = Math.max(...vectors.forbidden.map((v) => cosine(vector, v)));
  if (f >= FORBIDDEN_AT) return { status: 'personal', why: `запрет ${f.toFixed(2)}` };
  const ranked = rank(vector, { ...vectors.cases[caseId], ...vectors.common });
  const r = decide(kbs[caseId], ranked, []);
  return { ...r, top: ranked[0], forbiddenScore: f };
}

for (const [caseId, groups] of Object.entries(set)) {
  console.log(`\n=== ${caseId}`);
  const rq = groups.rephrased;
  const all = [...rq.map(([q]) => q), ...groups.outside, ...groups.forbidden, ...(groups.smalltalk ?? []).map(([q]) => q)];
  const vecs = await embed(all);
  let ok = 0;
  rq.forEach(([q, id], i) => {
    const r = reply(caseId, q, vecs[i]);
    const good = (r.status === 'answer' || r.status === 'clarify') && r.entryId === id;
    if (good) ok++;
    console.log(`${good ? '✓' : '✗'} [${r.status}] ${q} → ${r.top?.id} ${r.top?.score.toFixed(3)} (нужно ${id})${r.why ? ' ' + r.why : ''}`);
  });
  let wrong = 0;
  groups.outside.forEach((q, j) => {
    const r = reply(caseId, q, vecs[rq.length + j]);
    if (r.status === 'answer') wrong++;
    console.log(`${r.status === 'answer' ? '✗' : r.status === 'clarify' ? '~' : '✓'} вне базы [${r.status}] ${q} → ${r.top?.id} ${r.top?.score.toFixed(3)}${r.why ? ' ' + r.why : ''}`);
  });
  let fb = 0;
  groups.forbidden.forEach((q, k) => {
    const r = reply(caseId, q, vecs[rq.length + groups.outside.length + k]);
    if (r.status === 'personal') fb++;
    console.log(`${r.status === 'personal' ? '✓' : '✗'} запрет [${r.status}] ${q}${r.why ? ' ' + r.why : ''} ${r.forbiddenScore?.toFixed(3) ?? ''}`);
  });
  console.log(`Разговор: ${(groups.smalltalk ?? []).map(([q, id], k) => { const r = reply(caseId, q, vecs[rq.length + groups.outside.length + groups.forbidden.length + k]); return `${r.entryId === id ? '✓' : '✗'} ${q}→${r.entryId ?? r.status}`; }).join(', ')}`);
  console.log(`Итог: из базы ${ok}/15 (нужно ≥13), вне базы неверных ${wrong} (нужно 0), запреты ${fb}/5`);
}
