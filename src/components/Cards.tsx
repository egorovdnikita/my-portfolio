import { experience, icons, profile, vibecoding, type Project, type Shot } from '../content';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

/** Логотип 24/40px с градиентной обводкой, как в макете. */
function Logo({ src, size }: { src: string; size: 24 | 40 }) {
  return (
    <span className={`logo logo--${size}`}>
      <img src={src} alt="" draggable={false} />
    </span>
  );
}

export function ExperienceCard() {
  return (
    <section className="card card--exp">
      <div className="exp-top">
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
                <Logo src={item.logo} size={40} />
                <span className="row-text">
                  <span className="row-title">{item.company}</span>
                  <span className="muted">{item.role}</span>
                </span>
                <span className="muted">{item.period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <LinkButton href={profile.cvUrl} variant="secondary" block>
        Скачать CV
        <Icon src={icons.download} size={20} className="icon--strong" />
      </LinkButton>
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
      <LinkButton href={vibecoding.github.url} variant="secondary" block>
        {vibecoding.github.label}
        <Icon src={icons.external} size={20} className="icon--subtle" />
      </LinkButton>
    </section>
  );
}

/** Карточка «обо мне»: без подложки, фото-вырезка сверху, текст и кнопки по центру — как в макете. */
/**
 * Видео-портрет без звука по кругу.
 * React не пишет атрибут muted в разметку, а Safari на iPhone без него не запускает автовоспроизведение — выставляем сами.
 * На холсте iPhone может «принять» запуск, но не показывать кадры: видео лежит в сдвинутом трансформом слое,
 * и Safari ошибочно считает его невидимым. Поэтому «играет» = время видео идёт, а не просто paused === false.
 * Если за 1,5 с кадры не пошли — пересоздаём элемент (Safari заново проверит видимость), при касании — перезапуск.
 */
function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const [attempt, setAttempt] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');

    let playing = false;
    // ВРЕМЕННО: диагностика автозапуска на iPhone по ссылке ?vdebug
    const dbg = VDEBUG ? (msg: string) => setLog((l) => [...l.slice(-14), `${(performance.now() / 1000).toFixed(1)} ${msg}`]) : null;
    if (dbg) {
      ['loadedmetadata', 'loadeddata', 'canplay', 'play', 'playing', 'pause', 'waiting', 'stalled', 'suspend', 'error'].forEach((ev) =>
        v.addEventListener(ev, () => dbg(`${ev} rs=${v.readyState} ns=${v.networkState} t=${v.currentTime.toFixed(2)} p=${v.paused}`)),
      );
      dbg(`mount #${attempt} muted=${v.muted} attr=${v.hasAttribute('muted')} act=${(navigator as any).userActivation?.hasBeenActive}`);
    }
    const GESTURES = ['touchend', 'pointerup', 'click', 'keydown'] as const;
    const removeGestures = () => GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));
    const onTime = () => {
      if (v.currentTime > 0.05 && !v.paused) {
        playing = true;
        removeGestures();
      }
    };
    const tryPlay = () => {
      if (!playing && v.paused) v.play().catch((e) => dbg?.(`play() отказ: ${e?.name} ${e?.message}`));
    };
    // В обработчике касания запуск разрешён всегда; «зависший» запуск сбрасываем паузой
    function onGesture() {
      if (playing) return removeGestures();
      if (!v!.paused) v!.pause();
      v!.play().catch((e) => dbg?.(`gesture play() отказ: ${e?.name}`));
      dbg?.('касание → play()');
    }

    tryPlay();
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadeddata', tryPlay);
    GESTURES.forEach((g) => window.addEventListener(g, onGesture, { capture: true, passive: true }));
    const io = new IntersectionObserver((entries) => {
      dbg?.(`в кадре=${entries.some((e) => e.isIntersecting)}`);
      if (entries.some((e) => e.isIntersecting)) tryPlay();
    });
    io.observe(v);
    const onVisible = () => document.visibilityState === 'visible' && tryPlay();
    document.addEventListener('visibilitychange', onVisible);
    const retry = attempt < 2 ? window.setTimeout(() => !playing && setAttempt((a) => a + 1), 1500) : 0;
    return () => {
      window.clearTimeout(retry);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadeddata', tryPlay);
      removeGestures();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [src, attempt]);
  const video = (
    <video
      key={attempt}
      ref={ref}
      className="hero-photo-img"
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    />
  );
  if (!VDEBUG) return video;
  return (
    <>
      {video}
      {createPortal(
        <pre style={{ position: 'fixed', left: 4, right: 4, top: 4, zIndex: 99999, margin: 0, padding: 6, font: '10px/1.3 monospace', background: 'rgb(0 0 0 / 0.8)', color: '#0f0', whiteSpace: 'pre-wrap', pointerEvents: 'none' }}>
          {log.join('\n')}
        </pre>,
        document.body,
      )}
    </>
  );
}
const VDEBUG = typeof location !== 'undefined' && location.search.includes('vdebug');

