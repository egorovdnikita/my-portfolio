import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { profile } from '../content';

// Вопросы к кейсу: ответы — готовые тексты из базы chat/kb, бот ничего не генерирует.
const API = 'https://case-chat.promminer-pool.workers.dev';
const MAX_LEN = 200;
const PAUSE = 400;
const SEND_ICON = `${import.meta.env.BASE_URL}assets/chat-send-up.svg`;

type Suggestion = { id: string; text: string };
type Status = 'answer' | 'clarify' | 'personal' | 'blocked' | 'limited';
type Reply = { status: Status; messages: string[]; suggestions: Suggestion[] };
type Turn = {
  question: string;
  messages: string[];
  telegram: boolean;
  typing: boolean;
};

// Кейсы, для которых есть база ответов (chat/kb)
const CASES = ['1win-product', '1win'];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Переписка — в конце кейса, поле ввода — отдельной плашкой под карточкой (dock), как в макете */
export function CaseChat({ caseId, dock }: { caseId: string; dock: HTMLElement | null }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [chips, setChips] = useState<Suggestion[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const asked = useRef<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  // Прогрев: при открытии кейса будим воркер и открываем соединение, чтобы первый ответ пришёл быстро
  useEffect(() => {
    fetch(`${API}/starters?caseId=${encodeURIComponent(caseId)}`).catch(() => {});
  }, [caseId]);

  useEffect(() => {
    // Чат — последний раздел кейса: прокручиваем панель до конца, чтобы новое не пряталось под полем
    const scroller = endRef.current?.closest('.case-scroll');
    if (turns.length && scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
  }, [turns, chips]);

  if (!CASES.includes(caseId)) return null;

  const patchLast = (fn: (t: Turn) => Turn) => setTurns((list) => list.map((t, i) => (i === list.length - 1 ? fn(t) : t)));

  async function ask(question: string, entryId?: string) {
    if (busy) return;
    const q = question.trim().slice(0, MAX_LEN);
    if (!q) return;
    setBusy(true);
    setChips([]);
    setTurns((list) => [...list, { question: q, messages: [], telegram: false, typing: true }]);
    if (entryId) asked.current.push(entryId);

    let reply: Reply;
    const started = Date.now();
    try {
      const res = await fetch(`${API}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryId ? { caseId, entryId, asked: asked.current } : { caseId, text: q, asked: asked.current }),
      });
      reply = await res.json();
    } catch {
      reply = {
        status: 'limited',
        messages: ['Чат сейчас недоступен'],
        suggestions: [],
      };
    }
    await wait(Math.max(0, 600 - (Date.now() - started)));

    // Сообщения по одному, с паузой, как будто печатает
    for (let i = 0; i < reply.messages.length; i++) {
      if (i) await wait(PAUSE);
      const last = i === reply.messages.length - 1;
      patchLast((t) => ({
        ...t,
        messages: [...t.messages, reply.messages[i]],
        typing: !last,
      }));
    }
    if (reply.status === 'personal' || reply.status === 'limited') {
      await wait(PAUSE);
      patchLast((t) => ({ ...t, telegram: true, typing: false }));
    }
    if (!reply.messages.length) patchLast((t) => ({ ...t, typing: false }));
    // Готовых вопросов не предлагаем — только варианты, когда бот не уверен, про что спросили
    setChips(reply.status === 'clarify' ? reply.suggestions.filter((s) => !asked.current.includes(s.id)) : []);
    setBusy(false);
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !text.trim()) return;
    const q = text;
    setText('');
    ask(q);
  };

  return (
    <>
      {turns.length > 0 && (
        <div className="case-section case-chat">
          <span className="case-section-label">Вопросы</span>

          {turns.map((t, i) => (
            <div key={i} className="case-chat-turn">
              <p className="case-question">{t.question}</p>
              {(t.messages.length > 0 || t.telegram) && (
                <ul className="case-answers">
                  {t.messages.map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                  {t.telegram && (
                    <li>
                      <a href={profile.telegramUrl} target="_blank" rel="noreferrer">
                        Написать в Telegram
                      </a>
                    </li>
                  )}
                </ul>
              )}
              {t.typing && (
                <span className="case-chat-typing" aria-label="Печатает">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
          ))}

          {chips.length > 0 && !busy && (
            <div className="case-chat-chips">
              {chips.map((c) => (
                <button key={c.id} type="button" className="case-chat-chip" onClick={() => ask(c.text, c.id)}>
                  {c.text}
                </button>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {dock &&
        createPortal(
          <form className="case-chat-form" onSubmit={onSubmit}>
            <input
              className="case-chat-input"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
              placeholder="Спросите про этот кейс"
              maxLength={MAX_LEN}
              enterKeyHint="send"
              aria-label="Вопрос про кейс"
            />
            <button type="submit" className="case-chat-send" disabled={busy || !text.trim()} aria-label="Отправить">
              <img src={SEND_ICON} alt="" width={48} height={48} draggable={false} />
            </button>
          </form>,
          dock,
        )}
    </>
  );
}
