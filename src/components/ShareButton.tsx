import { useLayoutEffect, useRef, useState } from 'react';
import { icons } from '../content';
import { Icon } from './Cards';

const LABEL = 'Поделиться';
const COPIED = 'Скопировано!';
const HOLD_MS = 2200; // как у референса: «Скопировано!» держится ~2,2 с

/**
 * Кнопка «Поделиться»: копирует ссылку. Подписи сменяют друг друга лентой
 * (старая уходит вверх и гаснет, новая въезжает снизу), ширина кнопки меняется плавно.
 */
export function ShareButton({ block = false }: { block?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [widths, setWidths] = useState<{ rest: number; copied: number } | null>(null);
  const restRef = useRef<HTMLSpanElement>(null);
  const copiedRef = useRef<HTMLSpanElement>(null);
  const timer = useRef(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (restRef.current && copiedRef.current) {
        setWidths({ rest: restRef.current.offsetWidth, copied: copiedRef.current.offsetWidth });
      }
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => window.clearTimeout(timer.current);
  }, []);

  const share = async () => {
    // На телефоне кнопка в панели «Поделиться» открывает системное меню (Telegram, сообщения и т.д.)
    if (block && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        // системное меню недоступно — копируем ссылку
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      window.prompt('Скопируйте ссылку', window.location.href);
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), HOLD_MS);
  };

  return (
    <button
      type="button"
      className={`btn btn--primary btn--share${block ? ' btn--share-block' : ''}${copied ? ' is-copied' : ''}`}
      aria-label="Поделиться ссылкой"
      onClick={share}
    >
      {!block && <Icon src={icons.link} className="icon--white" />}
      <span className="share-label" style={widths ? { width: copied ? widths.copied : widths.rest } : undefined}>
        <span ref={restRef} className="share-text share-text--rest" aria-hidden={copied}>
          {LABEL}
        </span>
        <span ref={copiedRef} className="share-text share-text--copied" aria-hidden={!copied}>
          {COPIED}
        </span>
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Ссылка скопирована' : ''}
      </span>
    </button>
  );
}
