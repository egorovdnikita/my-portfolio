import { useEffect, useRef } from 'react';
import type { Project } from '../content';
import { Tag } from './Cards';

/** Кейс поверх холста (как лайтбокс кейса у референса). Закрывается по Esc, клику по фону и кнопке. */
export function CaseModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div className="modal" onClick={onClose}>
      <section
        className="card card--project card--case"
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="project-cover project-cover--case">
          <div className="tag-list project-tags">
            {project.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
        <div className="project-text">
          <h2>{project.title}</h2>
          <p className="muted">{project.description}</p>
        </div>
        <button ref={closeRef} type="button" className="btn btn--secondary btn--block" onClick={onClose}>
          ЗАКРЫТЬ
        </button>
      </section>
    </div>
  );
}
