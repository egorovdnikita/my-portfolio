// Весь контент главной в одном месте. Тексты и ссылки меняются здесь.

import { BEHANCE } from './cases';

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

export const profile = {
  name: 'Nikita',
  telegramUrl: 'https://t.me/egorov_d_nikita',
};

export const icons = {
  chevronRight: asset('ic-chevron-right.svg'),
  close: asset('ic-close.svg'),
  send: asset('chat-send.svg'),
  external: asset('ic-external.svg'),
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
/**
 * Карточка-превью в чате: квадратная картинка, внизу плашка с подписью (домен).
 * Кейс открывается на сайте; у внешних ссылок рядом с подписью значок «открыть в новой вкладке».
 */
export type Preview = {
  /** Название проекта — для подписи картинки (alt) */
  title: string;
  /** Подпись на плашке, как в макете */
  label: string;
  image: string;
  open: { caseId: string } | { url: string };
};

export const previews = {
  cashier: { title: 'Касса казино', label: 'igaming.com', image: asset('chat-cashier-v4.webp'), open: { caseId: '1win-product' } },
  ds: { title: 'Дизайн-система', label: 'whitelabel.com', image: asset('chat-ds-v3.webp'), open: { caseId: '1win' } },
  wink: { title: 'Wink Музыка', label: 'wink.ru', image: asset('chat-wink-v3.webp'), open: { url: 'https://wink.ru' } },
  promminer: { title: 'Promminer Pool', label: 'promminer.ru', image: asset('chat-promminer-v3.webp'), open: { url: 'https://promminer.ru' } },
} satisfies Record<string, Preview>;

export const links = {
  basis: { label: 'Базиса', url: BEHANCE.basis, icon: asset('chat-basis.svg') },
  lyceum: { label: 'Лицее', url: BEHANCE.lyceum, icon: asset('chat-lyceum.svg') },
  github: { label: 'GitHub', url: 'https://github.com/egorovdnikita' },
  workspace: { label: 'Workspace.ru', url: 'https://workspace.ru/' },
};
