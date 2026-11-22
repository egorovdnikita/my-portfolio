import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { type CaseBlock, type CaseMedia, type CaseSection, type CaseStudy } from '../cases';
import { icons } from '../content';
import { Icon } from './Cards';

type Props = {
  study: CaseStudy;
  closing: boolean;
  onClose: () => void;
};

/**
 * Группы панели, как в макете: секция с картинкой начинается с блока картинки и открывает новую группу,
 * секции без картинки присоединяются к предыдущей группе через разделитель.
 */
function groupSections(sections: CaseSection[]) {
  const intro: CaseSection[] = [];
  const groups: { media?: CaseMedia; sections: CaseSection[] }[] = [];
  for (const s of sections) {
    if (s.media) groups.push({ media: s.media, sections: [s] });
    else if (groups.length) groups[groups.length - 1].sections.push(s);
    else intro.push(s);
  }
  return { intro, groups };
}

/**
 * Панель кейса справа от переписки (на узком экране — поверх неё).
 * При прокрутке крупный заголовок уходит вверх, а в закреплённой шапке плавно появляется его короткая версия —
 * как имя в профиле Telegram.
 */
export function CasePage({ study, closing, onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const { intro, groups } = groupSections(study.sections);

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
    <aside className={`case${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="false" aria-label={study.title}>
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
            <div className="case-media-block case-cover">
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
              {study.role && (
                <div className="case-role">
                  <span className="case-label">{study.role.label}</span>
                  <Bullets items={study.role.items} />
                </div>
              )}
              {intro.map((s) => (
                <Divided key={s.label}>
                  <Section section={s} />
                </Divided>
              ))}
            </section>

            {groups.map((g, gi) => (
              <div key={gi}>
                {g.media && (
                  <div className="case-media-block">
                    <Media item={g.media} />
                  </div>
                )}
                <section className={`case-group${g.sections.length > 1 ? ' case-group--multi' : ''}`}>
                  {g.sections.map((s, i) =>
                    i === 0 ? (
                      <Section key={s.label} section={s} />
                    ) : (
                      <Divided key={s.label}>
                        <Section section={s} />
                      </Divided>
                    ),
                  )}
                </section>
              </div>
            ))}
          </article>
        </div>
      </div>
    </aside>
  );
}

/** Разделитель перед секцией */
function Divided({ children }: { children: ReactNode }) {
  return (
    <>
      <hr className="case-divider" />
      {children}
    </>
  );
}

function Section({ section }: { section: CaseSection }) {
  return (
    <div className="case-section">
      <span className="case-label">{section.label}</span>
      <h2 className="case-h2">{section.title}</h2>
      {section.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

/** Пункты с синей точкой в слоте 24px, как в макете */
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="case-bullets">
      {items.map((item) => (
        <li key={item}>
          <span className="case-marker" aria-hidden>
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Block({ block }: { block: CaseBlock }) {
  switch (block.type) {
    case 'text':
      return <p className="case-text">{block.links ? <Linked text={block.text} links={block.links} /> : block.text}</p>;
    case 'bullets':
      return <Bullets items={block.items} />;
    case 'steps':
      return (
        <div className="case-steps">
          {block.items.map((step) => (
            <div key={step.title} className="case-step">
              <span className="case-value">{step.title}</span>
              <span className="case-small">{step.text}</span>
            </div>
          ))}
        </div>
      );
  }
}

/** Текст со ссылками: слова из links подчёркнуты и открываются в новой вкладке */
function Linked({ text, links }: { text: string; links: Record<string, string> }) {
  const words = Object.keys(links).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
  return (
    <>
      {text.split(pattern).map((part, i) =>
        links[part] ? (
          <a key={i} href={links[part]} target="_blank" rel="noreferrer">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}

type Loading = 'eager' | 'lazy';

/** Обложка грузится сразу, картинки секций — когда подходят к экрану. Скругление и обводка — из данных кейса */
function Media({ item, loading = 'lazy' }: { item: CaseMedia; loading?: Loading }) {
  const frame = { radius: item.radius, border: item.border };
  if (item.media === 'image') {
    return (
      <Frame {...frame} className="case-media" style={{ aspectRatio: item.ratio }}>
        <img src={item.src} alt={item.alt} loading={loading} decoding="async" draggable={false} />
      </Frame>
    );
  }
  if (item.media === 'compare') return <Compare item={item} loading={loading} />;
  return <Gallery background={item.background} slides={item.slides} ratio={item.ratio} border={item.border} />;
}

/** Рамка картинки: скругление 24 по умолчанию, обводка 1px внутрь, если она есть в макете */
function Frame({
  radius,
  border,
  className,
  style,
  children,
  ...rest
}: { radius?: number; border?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={`${className}${border ? ' has-border' : ''}`} style={{ ...style, borderRadius: radius }}>
      {children}
    </div>
  );
}

/** Сравнение: картинка «до» лежит поверх «после» и обрезается по разделителю, разделитель тянется мышью, пальцем и стрелками */
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
      className={`case-media case-compare${item.border ? ' has-border' : ''}`}
      style={{ aspectRatio: item.ratio, borderRadius: item.radius, ['--pos' as string]: `${pos}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      <img className="case-compare-img" src={item.after} alt={item.alt} loading={loading} decoding="async" draggable={false} />
      <img className="case-compare-img case-compare-before" src={item.before} alt="" loading={loading} decoding="async" draggable={false} />
      <span className="case-compare-line" aria-hidden />
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
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
          <rect x="9.33" y="4.33" width="2" height="23.33" rx="1" />
          <rect x="15" y="4.33" width="2" height="23.33" rx="1" />
          <rect x="20.67" y="4.33" width="2" height="23.33" rx="1" />
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
  border,
}: {
  background: string;
  slides: { src: string; alt: string }[];
  ratio: string;
  border?: boolean;
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
    <div className={`case-media case-gallery${border ? ' has-border' : ''}`} role="group" aria-roledescription="галерея">
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
