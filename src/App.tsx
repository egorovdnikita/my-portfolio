import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { CasePage } from './components/CasePage';
import { Icon } from './components/Cards';
import { calendar, commitsWord, dayLabel } from './contrib';
import { icons, jobs, links, previews, profile, tools, type Preview } from './content';
import { findCase } from './cases';
import { useTheme } from './theme';

const CASE_CLOSE_MS = 200;

// Кейс открывается по адресу #/case/<id>: ссылку можно скопировать и отправить
const caseFromHash = () => {
  const m = window.location.hash.match(/^#\/case\/([\w-]+)/);
  return findCase(m ? m[1] : null)?.id ?? null;
};

/** Сегодняшняя дата; обновляется в полночь и при возврате на вкладку, чтобы подписи дней не устаревали. */
function useToday() {
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const sync = () => setToday((prev) => (prev.toDateString() === new Date().toDateString() ? prev : new Date()));
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = window.setTimeout(sync, midnight + 1000);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [today]);
  return today;
}

const weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
const dayMonth = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

/** Подпись дня: «Сегодня», «Вчера», дальше «Пт, 20 нояб.» — отсчёт от сегодняшнего дня. */
function dayTitle(daysAgo: number, today: Date) {
  if (daysAgo === 0) return 'Сегодня';
  if (daysAgo === 1) return 'Вчера';
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
  const wd = weekday.format(d);
  return `${wd.charAt(0).toUpperCase()}${wd.slice(1)}, ${dayMonth.format(d)}`;
}

/** Реакция на сообщение: синий кружок с эмодзи и два «пузырька мысли», как в макете. */
function Reaction({ emoji, right = -23, top = -23 }: { emoji: string; right?: number; top?: number }) {
  return (
    <span className="reaction" style={{ right, top }} aria-hidden>
      <span className="reaction-dot reaction-dot--m" />
      <span className="reaction-dot reaction-dot--s" />
      <span className="reaction-face">{emoji}</span>
    </span>
  );
}

function Bubble({ children, reaction, className = '' }: { children: ReactNode; reaction?: ReactNode; className?: string }) {
  return (
    <div className={`bubble${reaction ? ' has-reaction' : ''} ${className}`}>
      {children}
      {reaction}
    </div>
  );
}

/** День переписки: подпись даты и сообщения. Хвостик — у последнего сообщения дня (через CSS). */
function Day({ daysAgo, today, children }: { daysAgo: number; today: Date; children: ReactNode }) {
  return (
    <section className="day">
      <p className="day-title">{dayTitle(daysAgo, today)}</p>
      {children}
    </section>
  );
}

function PreviewCard({ item, onOpenCase, className = '' }: { item: Preview; onOpenCase: (id: string) => void; className?: string }) {
  const body = (
    <>
      <img className="preview-img" src={item.image} alt="" draggable={false} loading="lazy" />
      <span className="preview-text">
        <span className="preview-title">{item.title}</span>
        <span className="preview-sub">{item.subtitle}</span>
      </span>
    </>
  );
  if ('caseId' in item.open) {
    const id = item.open.caseId;
    return (
      <a className={`preview ${className}`} href={`#/case/${id}`} onClick={(e) => (e.preventDefault(), onOpenCase(id))}>
        {body}
      </a>
    );
  }
  return (
    <a className={`preview ${className}`} href={item.open.url} target="_blank" rel="noreferrer">
      {body}
    </a>
  );
}

function Contributions() {
  // Подсказка над клеткой: число коммитов и дата
  const [tip, setTip] = useState<{ i: number; x: number; y: number } | null>(null);
  const onOver = (e: React.PointerEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-i]');
    if (!el) return setTip(null);
    const i = Number(el.dataset.i);
    if (calendar.cells[i].future) return setTip(null);
    setTip({ i, x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop });
  };
  const tipCell = tip && calendar.cells[tip.i];
  return (
    <div
      className="contrib"
      style={{ '--weeks': calendar.weeks } as React.CSSProperties}
      role="img"
      aria-label={`Вклады на GitHub за полгода: ${calendar.total}`}
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
  );
}

/** Ссылка с логотипом перед ней; логотип и слово не разрываются переносом. */
function InlineLink({ link, variant }: { link: { label: string; url: string; icon: string }; variant: 'basis' | 'lyceum' }) {
  return (
    <span className="inline-link">
      <span className={`inline-logo inline-logo--${variant}`} aria-hidden>
        <img src={link.icon} alt="" draggable={false} />
      </span>
      <a href={link.url} target="_blank" rel="noreferrer">
        {link.label}
      </a>
    </span>
  );
}

/**
 * Растворение у краёв экрана, как у sasi.codes: сообщение, уходящее под шапку или под кнопку «Написать»,
 * становится прозрачным и размытым. Считаем по прокрутке, а не CSS view() — так одинаково работает
 * и во встроенном браузере Telegram, и в старых Safari.
 */
