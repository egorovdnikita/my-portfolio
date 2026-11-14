import { useEffect, useRef } from 'react';
import { profile } from '../content';
import type { Visitor } from '../presence';
import { Avatars } from './Avatars';
import { ShareButton } from './ShareButton';

type Props = {
  open: boolean;
  onClose: () => void;
  presence: { self: Visitor; others: Visitor[] };
};

/** Мобильная панель «Поделиться» (кадр 375px): кто смотрит, владелец и кнопка копирования ссылки. */
export function MobileShare({ open, onClose, presence }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!ref.current?.contains(t) && !t.closest('.share-icon-btn')) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('pointerdown', onDown, true);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} className={`mshare${open ? ' is-open' : ''}`} aria-hidden={!open} role="dialog" aria-label="Поделиться">
      <div className="mshare-list">
        <div className="mshare-row mshare-row--between">
          <Avatars self={presence.self} others={presence.others} />
          <span className="muted">Просмотр</span>
        </div>
        <div className="mshare-row">
          <span className="mshare-owner-avatar">{profile.ownerLogin[0].toUpperCase()}</span>
          <span className="row-title">{profile.ownerLogin}</span>
          <span className="muted">Владелец</span>
        </div>
      </div>
      <ShareButton block />
    </div>
  );
}
