// Весь контент сайта в одном месте. Тексты и ссылки меняются здесь.

import { BEHANCE } from './cases';

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

export const profile = {
  name: 'Егоров Никита',
  role: 'Senior Product Designer / Продуктовый дизайнер (Design Systems)',
  about:
    'Работал с B2C-продуктами на 10+ млн пользователей, сложными B2B-интерфейсами и AI-инструментами. Веду задачи полным циклом, от исследований до контроля реализации.',
  tags: ['B2B', 'B2C', 'Web', 'Mobile'],
  photo: asset('photo.jpg'),
  photoFeed: asset('photo-feed.jpg'),
  photoMobile: asset('photo-mobile.jpg'),
  cvUrl: 'https://clck.ru/3THQuC',
  telegramUrl: 'https://t.me/egorov_d_nikita',
  footerHandle: '@egorov.d.nikita',
  footerNote: 'Все права защищены',
  ownerLogin: 'egorov.d.nikita',
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

// Календарь вкладов — src/data/contributions.json, обновляется скриптом scripts/fetch-contributions.mjs
export const vibecoding = {
  title: 'Вайбкодинг',
  tools: [
    { name: 'Paper', icon: asset('tool-paper.png') },
    { name: 'Codex', icon: asset('avatar-codex.png') },
    { name: 'Claude', icon: asset('avatar-claude.png') },
    { name: 'Orca', icon: asset('tool-orca.png') },
  ],
  repos: [
    { name: 'Перейти в GitHub', url: 'https://github.com/egorovdnikita/agent-pulse' },
  ],
};

export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  /** Логотип 63px — компактная карточка без обложки (Базис, Лицей) */
  logo?: string;
  /** Обложка карточки — картинка из макета */
  cover?: string;
  // «Подробнее» открывает кейс на сайте, «Смотреть на Behance» ведёт на внешнюю страницу
  action: { kind: 'case'; caseId: string } | { kind: 'link'; url: string; label: string };
};

// Порядок как в цепочке «Следующий кейс» из макета
export const projects: Project[] = [
  {
    id: 'p1',
    title: 'Как понять, дошёл ли платёж',
    description: 'Спроектировал кассу с понятным статусом платежа.',
    tags: ['iGaming', 'B2C', 'B2B', 'Payments'],
    cover: asset('cover-card-product.jpg'),
    action: { kind: 'case', caseId: '1win-product' },
  },
  {
    id: 'p2',
    title: 'White Label для трёх брендов',
    description: 'Спроектировал библиотеку для трёх брендов.',
    tags: ['Design System', 'White-Label', 'RTL', 'Storybook'],
    cover: asset('cover-card-ds-v4.jpg'),
    action: { kind: 'case', caseId: '1win' },
  },
  {
    id: 'p3',
    title: 'Ростелеком Базис',
    description:
      'Корпоративный сайт разработчика платформ виртуализации: структура для B2B-аудитории и подача сложного продукта',
    tags: ['B2B', 'Web', 'Корпоративный сайт'],
    logo: asset('logo-basis.svg'),
    action: { kind: 'link', url: BEHANCE.basis, label: 'Смотреть на Behance' },
  },
  {
    id: 'p4',
    title: 'Ростелеком Лицей',
    description: 'Раздел «Экзамены» образовательной платформы: подготовка школьников к ОГЭ и ЕГЭ в одном сценарии',
    tags: ['EdTech', 'B2C', 'Web'],
    logo: asset('logo-lyceum.svg'),
    action: { kind: 'link', url: BEHANCE.lyceum, label: 'Смотреть на Behance' },
  },
];

export type Shot = {
  id: 's1' | 's2' | 's3';
  title: string;
  description: string;
  image: string;
  tags: string[];
  bottom?: boolean;
  rotation: number;
  outlined?: boolean;
};

export const shots: Shot[] = [
  { id: 's1', title: 'Wink Музыка', description: 'Стриминговый сервис внутри\nэкосистемы онлайн-кинотеатра WINK', image: asset('shot-wink.jpg'), tags: ['iOS', 'Android', 'Apple TV', 'SmartTV'], rotation: -3.944458232017951 },
  { id: 's2', title: 'ReelView', description: 'Сервис коротких видео сериалов\nдля американского рынка', image: asset('shot-reelview.jpg'), tags: ['iOS', 'Android'], rotation: 3.7976093910559716, outlined: true },
  { id: 's3', title: 'OneTapes', description: 'Веб-сервис для аналитики продаж\nдля игровых маркетплейсов', image: asset('shot-onetapes.jpg'), tags: [], bottom: true, rotation: 2.3720705779599403 },
];

export const icons = {
  lock: asset('ic-lock.svg'),
  chevronRight: asset('ic-chevron-right.svg'),
  chevronLeft: asset('ic-chevron-left.svg'),
  link: asset('ic-link.svg'),
  external: asset('ic-external.svg'),
  download: asset('ic-download.svg'),
  telegram: asset('ic-telegram.svg'),
  close: asset('ic-close.svg'),
  user: asset('ic-user.svg'),
  zoomIn: asset('ic-plus.svg'),
  zoomOut: asset('ic-minus.svg'),
  move: asset('ic-move.svg'),
  hand: asset('ic-hand.svg'),
  reset: asset('ic-reset.svg'),
  canvas: asset('ic-canvas.svg'),
  rows: asset('ic-rows.svg'),
  sun: asset('ic-sun.svg'),
  moon: asset('ic-moon.svg'),
};
