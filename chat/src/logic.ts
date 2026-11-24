// Логика бота без зависимостей от Cloudflare: проверки, запретные темы, выбор ответа по близости.
// Бот ничего не генерирует — только отдаёт готовые ответы из базы.

/** answer и variants — разные формулировки одного ответа, бот берёт случайную; draft — додумано, ждёт проверки Никиты */
export type Entry = { id: string; questions: string[]; answer: string[]; variants?: string[][]; related: string[]; starter: boolean; draft?: boolean; common?: boolean };
export type Kb = { caseId: string; entries: Entry[] };
/** Векторы формулировок: для каждой записи — по вектору на вопрос, в том же порядке */
export type KbVectors = Record<string, number[][]>;

export type Status = 'answer' | 'clarify' | 'personal' | 'blocked' | 'limited';
export type Suggestion = { id: string; text: string };
export type Reply = { status: Status; messages: string[]; suggestions: Suggestion[]; entryId?: string; score?: number };

export const MAX_LEN = 200;
export const ANSWER_AT = 0.75;
/** Ниже — «спросите лично»: на посторонние вопросы (учёба, хобби) близость доходит до 0,68 */
export const CLARIFY_AT = 0.7;
/** Похожесть на пример запретной темы, с которой вопрос уходит в «спросите лично» */
export const FORBIDDEN_AT = 0.72;

export const TEXT = {
  personal: ['Это лучше спросить меня лично', 'Тут лучше напишите мне — отвечу подробно', 'Об этом расскажу лично'],
  /** Вступление, когда вопрос близок к записи, но не уверенно: бот отвечает по ближайшей теме */
  clarify: ['Если я правильно понял:', 'Расскажу, что знаю об этом:', 'Близко к этому могу сказать так:'],
  limited: ['Чат сейчас недоступен'],
  blocked: ['Не понял вопрос — сформулируйте иначе', 'Сформулируйте вопрос чуть иначе?'],
};

export type Rng = () => number;
const pick = <T>(list: T[], rng: Rng): T => list[Math.floor(rng() * list.length) % list.length];
/** Одна из формулировок ответа записи */
export const answerText = (e: Entry, rng: Rng = Math.random): string[] => pick([e.answer, ...(e.variants ?? [])], rng);

/** Убирает HTML и управляющие символы, схлопывает пробелы */
export function clean(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Пустой, слишком длинный или без букв — отказ без запроса к модели */
export function validInput(text: string): boolean {
  return text.length > 0 && text.length <= MAX_LEN && /\p{L}/u.test(text);
}

// Запретные темы: зарплата и офферы, названия брендов и компании, команда и коллеги, этика iGaming.
// Слова ищутся по началу слова, регистр не важен.
const FORBIDDEN_WORDS = [
  'зарплат', 'зп', 'оклад', 'оффер', 'офер', 'вилк', 'сколько получа', 'сколько зарабат', 'salary', 'offer',
  '1win', 'ванвин', 'jetton', 'tonplay', 'назови компан', 'назови бренд', 'название компан', 'название бренд', 'название продукт',
  'какая компан', 'какой компан', 'в какой компан', 'где работа', 'работодател', 'company',
  'коллег', 'тимлид', 'ладил', 'ладишь', 'поладил', 'отношения в команде', 'отношения с', 'руководител', 'начальник', 'конфликт', 'уволи', 'увольн', 'атмосфер',
  'этик', 'этичн', 'мораль', 'казино', 'азарт', 'гемблинг', 'лудоман', 'зависимост', 'букмекер', 'gambling', 'casino',
];
// В словах нет спецсимволов регулярных выражений, поэтому их можно склеить как есть
const WORD_RE = new RegExp('(^|[^\\p{L}\\d])(' + FORBIDDEN_WORDS.join('|') + ')', 'iu');

export function forbiddenByWords(text: string): boolean {
  return WORD_RE.test(text);
}

/** Примеры вопросов на запретные темы — с ними сравнивается вектор вопроса */
export const FORBIDDEN_EXAMPLES = [
  'Сколько ты зарабатываешь?',
  'Какая у тебя зарплата?',
  'Какой оффер ты ждёшь?',
  'В какой компании ты работаешь?',
  'Как называется продукт?',
  'Назови бренд',
  'Какие отношения в команде?',
  'Что ты думаешь о своём руководителе?',
  'Почему ушли коллеги?',
  'Как ты ладил с руководителем?',
  'Были ли споры с лидом?',
  'Нормально ли работать в азартных играх?',
  'Тебе не стыдно делать казино?',
  'Это этично — помогать людям проигрывать деньги?',
];

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/** Лучшая близость вопроса к каждой записи, по убыванию */
export function rank(vector: number[], vectors: KbVectors): { id: string; score: number }[] {
  return Object.entries(vectors)
    .map(([id, list]) => ({ id, score: Math.max(...list.map((v) => cosine(vector, v))) }))
    .sort((a, b) => b.score - a.score);
}

const suggestion = (e: Entry): Suggestion => ({ id: e.id, text: e.questions[0] });

/** До двух связанных вопросов, кроме уже заданных */
export function relatedOf(kb: Kb, entry: Entry, asked: string[]): Suggestion[] {
  return entry.related
    .filter((id) => !asked.includes(id))
    .map((id) => kb.entries.find((e) => e.id === id))
    .filter((e): e is Entry => !!e)
    .slice(0, 2)
    .map(suggestion);
}

export function starters(kb: Kb): Suggestion[] {
  return kb.entries.filter((e) => e.starter).slice(0, 3).map(suggestion);
}

export function answerOf(kb: Kb, entry: Entry, asked: string[], score?: number, rng: Rng = Math.random): Reply {
  return { status: 'answer', messages: answerText(entry, rng), suggestions: relatedOf(kb, entry, [...asked, entry.id]), entryId: entry.id, score };
}

export const personal = (score?: number, rng: Rng = Math.random): Reply => ({ status: 'personal', messages: [pick(TEXT.personal, rng)], suggestions: [], score });
export const limited = (): Reply => ({ status: 'limited', messages: [TEXT.limited[0]], suggestions: [] });
export const blocked = (rng: Rng = Math.random): Reply => ({ status: 'blocked', messages: [pick(TEXT.blocked, rng)], suggestions: [] });

/** Решение по близости: уверенно — ответ; близко — ответ по ближайшей теме со вступлением; иначе — «спросите лично» */
export function decide(kb: Kb, ranked: { id: string; score: number }[], asked: string[], rng: Rng = Math.random): Reply {
  const best = ranked[0];
  if (!best || best.score < CLARIFY_AT) return personal(best?.score, rng);
  const entry = kb.entries.find((e) => e.id === best.id)!;
  if (best.score >= ANSWER_AT) return answerOf(kb, entry, asked, best.score, rng);
  return { status: 'clarify', messages: [pick(TEXT.clarify, rng), ...answerText(entry, rng)], suggestions: [], entryId: best.id, score: best.score };
}

/** Телефоны, e-mail и ссылки — в [скрыто] перед записью в журнал */
export function scrub(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[скрыто]')
    .replace(/(https?:\/\/|www\.)\S+/gi, '[скрыто]')
    .replace(/\b[\w-]+\.(ru|com|net|org|io|me|dev|app|рф)(\/\S*)?/gi, '[скрыто]')
    .replace(/@[\w_]{3,}/g, '[скрыто]')
    .replace(/\+?\d[\d\s()\-]{7,}\d/g, '[скрыто]');
}
