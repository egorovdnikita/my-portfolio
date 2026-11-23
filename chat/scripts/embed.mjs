// Пересчитывает векторы базы: все формулировки вопросов из chat/kb/*.json и примеры запретных тем.
// Запускать после каждого изменения базы: npm run embed
// Нужны CLOUDFLARE_ACCOUNT_ID и CLOUDFLARE_API_TOKEN (права Workers AI: Read) в окружении — не в репозитории.
import { readFileSync, writeFileSync } from 'node:fs';
import { FORBIDDEN_EXAMPLES } from '../src/logic.ts';

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

const round = (v) => v.map((x) => Math.round(x * 1e5) / 1e5);
const cases = {};
for (const file of ['cashier', 'design-system']) {
  const kb = JSON.parse(readFileSync(new URL(`../kb/${file}.json`, import.meta.url), 'utf8'));
  cases[kb.caseId] = {};
  for (const entry of kb.entries) cases[kb.caseId][entry.id] = (await embed(entry.questions)).map(round);
  console.log(`${file}: ${kb.entries.length} записей`);
}
const forbidden = (await embed(FORBIDDEN_EXAMPLES)).map(round);
writeFileSync(new URL('../kb/vectors.json', import.meta.url), JSON.stringify({ model: MODEL, cases, forbidden }));
console.log('kb/vectors.json обновлён');
