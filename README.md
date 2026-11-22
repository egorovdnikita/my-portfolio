# my-portfolio

Портфолио в виде холста: карточки со связями, перемещение и масштаб, режим ленты.

## Запуск

```bash
npm install
npm run dev
```

## Управление холстом

- Рука (H) — двигать холст, стрелка (V) — перетаскивать карточки, пробел — временно рука.
- Колесо / трекпад — прокрутка, Ctrl/⌘ + колесо или щипок — масштаб, ⌘ + / ⌘ − / ⌘ 0.
- ↻ возвращает карточки и камеру на места.

Тексты и ссылки главной — в `src/content.ts`, тексты кейсов — в `src/cases.ts`. Шрифт Inter (SIL OFL 1.1) подключается из пакета `@fontsource/inter`, только начертания 500 и 600 для латиницы и кириллицы; Iosevka Bold — только для ярлыка NDA.

Публикация: GitHub Actions собирает сайт и выкладывает на GitHub Pages при пуше в `main`. Основной адрес — https://egorovdnikita.ru/.

Анимированные emoji — [Telegram Animated Emojis](https://github.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis), из пака [Animated TeleEmojis](https://telegram-emojis.vercel.app/). Права на изображения принадлежат Telegram. Файлы хранятся локально в `public/assets/emoji-*.webp`.