export function HeroCard({ variant = 'canvas', theme }: { variant?: 'canvas' | 'feed' | 'mobile'; theme: 'light' | 'dark' }) {
  return (
    <section className={`hero hero--${variant}`}>
      <div className="hero-photo">
        <HeroVideo key={theme} src={profile.video[theme]} poster={profile.poster[theme]} />
        {profile.badges.map((b) => (
          <span
            key={b.text}
            className="hero-badge"
            // Координаты из макета для фото 315px — в процентах, чтобы ярлыки ехали вместе с фото на телефоне
            style={{ left: `${(b.x / 315) * 100}%`, top: `${(b.y / 315) * 100}%`, transform: `rotate(${b.angle}deg)` }}
          >
            {b.text}
          </span>
        ))}
      </div>
      <div className="hero-text">
        <div className="hero-title">
          <h1>{profile.name}</h1>
          <p className="hero-role">{profile.role}</p>
        </div>
        <p className="muted hero-about">{profile.about}</p>
      </div>
      <div className="hero-actions">
        <LinkButton href={profile.linkedinUrl} variant="secondary">
          LinkedIn
          <Icon src={icons.external} size={20} className="icon--subtle" />
        </LinkButton>
        <LinkButton href={profile.telegramUrl} variant="primary">
          Написать TG
          <img src={icons.telegram} alt="" width={24} height={24} draggable={false} />
        </LinkButton>
      </div>
    </section>
  );
}

/** Кнопка-ссылка. Пока ссылка не задана, кнопка видна, но неактивна. */
function LinkButton({
  href,
  variant,
  block,
  children,
}: {
  href: string;
  variant: 'primary' | 'secondary';
  /** Во всю ширину карточки */
  block?: boolean;
  children: React.ReactNode;
}) {
  const external = href.startsWith('http');
  return (
    <a
      className={`btn btn--${variant}${block ? ' btn--block' : ''}`}
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

export function ShotCard({ shot }: { shot: Shot }) {
  return (
    <section
      className={`shot-card${shot.outlined ? ' shot-card--outlined' : ''}`}
      style={{ '--shot-rotation': `${shot.rotation}deg`, '--shot-shade': shot.shade } as React.CSSProperties}
      aria-label={shot.title}
    >
      <div className="shot-surface" style={{ backgroundImage: `url("${shot.image}")` }} />
      <div className="shot-header">
        <div className="shot-text">
          <h2>{shot.title}</h2>
          <p>{shot.description}</p>
        </div>
        <span className="shot-lock" aria-label="Кейс под NDA">
          <img src={icons.lock} alt="" draggable={false} />
        </span>
        <span className="shot-badge">NDA</span>
      </div>
      {shot.tags.length > 0 && <div className="shot-tags">{shot.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
    </section>
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
          <Icon src={icons.external} size={20} className="icon--subtle" />
        </a>
      )}
    </section>
  );
}
