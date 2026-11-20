import { Fragment, useEffect, useRef, useState } from 'react';
import { type CaseBlock, type CaseMedia, type CaseStudy, type ThemedImage } from '../cases';
import { icons } from '../content';
import { Icon } from './Cards';

type Props = {
  study: CaseStudy;
  zoom: number;
  closing: boolean;
  onClose: () => void;
};

/** Страница кейса поверх холста: колонка 900px по центру, своя прокрутка, крестик справа. */
export function CasePage({ study, zoom, closing, onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // При переходе к следующему кейсу начинаем сверху
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [study.id]);

  return (
    <div className={`case${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label={study.title}>
      <div ref={scrollRef} className="case-scroll">
        <article key={study.id} className="case-column" style={{ zoom }}>
          <section className="case-card case-hero">
            <Media item={study.heroMedia} />
            <div className="case-intro">
              <h1 className="case-title">{study.title}</h1>
              <p className="case-lead">{study.lead}</p>
            </div>
            <div className="case-meta">
              {study.meta.map((m) => (
                <div key={m.label} className="case-meta-item">
                  <span className="case-label">{m.label}</span>
                  <span className="case-meta-value">{m.value}</span>
                </div>
              ))}
            </div>
          </section>

          {study.role && (
            <section className="case-card case-panel">
              <Header label={study.role.label} />
              <Bullets items={study.role.items} plain />
            </section>
          )}

          {study.sections.map((section) => (
            <section key={section.label} className="case-card case-panel case-section">
              {section.media && (
                <div className="case-section-media">
                  <Media item={section.media} />
                </div>
              )}
              <Header label={section.label} />
              <h2 className="case-h2">{section.title}</h2>
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}

        </article>
      </div>

      <button type="button" className="case-close" aria-label="Закрыть кейс" onClick={onClose}>
        <Icon src={icons.close} size={32} className="icon--strong" />
      </button>
    </div>
  );
}

/** Заголовок блока — только подпись, как в макете */
function Header({ label }: { label: string }) {
  return (
    <div className="case-header">
      <span className="case-label">{label}</span>
    </div>
  );
}

/** Пункты: с прочерком или (в «Моей роли» и «Итоге») с синей точкой в слоте 24px, как в макете */
function Bullets({ items, plain }: { items: string[]; plain?: boolean }) {
  return (
    <ul className={`case-bullets${plain ? ' case-bullets--plain' : ''}`}>
      {items.map((item) => (
        <li key={item}>
          <span className="case-dash" aria-hidden>
            {plain ? '•' : '—'}
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
      return <Bullets items={block.items} plain={block.plain} />;
    case 'quote':
      return <p className="case-quote">{block.text}</p>;
    case 'image':
      return (
        <div className="case-image" style={{ height: block.height }}>
          <span>{block.caption}</span>
        </div>
      );
    case 'table':
      return (
        <div className="case-table" role="table">
          <div className="case-tr case-th" role="row">
            {block.head.map((h, i) => (
              <span key={i} role="columnheader">
                {h || '​'}
              </span>
            ))}
          </div>
          {block.rows.map((row) => (
            <Fragment key={row[0]}>
              <span className="case-hr" aria-hidden />
              <div className="case-tr" role="row">
                {row.map((cell, i) => (
                  <span key={i} role="cell">
                    {cell}
                  </span>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      );
    case 'steps':
      return (
        <div
          className={`case-steps${block.size === 'lg' ? ' case-steps--lg' : ''}${block.items.length === 3 ? ' case-steps--3' : ''}`}
        >
          {block.items.map((step) => (
            <div key={step.title} className="case-step">
              {step.image && <Themed image={step.image} className="case-shot" />}
              <div className="case-step-text">
                <span className="case-step-title">{step.title}</span>
                <span className="case-small">{step.text}</span>
              </div>
            </div>
          ))}
        </div>
      );
    case 'columns':
      return (
        <div className="case-columns">
          {block.items.map((col) => (
            <div key={col.title} className="case-col">
              {col.icon ? (
                <img className="case-col-icon" src={col.icon} alt="" draggable={false} />
              ) : (
                !block.bare && (
                  <span className={`case-cutout${block.items.length < 4 ? ' case-cutout--round' : ''}`} aria-hidden />
                )
              )}
              <span className="case-col-title">{col.title}</span>
              <span className="case-small">{col.text}</span>
            </div>
          ))}
        </div>
      );
    case 'figure':
      return (
        <figure className="case-figure">
          <img className="only-light" src={block.image.light} alt={block.alt} draggable={false} />
          <img className="only-dark" src={block.image.dark} alt={block.alt} draggable={false} />
        </figure>
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

/** Вырезка интерфейса: картинка своей темы, вторая скрыта стилями */
function Themed({ image, className }: { image: ThemedImage; className: string }) {
  return (
    <span className={className}>
      <img className="only-light" src={image.light} alt="" draggable={false} />
      <img className="only-dark" src={image.dark} alt="" draggable={false} />
    </span>
  );
}

function Media({ item }: { item: CaseMedia }) {
  if (item.media === 'image') {
    return (
      <div className="case-media" style={{ aspectRatio: item.ratio }}>
        <img src={item.src} alt={item.alt} draggable={false} />
      </div>
    );
  }
  if (item.media === 'compare') return <Compare item={item} />;
  return <Gallery background={item.background} slides={item.slides} ratio={item.ratio} />;
}

/** Сравнение: картинка «до» лежит поверх «после» и обрезается по разделителю, разделитель тянется мышью, пальцем и стрелками */
function Compare({ item }: { item: Extract<CaseMedia, { media: 'compare' }> }) {
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
      <img className="case-compare-img" src={item.after} alt={item.alt} draggable={false} />
      <img className="case-compare-img case-compare-before" src={item.before} alt="" draggable={false} />
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

/** Галерея: фон неподвижен, листаются только телефоны — свайпом, прокруткой, стрелками и точками */
function Gallery({ background, slides, ratio }: { background: string; slides: { src: string; alt: string }[]; ratio: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = (i + slides.length) % slides.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (track) setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div className="case-gallery" role="group" aria-roledescription="галерея">
      <div
        ref={trackRef}
        className="case-gallery-track"
        style={{ backgroundImage: `url(${background})`, aspectRatio: ratio }}
        onScroll={onScroll}
      >
        {slides.map((slide) => (
          <div key={slide.src} className="case-gallery-slide">
            <img src={slide.src} alt={slide.alt} draggable={false} />
          </div>
        ))}
      </div>
      <button type="button" className="case-gallery-arrow is-prev" aria-label="Предыдущий слайд" onClick={() => goTo(active - 1)}>
        <Icon src={icons.chevronLeft} size={32} className="icon--strong" />
      </button>
      <button type="button" className="case-gallery-arrow is-next" aria-label="Следующий слайд" onClick={() => goTo(active + 1)}>
        <Icon src={icons.chevronLeft} size={32} className="icon--strong" />
      </button>
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
