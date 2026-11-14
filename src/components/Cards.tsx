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

/** Логотип 24/32px с градиентной обводкой, как в макете. */
function Logo({ src, size }: { src: string; size: 24 | 32 }) {
  return (
    <span className={`logo logo--${size}`}>
      <img src={src} alt="" draggable={false} />
    </span>
  );
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
              <Logo src={item.logo} size={32} />
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

// Псевдослучайное число 0..1 по номеру столбика: у каждого свой темп, но одинаково при каждой загрузке
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
// Высота «дышит» вокруг центра: волна по ряду (задержка растёт с номером) + свой темп и амплитуда у каждого
const LEVEL_RANGE: [number, number][] = [
  [8, 16],
  [10, 20],
  [12, 24],
  [14, 24],
];
const barStyle = (level: number, i: number) => {
  const [min, max] = LEVEL_RANGE[level];
  return {
    '--bar-min': `${min + rand(i, 1) * 3}px`,
    '--bar-max': `${max - rand(i, 2) * 3}px`,
    '--bar-dur': `${2.4 + rand(i, 3) * 1.8}s`,
    '--bar-delay': `${-(i * 0.14 + rand(i, 4) * 0.6)}s`,
  } as React.CSSProperties;
};

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
            <span key={i} className={`bar ${ACTIVITY_CLASS[level]}`} style={barStyle(level, i)} />
          ))}
        </div>
        <div className="tools">
          {vibecoding.tools.map((tool) => (
            <span key={tool.name} className="tool">
              <Logo src={tool.icon} size={24} />
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
              <Logo src={repo.icon} size={32} />
              <span className="row-title">{repo.name}</span>
              <Icon src={icons.external} size={16} className="icon--subtle" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

const HERO_PHOTO = {
  canvas: profile.photo,
  feed: profile.photoFeed,
  mobile: profile.photoMobile,
};

/** Карточка «обо мне». Кадрирование фото своё для холста, ленты и телефона — как в макетах. */
export function HeroCard({ variant = 'canvas' }: { variant?: 'canvas' | 'feed' | 'mobile' }) {
  return (
    <div className={`hero hero--${variant}`}>
      <div className="hero-photo">
        <Img src={HERO_PHOTO[variant]} className="hero-photo-img" />
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
          <LinkButton href={profile.cvUrl} variant="secondary">
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
  children,
}: {
  href: string;
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
}) {
  const external = href.startsWith('http');
  return (
    <a
      className={`btn btn--${variant}`}
      href={href || undefined}
      aria-disabled={!href}
      title={href ? undefined : 'Ссылка скоро появится'}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      {children}
    </a>
  );
}

export function ProjectCard({ project, onOpenCase }: { project: Project; onOpenCase: (caseId: string) => void }) {
  const { action } = project;
  const tags = (
    <div className="tag-list">
      {project.tags.map((t) => (
        <Tag key={t}>{t}</Tag>
      ))}
    </div>
  );
  return (
    <section className={`card card--project${project.logo ? ' card--project-compact' : ''}`}>
      {project.logo ? (
        // Компактная карточка: логотип, название и теги в строку, ниже описание
        <div className="project-text project-text--compact">
          <div className="project-head">
            <img src={project.logo} alt="" width={63} height={63} className="project-logo" draggable={false} />
            <div className="project-title">
              <h2>{project.title}</h2>
              {tags}
            </div>
          </div>
          <p className="muted">{project.description}</p>
        </div>
      ) : (
        <>
          <div className="project-cover">
            <div className="project-tags">{tags}</div>
          </div>
          <div className="project-text">
            <h2>{project.title}</h2>
            <p className="muted">{project.description}</p>
          </div>
        </>
      )}
      {action.kind === 'case' ? (
        <a
          className="btn btn--secondary btn--block"
          href={`#/case/${action.caseId}`}
          onClick={(e) => {
            e.preventDefault();
            onOpenCase(action.caseId);
          }}
        >
          ПОДРОБНЕЕ
        </a>
      ) : (
        <a className="btn btn--secondary btn--block" href={action.url} target="_blank" rel="noreferrer">
          {action.label}
          <Icon src={icons.external} size={16} className="icon--subtle" />
        </a>
      )}
    </section>
  );
}
