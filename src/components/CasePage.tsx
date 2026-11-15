import { Fragment, useEffect, useRef } from 'react';
import type { CaseBlock, CaseStudy } from '../cases';
import { icons } from '../content';
import { Icon, Tag } from './Cards';

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
            <div className="case-cover">
              {study.cover && <img className="case-cover-img" src={study.cover} alt="" draggable={false} />}
              <div className="case-tags">
                {study.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
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
      return <p className="case-text">{block.text}</p>;
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
        <div className={`case-steps${block.size === 'lg' ? ' case-steps--lg' : ''}`}>
          {block.items.map((step) => (
            <div key={step.title} className="case-step">
              <span className="case-cutout" aria-hidden />
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
              <span className={`case-cutout${block.items.length < 4 ? ' case-cutout--round' : ''}`} aria-hidden />
              <span className="case-col-title">{col.title}</span>
              <span className="case-small">{col.text}</span>
            </div>
          ))}
        </div>
      );
  }
}
