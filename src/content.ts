// Весь контент сайта в одном месте. Тексты и ссылки меняются здесь.

import { BEHANCE } from './cases';

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

export const profile = {
  name: 'Егоров Никита',
  role: 'Продуктовый дизайнер (Design Systems)',
  about: 'Работал с B2C-продуктами на 10+ млн пользователей, сложными B2B-интерфейсами и AI-инструментами.',
  /** Ярлыки поверх фото: положение и наклон как в макете (x, y — угол рамки до поворота, в px от фото 315×315) */
  badges: [
    { text: 'Design Systems', x: -43, y: 142, angle: -15 },
    { text: '4 года опыта', x: 244, y: 251, angle: 7.83 },
  ],
  /** Вырезка с прозрачным фоном и растушёвкой снизу, 3x от 315px */
  photo: asset('hero-photo.png'),
  cvUrl: 'https://clck.ru/3THQuC',
  linkedinUrl: 'https://www.linkedin.com/in/egorovdnikita/',
  telegramUrl: 'https://t.me/egorov_d_nikita',
  footerHandle: '@egorov.d.nikita',
  footerNote: 'Все права защищены',
  ownerLogin: 'egorov.d.nikita',
};

export const experience = {
  title: 'Опыт работы',
  total: '4 года',
  items: [
    { company: '1win', role: 'Ведущий дизайнер (Senior)', period: '2025 - сейчас', logo: asset('job-1win.png') },
    { company: 'Ростелеком', role: 'Продуктовый дизайнер (Senior)', period: '2023 - 2025', logo: asset('job-rostelecom.png') },
    { company: 'Смарт Юнит', role: 'Продуктовый дизайнер (Middle)', period: '2022 - 2023', logo: asset('job-smartunit.png') },
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
  github: { label: 'Перейти в GitHub', url: 'https://github.com/egorovdnikita/agent-pulse' },
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
    title: 'White Label для четырёх брендов',
    description: 'Спроектировал библиотеку для четырёх брендов.',
    tags: ['Design System', 'White-Label', 'RTL', 'Storybook'],
    cover: asset('cover-card-ds-v5.jpg'),
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
  id: 's1' | 's2';
  title: string;
  description: string;
  image: string;
  tags: string[];
  /** Затемнение под заголовком (непрозрачность низа градиента в макете) */
  shade: number;
  rotation: number;
  outlined?: boolean;
};

// Кейсы под NDA: только обложка, без страницы кейса
export const shots: Shot[] = [
  { id: 's1', title: 'Wink Музыка', description: 'Стриминговый сервис внутри\nэкосистемы онлайн-кинотеатра WINK', image: asset('shot-wink-v2.jpg'), tags: ['iOS', 'Android', 'Apple TV', 'SmartTV'], shade: 0.5, rotation: -3.944458232017951 },
  { id: 's2', title: 'ReelView', description: 'Сервис коротких видео сериалов\nдля американского рынка', image: asset('shot-reelview-v2.jpg'), tags: ['iOS', 'Android'], shade: 0.3, rotation: 3.7976093910559716, outlined: true },
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
