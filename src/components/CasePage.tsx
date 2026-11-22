import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
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
            <div className="case-cover">
              <img src={study.cover.src} alt={study.cover.alt} decoding="async" draggable={false} />
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

/** Картинка секции: прозрачная, грузится, когда подходит к экрану; затемнение снизу — в цвет панели */
function Media({ item }: { item: CaseMedia }) {
  return (
    <div
      className={`case-media${item.radius ? ' is-rounded' : ''}`}
      style={{ aspectRatio: item.ratio, borderRadius: item.radius, ['--shade' as string]: item.shade ? `${item.shade * 100}%` : undefined }}
    >
      <img src={item.src} alt={item.alt} loading="lazy" decoding="async" draggable={false} />
    </div>
  );
}
