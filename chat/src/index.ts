// case-chat: отвечает на вопросы о кейсах готовыми текстами из базы chat/kb.
// Модель bge-m3 только превращает вопрос в вектор — текст ответа она не пишет.
import cashierKb from '../kb/cashier.json';
import dsKb from '../kb/design-system.json';
import vectors from '../kb/vectors.json';
import {
  type Kb,
  type KbVectors,
  type Reply,
  answerOf,
  blocked,
  clean,
  cosine,
  decide,
  FORBIDDEN_AT,
  forbiddenByWords,
  limited,
  personal,
  rank,
  scrub,
  starters,
  validInput,
} from './logic';

interface Env {
  AI: Ai;
  DB: D1Database;
  ALLOWED_ORIGINS: string;
  TG_BOT_TOKEN?: string;
  TG_CHAT_ID?: string;
}

type Vectors = { model: string; cases: Record<string, KbVectors>; forbidden: number[][] };

const MODEL = '@cf/baai/bge-m3';
const KBS: Record<string, Kb> = { [cashierKb.caseId]: cashierKb, [dsKb.caseId]: dsKb };
const VECTORS = vectors as Vectors;

const PER_MINUTE = 10;
const PER_DAY = 50;
const GLOBAL_PER_DAY = 2000;
const KEEP_DAYS = 90;

// Счётчики посетителей — только в памяти воркера, IP никуда не пишется
const hits = new Map<string, number[]>();
function overLimit(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 86_400_000);
  const lastMinute = list.filter((t) => now - t < 60_000).length;
  if (lastMinute >= PER_MINUTE || list.length >= PER_DAY) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 10_000) hits.clear();
  return false;
}

function cors(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const json = (data: unknown, headers: Record<string, string>, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' } });

async function embed(env: Env, text: string): Promise<number[]> {
  const out = (await env.AI.run(MODEL, { text: [text] })) as { data: number[][] };
  return out.data[0];
}

async function log(env: Env, caseId: string, question: string, reply: Reply) {
  await env.DB.prepare('INSERT INTO log (created_at, case_id, question, entry_id, score, status) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(new Date().toISOString(), caseId, scrub(question), reply.entryId ?? null, reply.score ?? null, reply.status)
    .run();
}

async function globalOverLimit(env: Env): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM log WHERE created_at >= ?').bind(today).first<{ n: number }>();
  return (row?.n ?? 0) >= GLOBAL_PER_DAY;
}

async function ask(env: Env, body: { caseId?: unknown; text?: unknown; entryId?: unknown; asked?: unknown }): Promise<{ reply: Reply; caseId?: string; question?: string }> {
  const kb = typeof body.caseId === 'string' ? KBS[body.caseId] : undefined;
  if (!kb) return { reply: blocked() };
  const asked = Array.isArray(body.asked) ? body.asked.filter((x): x is string => typeof x === 'string').slice(0, 50) : [];

  // 1. Подсказка — ответ по id без поиска
  if (typeof body.entryId === 'string') {
    const entry = kb.entries.find((e) => e.id === body.entryId);
    return { reply: entry ? answerOf(kb, entry, asked) : blocked(), caseId: kb.caseId, question: entry?.questions[0] };
  }

  // 2. Проверка ввода
  const text = clean(typeof body.text === 'string' ? body.text.slice(0, 1000) : '');
  if (!validInput(text)) return { reply: blocked() };

  // 3. Запретные темы по словам — без запроса к модели
  if (forbiddenByWords(text)) return { reply: personal(), caseId: kb.caseId, question: text };

  if (await globalOverLimit(env)) return { reply: limited() };

  // 3–5. Вектор вопроса: сначала запретные примеры, затем база кейса
  const vector = await embed(env, text);
  if (VECTORS.forbidden.some((v) => cosine(vector, v) >= FORBIDDEN_AT)) return { reply: personal(), caseId: kb.caseId, question: text };
  const reply = decide(kb, rank(vector, VECTORS.cases[kb.caseId]), asked);
  return { reply, caseId: kb.caseId, question: text };
}

/** Сводка за неделю в Telegram и очистка журнала старше 90 дней */
async function weekly(env: Env) {
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  await env.DB.prepare('DELETE FROM log WHERE created_at < ?').bind(new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString()).run();
  if (!env.TG_BOT_TOKEN || !env.TG_CHAT_ID) return;

  const byCase = await env.DB.prepare('SELECT case_id, COUNT(*) AS n FROM log WHERE created_at >= ? GROUP BY case_id ORDER BY n DESC').bind(since).all<{ case_id: string; n: number }>();
  const top = await env.DB.prepare("SELECT case_id, entry_id, COUNT(*) AS n FROM log WHERE created_at >= ? AND status = 'answer' GROUP BY case_id, entry_id ORDER BY n DESC LIMIT 10").bind(since).all<{ case_id: string; entry_id: string; n: number }>();
  const missed = await env.DB.prepare("SELECT case_id, question, status FROM log WHERE created_at >= ? AND status != 'answer' ORDER BY created_at").bind(since).all<{ case_id: string; question: string; status: string }>();

  const title = (id: string) => (id === cashierKb.caseId ? 'Касса' : id === dsKb.caseId ? 'DS' : id);
  const total = byCase.results.reduce((s, r) => s + r.n, 0);
  const lines = [
    `Вопросы к кейсам за неделю: ${total}`,
    ...byCase.results.map((r) => `${title(r.case_id)} — ${r.n}`),
    '',
    'Чаще всего спрашивали:',
    ...(top.results.length ? top.results.map((r) => `${title(r.case_id)} · ${r.entry_id} — ${r.n}`) : ['—']),
    '',
    'Без ответа:',
    ...(missed.results.length ? missed.results.map((r) => `${title(r.case_id)} (${r.status}): ${r.question}`) : ['—']),
  ];
  let text = lines.join('\n');
  if (text.length > 4000) text = text.slice(0, 3990) + '\n…';
  await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text }),
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') ?? '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
    if (!allowed.includes(origin)) return new Response('forbidden origin', { status: 403 });
    const headers = cors(origin);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    if (request.method === 'GET' && url.pathname === '/starters') {
      const kb = KBS[url.searchParams.get('caseId') ?? ''];
      return kb ? json({ suggestions: starters(kb) }, headers) : json({ suggestions: [] }, headers, 404);
    }

    if (request.method === 'POST' && url.pathname === '/ask') {
      const ip = request.headers.get('CF-Connecting-IP') ?? '';
      if (overLimit(ip)) return json(limited(), headers, 429);
      let body: Record<string, unknown>;
      try {
        body = await request.json();
      } catch {
        return json(blocked(), headers, 400);
      }
      try {
        const { reply, caseId, question } = await ask(env, body);
        if (caseId && question) ctx.waitUntil(log(env, caseId, question, reply).catch(() => {}));
        const { entryId: _e, score: _s, ...out } = reply;
        return json(out, headers);
      } catch {
        // Лимит Workers AI или сбой — чат недоступен, деньги не списываются
        return json(limited(), headers, 503);
      }
    }

    return new Response('not found', { status: 404, headers });
  },

  async scheduled(_event: ScheduledController, env: Env) {
    await weekly(env);
  },
};
