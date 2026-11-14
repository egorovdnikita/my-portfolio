import { useEffect, useState } from 'react';

// Кто сейчас на сайте. Сервер — Cloudflare Worker из папки presence/.
// Посетитель получает случайный id и имя («Неопознанный барсук»), они живут в localStorage,
// поэтому несколько вкладок одного человека считаются одним посетителем.

export const PRESENCE_URL = 'wss://portfolio-presence.promminer-pool.workers.dev/ws';

export type Visitor = { id: string; name: string };

const ADJECTIVES = [
  'Неопознанный',
  'Загадочный',
  'Безымянный',
  'Невидимый',
  'Анонимный',
  'Таинственный',
  'Молчаливый',
  'Тайный',
  'Случайный',
  'Скрытный',
];
const ANIMALS = [
  'барсук',
  'енот',
  'ёж',
  'лис',
  'бобр',
  'хорёк',
  'тюлень',
  'пингвин',
  'филин',
  'сурок',
  'кот',
  'медведь',
  'волк',
  'ленивец',
  'хомяк',
  'суслик',
  'дельфин',
  'краб',
  'жираф',
  'тапир',
];

const STORAGE_KEY = 'portfolio-visitor';

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

const randomName = () => {
  const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
  return `${pick(ADJECTIVES)} ${pick(ANIMALS)}`;
};

function loadSelf(): Visitor {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Visitor | null;
    if (saved && typeof saved.id === 'string' && typeof saved.name === 'string') return saved;
  } catch {
    // нет доступа к хранилищу — просто создаём нового посетителя
  }
  const self = { id: randomId(), name: randomName() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(self));
  } catch {
    // приватный режим: имя будет новым при каждом заходе
  }
  return self;
}

const PING_MS = 25_000;
const MAX_RETRY_MS = 30_000;

/** Текущий посетитель и остальные, кто сейчас на сайте. Без сервера — только сам посетитель. */
export function usePresence() {
  const [self] = useState(loadSelf);
  const [others, setOthers] = useState<Visitor[]>([]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let ping = 0;
    let retry = 0;
    let delay = 1000;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      const url = `${PRESENCE_URL}?id=${encodeURIComponent(self.id)}&name=${encodeURIComponent(self.name)}`;
      try {
        ws = new WebSocket(url);
      } catch {
        return;
      }
      ws.onopen = () => {
        delay = 1000;
        ping = window.setInterval(() => ws?.readyState === WebSocket.OPEN && ws.send('ping'), PING_MS);
      };
      ws.onmessage = (e) => {
        if (typeof e.data !== 'string' || e.data === 'pong') return;
        try {
          const msg = JSON.parse(e.data) as { type: string; visitors: Visitor[] };
          if (msg.type === 'presence' && Array.isArray(msg.visitors)) {
            setOthers(msg.visitors.filter((v) => v.id !== self.id));
          }
        } catch {
          // битое сообщение — пропускаем
        }
      };
      ws.onclose = () => {
        window.clearInterval(ping);
        setOthers([]);
        if (stopped) return;
        retry = window.setTimeout(connect, delay);
        delay = Math.min(delay * 2, MAX_RETRY_MS);
      };
    };

    connect();
    return () => {
      stopped = true;
      window.clearInterval(ping);
      window.clearTimeout(retry);
      ws?.close();
    };
  }, [self]);

  return { self, others };
}