function useEdgeDissolve() {
  useEffect(() => {
    const TOP_GONE = 56; // низ сообщения выше этой линии — сообщения не видно
    const TOP_FADE = 96; // длина затухания у шапки
    const BOTTOM_GONE = 24; // верхние 48px сообщения ниже (высота окна − 24) — не видно
    const BOTTOM_FADE = 80;
    const blur = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>('.day-title, .bubble, .preview').forEach((el) => {
        const r = el.getBoundingClientRect();
        const top = (r.bottom - TOP_GONE) / TOP_FADE;
        const bottom = (vh - BOTTOM_GONE - (r.top + Math.min(r.height, 48))) / BOTTOM_FADE;
        const t = Math.max(0, Math.min(1, top, bottom));
        if (t >= 1) {
          if (el.style.opacity) (el.style.opacity = ''), (el.style.filter = '');
          return;
        }
        el.style.opacity = String(Math.round(t * 100) / 100);
        el.style.filter = blur ? `blur(${Math.round((1 - t) * 40) / 10}px)` : '';
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
}

export default function App() {
  const today = useToday();
  useEdgeDissolve();
  useTheme();
  const [caseId, setCaseId] = useState<string | null>(caseFromHash);
  const [caseClosing, setCaseClosing] = useState(false);
  const study = findCase(caseId);

  // Адрес и кнопка «Назад» в браузере управляют открытым кейсом
  useEffect(() => {
    const sync = () => {
      setCaseClosing(false);
      setCaseId(caseFromHash());
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  const openCase = useCallback((id: string) => {
    setCaseClosing(false);
    if (caseFromHash() !== id) window.history.pushState(null, '', `#/case/${id}`);
    setCaseId(id);
  }, []);

  const closeCase = useCallback(() => {
    setCaseClosing(true);
    window.setTimeout(() => {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
      setCaseId(null);
      setCaseClosing(false);
    }, CASE_CLOSE_MS);
  }, []);

  useEffect(() => {
    if (!study) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCase();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [study, closeCase]);

  const caseOpen = Boolean(study) && !caseClosing;
  // Под открытым кейсом страница не прокручивается
  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', Boolean(study));
  }, [study]);

  return (
    <div className={`chat-app${caseOpen ? ' has-case' : ''}`}>
      <header className="chat-head">
        <a className="contact" href={profile.telegramUrl} target="_blank" rel="noreferrer" aria-label="Написать в Telegram">
          <span className="contact-photo">
            <img src={profile.portrait} alt="" draggable={false} />
          </span>
          <span className="contact-pill">
            {profile.name}
            <Icon src={icons.chevronRight} className="icon--subtle" />
          </span>
        </a>
      </header>

      <main className="chat">
        <Day daysAgo={6} today={today}>
          <Bubble>Привет, я Никита 👋 Продуктовый дизайнер.</Bubble>
          {jobs.map((job) => (
            <Bubble key={job.company} className="bubble--job">
              <img className="job-logo" src={job.logo} alt="" draggable={false} />
              <span className="job-name">{job.company}</span>
              <span className="job-period">{job.period}</span>
            </Bubble>
          ))}
          <Bubble reaction={<Reaction emoji="👀" />}>Четыре года в продуктовом дизайне.</Bubble>
          <Bubble>Сейчас — ведущий дизайнер.</Bubble>
        </Day>

        <Day daysAgo={5} today={today}>
          <Bubble className="bubble--contrib">
            <Contributions />
          </Bubble>
          <Bubble className="bubble--tools">
            {tools.map((tool) => (
              <span key={tool.name} className="tool">
                <img className="tool-logo" src={tool.icon} alt="" draggable={false} />
                {tool.name}
              </span>
            ))}
          </Bubble>
          <Bubble>В последнее время увлёкся приложениями с AI.</Bubble>
          <Bubble>Нравится, что идею можно сразу попробовать.</Bubble>
        </Day>

        <Day daysAgo={4} today={today}>
          <PreviewCard item={previews.cashier} onOpenCase={openCase} className="preview--case" />
          <Bubble>Покажу одну из последних задач — кассу.</Bubble>
          <Bubble>Оказалось, банк и крипта требуют разных шагов.</Bubble>
        </Day>

        <Day daysAgo={3} today={today}>
          <PreviewCard item={previews.ds} onOpenCase={openCase} className="preview--case" />
          <Bubble>А вот задача уже про четыре бренда.</Bubble>
          <Bubble>Собирал общую систему и искал, где оставить свободу.</Bubble>
        </Day>

        <Day daysAgo={2} today={today}>
          <Bubble className="bubble--links" reaction={<Reaction emoji="👀" right={-19} top={-20.75} />}>
            <span>А ещё — сайт</span>
            <InlineLink link={links.basis} variant="basis" />
            <span>и раздел экзаменов в</span>
            <InlineLink link={links.lyceum} variant="lyceum" />
          </Bubble>
        </Day>

        <Day daysAgo={1} today={today}>
          <div className="preview-row">
            <PreviewCard item={previews.wink} onOpenCase={openCase} className="preview--nda" />
            <PreviewCard item={previews.promminer} onOpenCase={openCase} className="preview--nda" />
          </div>
          <Bubble>Ещё проектировал музыкальный сервис и майнинг-пул.</Bubble>
          <Bubble>Подробности этих проектов — под NDA.</Bubble>
        </Day>

        <Day daysAgo={0} today={today}>
          <Bubble reaction={<Reaction emoji="🤝" top={-20.75} />}>Буду рад познакомиться. Расскажете о своей команде?</Bubble>
        </Day>
      </main>

      <div className="compose">
        <a className="compose-btn" href={profile.telegramUrl} target="_blank" rel="noreferrer">
          Написать
          <img src={icons.send} alt="" width={20} height={20} draggable={false} />
        </a>
      </div>

      {study && <CasePage study={study} zoom={1} closing={caseClosing} onClose={closeCase} />}
    </div>
  );
}
