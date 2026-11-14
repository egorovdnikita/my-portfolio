import { experience, icons, profile, vibecoding, type Project } from '../content';

/** Иконка-маска: цвет задаётся через CSS (как Master Icon в макете). */
export function Icon({ src, size = 24, className = '' }: { src: string; size?: number; className?: string }) {
  return (
    <span
      className={`icon ${className}`}
      style={{ width: size, height: size, WebkitMaskImage: `url("${src}")`, maskImage: `url("${src}")` }}
      aria-hidden
    />
  );
}

export function Tag({ children }: { children: string }) {
  return <span className="tag">{children}</span>;
}

function Divider() {
  return <span className="dash" aria-hidden />;
}

function Img({ src, className }: { src: string; className: string }) {
  return <img src={src} alt="" className={className} draggable={false} />;
}

export function ExperienceCard() {
  return (
    <section className="card card--exp">
      <div className="card-head">
        <span className="muted">{experience.title}</span>
        <Divider />
        <span className="muted">{experience.total}</span>
      </div>
      <div className="rows">
        {experience.items.map((item, i) => (
          <div key={item.company} className="rows-group">
            {i > 0 && <Divider />}
            <div className="row">
              <Img src={item.logo} className="logo logo--32" />
              <span className="row-title">{item.company}</span>
              <span className="muted">{item.period}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const ACTIVITY_CLASS = ['bar--0', 'bar--1', 'bar--2', 'bar--3'];

export function VibeCard() {
  return (
    <section className="card card--vibe">
      <div className="vibe-top">
        <div className="card-head">
          <span className="muted">{vibecoding.title}</span>
          <Divider />
          <span className="muted">{vibecoding.contributions}</span>
        </div>
        <div className="bars" aria-hidden>
          {vibecoding.activity.map((level, i) => (
            <span key={i} className={`bar ${ACTIVITY_CLASS[level]}`} />
          ))}
        </div>
        <div className="tools">
          {vibecoding.tools.map((tool) => (
            <span key={tool.name} className="tool">
              <Img src={tool.icon} className="logo logo--24" />
              {tool.name}
            </span>
          ))}
        </div>
      </div>
      <div className="repos">
        {vibecoding.repos.map((repo, i) => (
          <div key={repo.name} className="rows-group">
            {i > 0 && <Divider />}
            <a className="row row--link" href={repo.url} target="_blank" rel="noreferrer">
              <Img src={repo.icon} className="logo logo--32" />
              <span className="row-title">{repo.name}</span>
              <Icon src={icons.external} size={16} className="icon--subtle" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HeroCard() {
  return (
    <div className="hero">
      <div className="hero-photo">
        <Img src={profile.photo} className="hero-photo-img" />
      </div>
      <section className="card card--hero">
        <div className="hero-text">
          <div className="hero-title">
            <h1>{profile.name}</h1>
            <p className="hero-role">{profile.role}</p>
          </div>
          <p className="muted hero-about">{profile.about}</p>
          <div className="tag-list">
            {profile.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
        <div className="hero-actions">
          <LinkButton href={profile.cvUrl} variant="secondary" download>
            СКАЧАТЬ CV
            <Icon src={icons.download} size={24} className="icon--strong" />
          </LinkButton>
          <LinkButton href={profile.telegramUrl} variant="primary">
            НАПИСАТЬ TG
            <img src={icons.telegram} alt="" width={24} height={24} draggable={false} />
          </LinkButton>
        </div>
      </section>
    </div>
  );
}

/** Кнопка-ссылка. Пока ссылка не задана, кнопка видна, но неактивна. */
function LinkButton({
  href,
  variant,
  download,
  children,
}: {
  href: string;
  variant: 'primary' | 'secondary';
  download?: boolean;
  children: React.ReactNode;
}) {
  const external = href.startsWith('http');
  return (
    <a
      className={`btn btn--${variant}`}
      href={href || undefined}
      aria-disabled={!href}
      title={href ? undefined : 'Ссылка скоро появится'}
      download={download && href ? '' : undefined}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      {children}
    </a>
  );
}

export function ProjectCard({ project, onOpen }: { project: Project; onOpen: (p: Project) => void }) {
  return (
    <section className="card card--project">
      <div className="project-cover">
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
      {project.action.kind === 'case' ? (
        <button type="button" className="btn btn--secondary btn--block" onClick={() => onOpen(project)}>
          ПОДРОБНЕЕ
        </button>
      ) : (
        <LinkButtonBlock href={project.action.url} />
      )}
    </section>
  );
}

function LinkButtonBlock({ href }: { href: string }) {
  return (
    <a
      className="btn btn--secondary btn--block"
      href={href || undefined}
      aria-disabled={!href}
      title={href ? undefined : 'Ссылка скоро появится'}
      target="_blank"
      rel="noreferrer"
    >
      ПЕРЕЙТИ
      <Icon src={icons.external} size={16} className="icon--subtle" />
    </a>
  );
}
