// Забирает вклады из GitHub за последние 26 недель и пишет их в src/data/contributions.json.
// Токен: GITHUB_TOKEN (в GitHub Actions) или `gh auth token` локально.
// Если GitHub недоступен, файл не трогаем — сборка идёт со старыми данными.
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const LOGIN = 'egorovdnikita';
const WEEKS = 26;
const OUT = new URL('../src/data/contributions.json', import.meta.url);

const iso = (d) => d.toISOString().slice(0, 10);
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

let token = process.env.GITHUB_TOKEN;
if (!token) {
  try {
    token = execSync('gh auth token', { encoding: 'utf8' }).trim();
  } catch {
    /* нет gh — ниже выйдем без ошибки */
  }
}
if (!token) {
  console.warn('[contributions] нет токена, оставляю прежние данные');
  process.exit(0);
}

// Неделя с понедельника, как у референса: окно — 26 недель, последняя содержит сегодня
const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const monday = new Date(today);
monday.setUTCDate(today.getUTCDate() - ((today.getUTCDay() + 6) % 7));
const start = new Date(monday);
start.setUTCDate(monday.getUTCDate() - (WEEKS - 1) * 7);

const query = `query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar { weeks { contributionDays { date contributionCount contributionLevel } } }
    }
  }
}`;

try {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'portfolio-build' },
    body: JSON.stringify({
      query,
      variables: { login: LOGIN, from: `${iso(start)}T00:00:00Z`, to: `${iso(today)}T23:59:59Z` },
    }),
  });
  const json = await res.json();
  const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!res.ok || !weeks) throw new Error(JSON.stringify(json.errors ?? json).slice(0, 300));

  const days = weeks
    .flatMap((w) => w.contributionDays)
    .filter((d) => d.date >= iso(start) && d.date <= iso(today))
    .map((d) => [d.contributionCount, LEVEL[d.contributionLevel] ?? 0]);
  const total = days.reduce((s, [c]) => s + c, 0);

  writeFileSync(OUT, JSON.stringify({ login: LOGIN, start: iso(start), today: iso(today), total, days }) + '\n');
  console.log(`[contributions] ${iso(start)} … ${iso(today)}: ${days.length} дн., ${total} вкладов`);
} catch (e) {
  console.warn('[contributions] GitHub не ответил, оставляю прежние данные:', e.message);
}
