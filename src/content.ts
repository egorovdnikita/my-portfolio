// Весь контент главной в одном месте. Тексты и ссылки меняются здесь.

import { BEHANCE } from './cases';

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

export const profile = {
  name: 'Nikita',
  portrait: asset('chat-portrait-v2.jpg'),
  telegramUrl: 'https://t.me/egorov_d_nikita',
};

export const icons = {
  chevronRight: asset('ic-chevron-right.svg'),
  chevronLeft: asset('ic-chevron-left.svg'),
  close: asset('ic-close.svg'),
  send: asset('chat-send.svg'),
};

export const jobs = [
  { company: '1win', period: '2025 - сейчас', logo: asset('job-1win.png') },
  { company: 'Ростелеком', period: '2023 - 2025', logo: asset('job-rostelecom.png') },
  { company: 'Смарт Юнит', period: '2022 - 2023', logo: asset('job-smartunit.png') },
];

export const tools = [
  { name: 'Paper', icon: asset('tool-paper.png') },
  { name: 'Codex', icon: asset('avatar-codex.png') },
  { name: 'Claude', icon: asset('avatar-claude.png') },
  { name: 'Orca', icon: asset('tool-orca.png') },
];

/** Карточка-превью в чате: кейс открывается на сайте, проекты под NDA ведут на сайт продукта. */
export type Preview = {
  title: string;
  subtitle: string;
  image: string;
  open: { caseId: string } | { url: string };
};

export const previews = {
  cashier: { title: 'Касса казино', subtitle: 'Пополнение, вывод и история', image: asset('chat-cashier.jpg'), open: { caseId: '1win-product' } },
  ds: { title: 'Дизайн-система', subtitle: 'Четыре бренда на общей основе', image: asset('chat-ds.jpg'), open: { caseId: '1win' } },
  wink: { title: 'Wink Музыка', subtitle: 'wink.ru', image: asset('chat-wink.jpg'), open: { url: 'https://wink.ru' } },
  promminer: { title: 'Promminer Pool', subtitle: 'promminer.ru', image: asset('chat-promminer.jpg'), open: { url: 'https://promminer.ru' } },
} satisfies Record<string, Preview>;

export const links = {
  basis: { label: 'Базиса.', url: BEHANCE.basis, icon: asset('chat-basis.svg') },
  lyceum: { label: 'Лицее.', url: BEHANCE.lyceum, icon: asset('chat-lyceum.svg') },
};
