import { experience, icons, profile, vibecoding, type Project } from '../content';
import { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';
import contributions from '../data/contributions.json';

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

const MONTHS = ['янв', 'февр', 'март', 'апр', 'май', 'июнь', 'июль', 'авг', 'сент', 'окт', 'нояб', 'дек'];
const DAY_MS = 86_400_000;

// Сетка как у GitHub, но неделя с понедельника (как у референса): столбец — неделя, строка — день.
// Дни после «сегодня» (на момент сборки) приглушены. Подпись месяца — над неделей, где лежит 1-е число.
const calendar = (() => {
  const start = Date.parse(`${contributions.start}T00:00:00Z`);
  const today = Date.parse(`${contributions.today}T00:00:00Z`);
  const weeks = Math.ceil((today - start) / DAY_MS / 7 + 1 / 7);
  const cells = Array.from({ length: weeks * 7 }, (_, i) => {
    const [count, level] = contributions.days[i] ?? [0, 0];
    const date = new Date(start + i * DAY_MS);
    return { week: Math.floor(i / 7), count, level, date, future: date.getTime() > today };
  });
  const months: { label: string; col: number }[] = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start + (w * 7 + d) * DAY_MS);
      if (date.getUTCDate() === 1) months.push({ label: MONTHS[date.getUTCMonth()], col: w + 1 });
    }
  }
  return { weeks, cells, months };
})();
const formatCount = (n: number) => `${n.toLocaleString('en-US')} contributions`;
// 1 коммит, 2 коммита, 5 коммитов, 21 коммит
const commitsWord = (n: number) => {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return 'коммит';
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return 'коммита';
  return 'коммитов';
};
const MONTHS_OF = ['янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня', 'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
const dayLabel = (date: Date) => `${date.getUTCDate()} ${MONTHS_OF[date.getUTCMonth()]}`;

type Tip = { i: number; x: number; y: number };

/** Исходный клип Triangle / Thinking из локального пака AgentPulse. */
// Боты пака Agent Pals: у каждого свой облик, клип один и тот же — «Thinking»
const AGENT_PALS = [
  'Arch', 'Briefcase', 'Cat', 'Circle', 'Cloud', 'Clover', 'Drop', 'Flame', 'Flower',
  'Ghost', 'Heart', 'Hexagon', 'Oval', 'Pill', 'Scallop', 'Square', 'Star', 'Triangle',
];
const LAST_BOT_KEY = 'agent-pal';

/** Случайный бот при каждой загрузке, но не тот, что был в прошлый раз. Выбор один на загрузку страницы */
let chosenBot: string | null = null;
function pickBot() {
  if (chosenBot) return chosenBot;
  let last: string | null = null;
  try {
    last = localStorage.getItem(LAST_BOT_KEY);
  } catch {
    /* приватный режим — просто без запоминания */
  }
  const pool = AGENT_PALS.filter((b) => b !== last);
  const bot = pool[Math.floor(Math.random() * pool.length)];
  chosenBot = bot;
  try {
    localStorage.setItem(LAST_BOT_KEY, bot);
  } catch {
    /* ignore */
  }
  return bot;
}

function AgentPulseLogo() {
  const container = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!container.current) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animation = lottie.loadAnimation({
      container: container.current,
      renderer: 'svg',
      loop: true,
      autoplay: !reducedMotion.matches,
      path: `${import.meta.env.BASE_URL}assets/agent-pals/${pickBot()}.json`,
    });
    const onMotionChange = () => reducedMotion.matches ? animation.goToAndStop(0, true) : animation.play();
    reducedMotion.addEventListener('change', onMotionChange);
    return () => {
      reducedMotion.removeEventListener('change', onMotionChange);
      animation.destroy();
    };
  }, []);
  return <span className="agent-pulse-logo" aria-hidden><span ref={container} className="agent-pulse-animation" /></span>;
}

export function VibeCard() {
  // Подсказка над клеткой: число коммитов и дата. Координаты — внутри .contrib, поэтому работают и на холсте с масштабом
  const [tip, setTip] = useState<Tip | null>(null);
  const onOver = (e: React.PointerEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-i]');
    if (!el) return setTip(null);
    const i = Number(el.dataset.i);
    if (calendar.cells[i].future) return setTip(null);
    setTip({ i, x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop });
  };
  const tipCell = tip && calendar.cells[tip.i];

  return (
    <section className="card card--vibe">
      <div className="vibe-top">
        <div className="card-head">
          <span className="muted">{vibecoding.title}</span>
          <Divider />
          <span className="muted">{formatCount(contributions.total)}</span>
        </div>
        <div
          className="contrib"
          style={{ '--weeks': calendar.weeks } as React.CSSProperties}
          role="img"
          aria-label={`Вклады на GitHub за полгода: ${contributions.total}`}
        >
          <div className="contrib-months" aria-hidden>
            {calendar.months.map((m) => (
              <span key={`${m.label}-${m.col}`} style={{ gridColumn: m.col }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="contrib-grid" aria-hidden onPointerOver={onOver} onPointerLeave={() => setTip(null)}>
            {calendar.cells.map((c, i) => (
              <span
                key={i}
                data-i={i}
                className={`contrib-cell${c.future ? ' is-future' : ''}${tip?.i === i ? ' is-hover' : ''}`}
                data-level={c.level}
                style={{ '--col': c.week } as React.CSSProperties}
              />
            ))}
          </div>
          {tipCell && (
            <span className="contrib-tip" style={{ left: tip.x, top: tip.y }} aria-hidden>
              {tipCell.count ? `${tipCell.count} ${commitsWord(tipCell.count)}` : 'Нет коммитов'} · {dayLabel(tipCell.date)}
            </span>
          )}
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
              <AgentPulseLogo />
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
            Скачать CV
            <Icon src={icons.download} size={24} className="icon--strong" />
          </LinkButton>
          <LinkButton href={profile.telegramUrl} variant="primary">
            Написать TG
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
            <span className="logo logo--63 project-logo">
              <img src={project.logo} alt="" width={63} height={63} draggable={false} />
            </span>
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
            {project.cover && <img className="project-cover-img" src={project.cover} alt="" draggable={false} />}
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
          Подробнее
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
