import contributions from './data/contributions.json';

// Календарь вкладов: src/data/contributions.json, обновляется скриптом scripts/fetch-contributions.mjs при каждой сборке
const MONTHS = ['янв', 'февр', 'март', 'апр', 'май', 'июнь', 'июль', 'авг', 'сент', 'окт', 'нояб', 'дек'];
const MONTHS_OF = ['янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня', 'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
const DAY_MS = 86_400_000;

const MONTHS_SHOWN = 6;

// Сетка как у GitHub, но неделя с понедельника: столбец — неделя, строка — день.
// Показываем последние 6 месяцев: с недели, где лежит 1-е число месяца пять месяцев назад, до текущей.
// Дни после «сегодня» (на момент сборки) приглушены.
export const calendar = (() => {
  const start = Date.parse(`${contributions.start}T00:00:00Z`);
  const today = Date.parse(`${contributions.today}T00:00:00Z`);
  const allWeeks = Math.ceil((today - start) / DAY_MS / 7 + 1 / 7);
  const t = new Date(today);
  const from = Date.UTC(t.getUTCFullYear(), t.getUTCMonth() - (MONTHS_SHOWN - 1), 1);
  const firstWeek = Math.max(0, Math.floor((from - start) / DAY_MS / 7));
  const weeks = allWeeks - firstWeek;
  const cells = Array.from({ length: weeks * 7 }, (_, j) => {
    const i = firstWeek * 7 + j;
    const [count, level] = contributions.days[i] ?? [0, 0];
    const date = new Date(start + i * DAY_MS);
    return { week: Math.floor(j / 7), count, level, date, future: date.getTime() > today };
  });
  const months = Array.from({ length: MONTHS_SHOWN }, (_, k) => {
    const m = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() - (MONTHS_SHOWN - 1) + k, 1)).getUTCMonth();
    return { label: MONTHS[m], col: k + 1 };
  });
  return { weeks, cells, months, total: contributions.total };
})();

// 1 коммит, 2 коммита, 5 коммитов, 21 коммит
export const commitsWord = (n: number) => {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return 'коммит';
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return 'коммита';
  return 'коммитов';
};

export const dayLabel = (date: Date) => `${date.getUTCDate()} ${MONTHS_OF[date.getUTCMonth()]}`;
