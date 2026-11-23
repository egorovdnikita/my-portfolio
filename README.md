# my-portfolio

Портфолио продуктового дизайнера в виде переписки в iMessage: главная — чат с рассказом об опыте, карточками проектов и календарём коммитов на GitHub. Кейсы открываются панелью справа и тоже построены как переписка: вопрос — ответы, картинки, галереи и сравнение «до/после» с перетаскиваемым разделителем.

## Запуск

```bash
npm install
npm run dev
```

## Где что лежит

- `src/content.ts` — тексты и ссылки главной: опыт, инструменты, карточки проектов.
- `src/cases.ts` — кейсы: заголовок, мета, секции с вопросами, ответами и картинками.
- `src/App.tsx` — чат главной, `src/components/CasePage.tsx` — панель кейса.
- `public/assets` — картинки и анимации.

Шрифт Inter (SIL OFL 1.1) подключается из пакета `@fontsource/inter`, только начертания 500 и 600 для латиницы и кириллицы.

## Календарь коммитов

`npm run contributions` забирает вклады с GitHub за последние полгода в `src/data/contributions.json`. При публикации скрипт запускается сам; если GitHub недоступен, остаются прежние данные.

## Публикация

GitHub Actions собирает сайт и выкладывает на GitHub Pages при пуше в `main`. Адрес — https://egorovdnikita.ru/.

## Эмодзи

Анимированные эмодзи — [Telegram Animated Emojis](https://github.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis) из пака [Animated TeleEmojis](https://telegram-emojis.vercel.app/). Права на изображения принадлежат Telegram. Файлы хранятся локально в `public/assets/emoji-*.webp`, уменьшенные под размер на странице.

## presence

`presence/` — Cloudflare Worker для показа посетителей сайта в реальном времени. Сейчас сайт его не использует.
