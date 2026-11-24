// Логика бота без Cloudflare: node --test test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clean, decide, forbiddenByWords, rank, scrub, starters, validInput, type Kb } from '../src/logic.ts';

const load = (f: string): Kb => JSON.parse(readFileSync(new URL(`../kb/${f}.json`, import.meta.url), 'utf8'));
const kbs = [load('cashier'), load('design-system')];
const common = load('common');

test('база: id уникальны, связи существуют, 3 стартовых, ответы короткие', () => {
  for (const kb of kbs) {
    const ids = new Set(kb.entries.map((e) => e.id));
    assert.equal(ids.size, kb.entries.length);
    assert.equal(starters(kb).length, 3);
    for (const e of kb.entries) {
      assert.ok(e.questions.length >= 3 && e.questions.length <= 10, e.id);
      assert.ok(e.answer.length >= 1 && e.answer.length <= 3, e.id);
      assert.ok(e.related.length <= 2 && e.related.every((r) => ids.has(r) && r !== e.id), e.id);
      for (const v of [e.answer, ...(e.variants ?? [])]) {
        assert.ok(v.length >= 1 && v.length <= 3, e.id);
        for (const a of v) assert.ok(a.length <= 52, `${e.id}: ${a}`);
      }
      for (const t of [...e.answer, ...(e.variants ?? []).flat(), ...e.questions]) assert.ok(!/1win|jetton|tonplay/i.test(t), `${e.id}: бренд`);
    }
  }
});

test('ввод: пустой, длинный и без букв отклоняются; HTML вычищается', () => {
  assert.equal(validInput(''), false);
  assert.equal(validInput('123 ???'), false);
  assert.equal(validInput('а'.repeat(201)), false);
  assert.equal(validInput('Что в итоге?'), true);
  assert.equal(clean('<b>Привет</b>\u0000  мир'), 'Привет мир');
});

test('запретные темы по словам', () => {
  for (const q of ['Какая зарплата?', 'Сколько зарабатываешь', 'Это 1win?', 'В какой компании работаешь?', 'Как с коллегами?', 'Это этично?', 'Казино же']) {
    assert.ok(forbiddenByWords(q), q);
  }
  for (const q of ['Как платёж доходит без сверки?', 'Что в итоге?', 'Какие три слоя библиотек?', 'Кто вёл тест?', 'Как называется слой с токенами?']) {
    assert.ok(!forbiddenByWords(q), q);
  }
});

test('пороги: ≥0.75 ответ, 0.60–0.75 уточнение, ниже — лично', () => {
  const kb = kbs[0];
  const ans = decide(kb, [{ id: 'unique-amount', score: 0.8 }], [], () => 0);
  assert.equal(ans.status, 'answer');
  assert.deepEqual(ans.messages, kb.entries.find((e) => e.id === 'unique-amount')!.answer);
  assert.ok(ans.suggestions.length <= 2 && ans.suggestions.every((s) => s.id !== 'unique-amount'));

  // близко, но не уверенно — вступление и ответ ближайшей записи
  const cl = decide(kb, [{ id: 'goal', score: 0.7 }, { id: 'growth-proof', score: 0.65 }], [], () => 0);
  assert.equal(cl.status, 'clarify');
  assert.equal(cl.entryId, 'goal');
  assert.deepEqual(cl.messages.slice(1), kb.entries.find((e) => e.id === 'goal')!.answer);

  assert.equal(decide(kb, [{ id: 'goal', score: 0.69 }], []).status, 'personal');

  // варианты ответа выбираются случайно, но только из базы
  const e = kb.entries.find((x) => x.id === 'unique-amount')!;
  assert.deepEqual(decide(kb, [{ id: e.id, score: 0.9 }], [], () => 0.99).messages, e.variants!.at(-1));
});

test('общие записи: короткие ответы без брендов', () => {
  for (const e of common.entries) for (const v of [e.answer, ...(e.variants ?? [])]) for (const a of v) assert.ok(a.length <= 52 && !/1win/i.test(a), a);
});

test('ранжирование по косинусу', () => {
  const r = rank([1, 0], { a: [[0, 1]], b: [[1, 0.1], [0, 1]] });
  assert.equal(r[0].id, 'b');
});

test('журнал: телефоны, почта и ссылки скрыты', () => {
  const s = scrub('пиши на me@mail.ru или +7 999 123-45-67, https://t.me/x и @nick, site.ru');
  assert.ok(!/mail\.ru|999|t\.me|@nick|site\.ru/.test(s), s);
  assert.ok(s.includes('[скрыто]'));
});
