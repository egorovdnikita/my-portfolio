import contributions from './data/contributions.json';

// Календарь вкладов: src/data/contributions.json, обновляется скриптом scripts/fetch-contributions.mjs при каждой сборке
const MONTHS = ['янв', 'февр', 'март', 'апр', 'май', 'июнь', 'июль', 'авг', 'сент', 'окт', 'нояб', 'дек'];
const MONTHS_OF = ['янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня', 'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
const DAY_MS = 86_400_000;

// Сетка как у GitHub, но неделя с понедельника: столбец — неделя, строка — день.
// Дни после «сегодня» (на момент сборки) приглушены. Подпись месяца — над неделей, где лежит 1-е число.
export const calendar = (() => {
  const start = Date.parse(`${contributions.start}T00:00:00Z`);
  const today = Date.parse(`${contributions.today}T00:00:00Z`);
  const weeks = Math.ceil((today - start) / DAY_MS / 7 + 1 / 7);
  const cells = Array.from({ length: weeks * 7 }, (_, i) => {
    const [count, level] = contributions.days[i] ?? [0, 0];
    const date = new Date(start + i * DAY_MS);
    return { week: Math.floor(i / 7), count, level, date, future: date.getTime() > today };
  });
  const months: { label: string; col: number }[] = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start + (w * 7 + d) * DAY_MS);
      if (date.getUTCDate() === 1) months.push({ label: MONTHS[date.getUTCMonth()], col: w + 1 });
    }
  }
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
