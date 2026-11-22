import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { type CaseMedia, type CaseSection, type CaseStudy } from '../cases';
import { icons } from '../content';
import { Icon } from './Cards';

type Props = {
  study: CaseStudy;
  closing: boolean;
  onClose: () => void;
};

/**
 * Панель кейса справа от переписки (на узком экране — поверх неё).
 * При прокрутке крупный заголовок уходит вверх, а в закреплённой шапке плавно появляется его короткая версия —
 * как имя в профиле Telegram.
 */
export function CasePage({ study, closing, onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Новый кейс — с начала
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [study.id]);

  // Прогресс сворачивания заголовка: 0 — крупный заголовок виден целиком, 1 — он ушёл под шапку
  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    const title = titleRef.current;
    const bar = barRef.current;
    if (!scroller || !title || !bar) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const barBottom = bar.offsetHeight;
      const top = title.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      // плавно: на протяжении высоты заголовка и ещё 64px прокрутки
      const p = Math.max(0, Math.min(1, (barBottom + 32 - top) / (title.offsetHeight + 64)));
      scroller.style.setProperty('--collapse', p.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [study.id]);

  return (
    <>
    <button type="button" className={`case-backdrop${closing ? ' is-closing' : ''}`} aria-label="Закрыть кейс" onClick={onClose} />
    <aside className={`case${study.id === '1win' ? ' case--ds' : ''}${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="false" aria-label={study.title}>
      <div className="case-card">
        <div ref={scrollRef} className="case-scroll">
          <div ref={barRef} className="case-bar">
            <span className="case-bar-title" aria-hidden>
              {study.title}
            </span>
            <button type="button" className="case-close" aria-label="Закрыть кейс" onClick={onClose}>
              <Icon src={icons.close} size={32} className="icon--strong" />
            </button>
          </div>

          <article key={study.id} className="case-article">
            <div className="case-cover">
              <Media item={study.cover} loading="eager" />
            </div>

            <section className="case-group case-intro">
              <header className="case-heading">
                <h1 ref={titleRef} className="case-title">
                  {study.title}
                </h1>
                <p className="case-lead">{study.lead}</p>
              </header>
              <div className="case-meta">
                {study.meta.map((m) => (
                  <div key={m.label} className="case-meta-item">
                    <span className="case-label">{m.label}</span>
                    <span className="case-value">{m.value}</span>
                  </div>
                ))}
              </div>
              {study.sections.map((s) => (
                <Section key={s.label} section={s} />
              ))}
            </section>
          </article>
        </div>
      </div>
    </aside>
    </>
  );
}

/** Секция-переписка: подпись по центру, вопрос справа, картинки и ответы слева, как в макете */
function Section({ section }: { section: CaseSection }) {
  const media = section.media?.map((m, i) => <Media key={i} item={m} />);
  const answers = (
    <ul className="case-answers">
      {section.answers.map((a) => (
        <li key={a}>{a}</li>
      ))}
    </ul>
  );
  return (
    <div className="case-section">
      <span className="case-section-label">{section.label}</span>
      <h2 className="case-question">{section.question}</h2>
      {media && section.mediaGap === 12 ? (
        <>
          {media}
          {answers}
        </>
      ) : media ? (
        <div className="case-content">
          {media}
          {answers}
        </div>
      ) : (
        answers
      )}
    </div>
  );
}

type Loading = 'eager' | 'lazy';

/** Обложка грузится сразу, картинки секций — когда подходят к экрану. Скругление и обводка — из данных кейса */
function Media({ item, loading = 'lazy' }: { item: CaseMedia; loading?: Loading }) {
  if (item.media === 'emoji') {
    return (
      <div className="case-emoji-cover">
        <img src={item.src} alt={item.alt} width={128} height={128} />
      </div>
    );
  }
  if (item.media === 'image') {
    return (
      <div className="case-media" style={{ aspectRatio: item.ratio, borderRadius: item.radius }}>
        <img src={item.src} alt={item.alt} loading={loading} decoding="async" draggable={false} />
      </div>
    );
  }
  if (item.media === 'compare') return <Compare item={item} loading={loading} />;
  return <Gallery background={item.background} slides={item.slides} ratio={item.ratio} />;
}

/**
 * Сравнение: две картинки со скруглением 24 у каждой половины и щелью 2px между ними, как в макете.
 * Скруглённый изгиб едет вместе с разделителем; тянется мышью, пальцем и стрелками
 */
function Compare({ item, loading }: { item: Extract<CaseMedia, { media: 'compare' }>; loading: Loading }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);

  const moveTo = (clientX: number) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    moveTo(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) moveTo(e.clientX);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - step));
    else if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + step));
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={boxRef}
      className="case-compare"
      style={{ aspectRatio: item.ratio, ['--pos' as string]: `${pos}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      <img className="case-compare-img case-compare-after" src={item.after} alt={item.alt} loading={loading} decoding="async" draggable={false} />
      <img className="case-compare-img case-compare-before" src={item.before} alt="" loading={loading} decoding="async" draggable={false} />
      <span
        className="case-compare-handle"
        role="slider"
        tabIndex={0}
        aria-label="Разделитель сравнения"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={onKeyDown}
      >
        {/* Bolt «Hamburger Menu», повёрнутая на 90°, как в макете */}
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
          <rect x="6.25" y="3.25" width="1.5" height="17.5" rx="0.75" />
          <rect x="11.25" y="3.25" width="1.5" height="17.5" rx="0.75" />
          <rect x="16.25" y="3.25" width="1.5" height="17.5" rx="0.75" />
        </svg>
      </span>
    </div>
  );
}

/** Галерея: фон неподвижен, листаются только телефоны — свайпом, прокруткой и точками внизу, как в макете */
function Gallery({
  background,
  slides,
  ratio,
}: {
  background: string;
  slides: { src: string; alt: string }[];
  ratio: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (track) setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div className="case-media case-gallery" role="group" aria-roledescription="галерея">
      <div
        ref={trackRef}
        className="case-gallery-track"
        style={{ backgroundImage: `url(${background})`, aspectRatio: ratio }}
        onScroll={onScroll}
      >
        {slides.map((slide) => (
          <div key={slide.src} className="case-gallery-slide">
            <img src={slide.src} alt={slide.alt} loading="lazy" decoding="async" draggable={false} />
          </div>
        ))}
      </div>
      <div className="case-gallery-dots">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            className={`case-gallery-dot${i === active ? ' is-active' : ''}`}
            aria-label={`Слайд ${i + 1}`}
            aria-current={i === active}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
