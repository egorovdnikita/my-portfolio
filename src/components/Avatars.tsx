import { headerAvatars, icons } from '../content';
import type { Visitor } from '../presence';
import { Icon } from './Cards';

const plural = (n: number) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'посетитель';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'посетителя';
  return 'посетителей';
};

/**
 * Аватарки в шапке: Codex и Claude всегда, затем вы (случайное имя в подсказке),
 * затем «+N» — сколько ещё людей сейчас на сайте. Без других посетителей «+N» не показывается.
 */
export function Avatars({ self, others }: { self: Visitor; others: Visitor[] }) {
  const othersLabel =
    others.length > 0
      ? `Ещё ${others.length} ${plural(others.length)}: ${others
          .slice(0, 3)
          .map((v) => v.name)
          .join(', ')}${others.length > 3 ? '…' : ''}`
      : '';

  return (
    <div className="avatars" aria-label={`Сейчас на сайте: ${others.length + 1}`}>
      {headerAvatars.map((a, i) => (
        <span
          key={a.name}
          className={`avatar${i > 0 ? ' avatar--ring' : ''}`}
          data-tooltip={a.name}
          aria-label={a.name}
          tabIndex={0}
        >
          <img src={a.src} alt="" draggable={false} />
        </span>
      ))}
      <span
        className={`avatar avatar--visitor${others.length ? '' : ' avatar--last'}`}
        data-tooltip={`${self.name} (вы)`}
        aria-label={`${self.name} (вы)`}
        tabIndex={0}
      >
        <Icon src={icons.user} className="avatar-user-icon" />
      </span>
      {others.length > 0 && (
        <span className="avatar avatar--more avatar--ring" data-tooltip={othersLabel} aria-label={othersLabel} tabIndex={0}>
          +{others.length}
        </span>
      )}
    </div>
  );
}
