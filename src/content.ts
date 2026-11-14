// Весь контент сайта в одном месте. Тексты и ссылки меняются здесь.

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

export const profile = {
  name: 'Егоров Никита',
  role: 'Senior Product Designer / Продуктовый дизайнер (Design Systems)',
  about:
    'Я продуктовый дизайнер с опытом 5+ лет. Работал с B2C-продуктами на 10+ млн пользователей, сложными B2B-интерфейсами и AI-инструментами. Веду задачи полным циклом, от исследований до контроля реализации.',
  tags: ['B2B', 'B2C', 'Web', 'Mobile'],
  photo: asset('photo.jpg'),
  // TODO: ссылка на резюме (PDF положить в public/ и указать путь) и на Telegram
  cvUrl: '',
  telegramUrl: '',
  footerHandle: '@egorov.d.nikita',
};

export const experience = {
  title: 'Опыт работы',
  total: '4 года',
  items: [
    { company: '1win', period: '2025 - сейчас', logo: asset('job-1win.png') },
    { company: 'Ростелеком', period: '2023 - 2025', logo: asset('job-rostelecom.png') },
    { company: 'Смарт Юнит', period: '2022 - 2023', logo: asset('job-smartunit.png') },
  ],
};

// Уровни активности: 0 — нет, 1 — слабая, 2 — средняя, 3 — высокая
export const vibecoding = {
  title: 'Вайбкодинг',
  contributions: '1,189 contributions',
  activity: [0, 0, 3, 0, 0, 3, 3, 1, 3, 1, 1, 0, 0, 1, 0, 3, 3, 3, 2, 1, 1, 1, 1, 3, 3, 3, 3, 0, 1, 0],
  tools: [
    { name: 'Paper', icon: asset('tool-paper.png') },
    { name: 'Codex', icon: asset('avatar-codex.png') },
    { name: 'Claude', icon: asset('avatar-claude.png') },
    { name: 'Orca', icon: asset('tool-orca.png') },
  ],
  repos: [
    { name: 'agent-pulse', icon: asset('repo-agent-pulse.png'), url: 'https://github.com/egorovdnikita/agent-pulse' },
    { name: 'figma-ds-analytics', icon: asset('repo-github.png'), url: 'https://github.com/egorovdnikita/figma-ds-analytics' },
  ],
};

export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  // «Подробнее» открывает кейс поверх холста, «Перейти» ведёт по внешней ссылке
  action: { kind: 'case' } | { kind: 'link'; url: string };
};

export const projects: Project[] = [
  {
    id: 'p1',
    title: 'Название проекта',
    description: 'Холдинг разрабатывает и поддерживает масштабируемую инфраструктуру, объединяющую десятки сервисов',
    tags: ['B2B', 'B2C', 'Web', 'Mobile'],
    action: { kind: 'case' },
  },
  {
    id: 'p2',
    title: 'Название проекта',
    description: 'Холдинг разрабатывает и поддерживает масштабируемую инфраструктуру, объединяющую десятки сервисов',
    tags: ['B2B', 'B2C', 'Web', 'Mobile'],
    action: { kind: 'link', url: '' },
  },
  {
    id: 'p3',
    title: 'Название проекта',
    description: 'Холдинг разрабатывает и поддерживает масштабируемую инфраструктуру, объединяющую десятки сервисов',
    tags: ['B2B', 'B2C', 'Web', 'Mobile'],
    action: { kind: 'link', url: '' },
  },
];

export const headerAvatars = [
  { name: 'Codex', src: asset('avatar-codex.png') },
  { name: 'Claude', src: asset('avatar-claude.png') },
];

export const icons = {
  chevronRight: asset('ic-chevron-right.svg'),
  chevronDown: asset('ic-chevron-down.svg'),
  link: asset('ic-link.svg'),
  external: asset('ic-external.svg'),
  download: asset('ic-download.svg'),
  telegram: asset('ic-telegram.svg'),
  zoomIn: asset('ic-zoom-in.svg'),
  zoomOut: asset('ic-zoom-out.svg'),
  move: asset('ic-move.svg'),
  hand: asset('ic-hand.svg'),
  reset: asset('ic-reset.svg'),
  canvas: asset('ic-canvas.svg'),
  rows: asset('ic-rows.svg'),
};
