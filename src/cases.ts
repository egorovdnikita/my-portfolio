// Кейсы «Касса» и «DS» — переписка по макету Figma «Новый сайт», кадры «Case Card — Касса» и «Case Card — DS».

/**
 * Картинка, галерея, сравнение или анимированный эмодзи над заголовком.
 * ratio — пропорция кадра из макета, например '552 / 330.1'; radius — скругление, если не 24
 */
export type CaseMedia = (
  | { media: 'image'; src: string; alt: string; ratio: string }
  | { media: 'emoji'; src: string; alt: string }
  /** background — общий неподвижный фон; слайды — прозрачные картинки размером с кадр, листаются поверх фона */
  | { media: 'gallery'; background: string; slides: { src: string; alt: string }[]; ratio: string }
  /** Две картинки: before слева от разделителя, after справа; разделитель со скруглёнными краями перетаскивается */
  | { media: 'compare'; before: string; after: string; alt: string; ratio: string }
) & { radius?: number };

/**
 * Секция-переписка: подпись по центру, вопрос справа, картинки и ответы слева.
 * mediaGap — отступ между картинками и ответами: 4, если картинка лежит в одном блоке с ответами, иначе 12
 */
export type CaseSection = {
  label: string;
  question: string;
  media?: CaseMedia[];
  mediaGap?: 4 | 12;
  answers: string[];
};

export type CaseStudy = {
  id: string;
  /** Анимированный эмодзи над заголовком, 128×128 */
  cover: CaseMedia;
  title: string;
  lead: string;
  meta: { label: string; value: string }[];
  sections: CaseSection[];
};

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

export const BEHANCE = {
  basis: 'https://www.behance.net/gallery/199583107/sajt-rostelekom-bazis',
  lyceum: 'https://www.behance.net/gallery/207229405/rostelekom-licej-ekzameny',
};

const RATIO = '552 / 330.1';

const cashier: CaseStudy = {
  id: '1win-product',
  cover: { media: 'emoji', src: asset('emoji-coin.webp'), alt: 'Монета' },
  title: 'Касса, которая не теряет платёж',
  lead: 'Пересобрал кассу iGaming-платформы: пополнение, вывод и история для фиата и крипты в одном модуле. Сбой провайдера больше не обрывает сценарий.',
  meta: [
    { label: 'Роль', value: 'Ведущий дизайнер' },
    { label: 'Команда', value: 'Продуктовая команда' },
    { label: 'Масштаб', value: '8 валют, ~20 методов' },
    { label: 'Период', value: '2025 — сейчас' },
  ],
  sections: [
    {
      label: 'Моя роль',
      question: 'Что ты делал в проекте?',
      answers: ['Спроектировал кассу целиком: депозит, вывод, история', 'Руководил A/B-тестом и вёл итерации до релиза'],
    },
    {
      label: 'Контекст',
      question: 'Почему сбой провайдера — это сбой продукта?',
      answers: ['Реквизиты приходят не сразу', 'Методы отключаются без предупреждения', 'А пользователь видит не провайдера, а кассу'],
    },
    {
      label: 'Исследование',
      question: 'Откуда знал, что чинить?',
      answers: [
        'Разобрал обращения в поддержку и воронку кассы',
        'Сравнил кассы конкурентов',
        'С разработкой и безопасностью собрал ограничения',
      ],
    },
    {
      label: 'Цели',
      question: 'Как поймём, что сработало?',
      answers: [
        'Платёж зачисляется сам — доля автозачислений',
        'Сбой не рвёт сессию — депозиты другим методом',
        'Одна касса на все рынки — конверсия',
      ],
    },
    {
      label: 'Решение 1 · Пополнение',
      question: 'Как платёж доходит без ручной сверки?',
      media: [
        {
          media: 'gallery',
          background: asset('case-product-cashier-bg.webp'),
          slides: [1, 2].map((i) => ({ src: asset(`case-product-deposit-${i}.webp`), alt: `Пополнение, слайд ${i}` })),
          ratio: RATIO,
        },
      ],
      answers: [
        'Быстрое пополнение — прошлый метод уже выбран',
        'Касса меняет сумму на несколько рублей',
        'По ней платёж зачисляется сам',
        'Поиск реквизитов — до 90 секунд, с повтором',
      ],
    },
    {
      label: 'Решение 2 · Сбои',
      question: 'Что, если метод упал?',
      answers: ['Недоступный метод заменяется популярным', 'Без фиата ведём в крипту'],
    },
    {
      label: 'Решение 3 · Вывод',
      question: 'Что видно до кнопки вывода?',
      media: [
        {
          media: 'gallery',
          background: asset('case-product-cashier-bg.webp'),
          slides: [1, 2].map((i) => ({ src: asset(`case-product-withdraw-${i}.webp`), alt: `Вывод, слайд ${i}` })),
          ratio: RATIO,
        },
      ],
      mediaGap: 12,
      answers: ['Сумма к зачислению и бонусы, которые сгорят', 'Профиль не подтверждён — сразу ведём в профиль'],
    },
    {
      label: 'A/B-тест',
      question: 'Быстрый или стандартный вывод?',
      media: [{ media: 'image', src: asset('case-product-ab.webp'), alt: 'Вывод: быстрый и стандартный', ratio: RATIO }],
      mediaGap: 12,
      answers: [
        'Часть комиссии переносим на пользователя',
        'Тест вёл дизайнер команды под моим руководством',
        'Быстрый — от 20 минут, с комиссией',
        'Стандартный — от 120 минут',
      ],
    },
    {
      label: 'Процесс',
      question: 'Как довёл до релиза?',
      answers: ['Каждая задача: Preview → Ready for dev', 'Около 900 экранов, 4 брейкпоинта, анимации в CodePen'],
    },
    {
      label: 'Результат',
      question: 'Что в итоге?',
      answers: [
        'Охват — 8 валют и около 20 методов',
        'Автозачисление — по уникальной сумме',
        'Устойчивость — у каждого сбоя есть следующий шаг',
      ],
    },
  ],
};

const designSystem: CaseStudy = {
  id: '1win',
  cover: { media: 'emoji', src: asset('emoji-dividers.webp'), alt: 'Разделители картотеки' },
  title: 'Одна система для четырёх брендов',
  lead: 'Вместе с дизайн-лидом перестроил дизайн-систему White-Label продуктов: общий Foundation, брендовые библиотеки поверх него и процесс от задачи до Storybook.',
  meta: [
    { label: 'Роль', value: 'Ведущий дизайнер' },
    { label: 'Команда', value: '5 дизайнеров' },
    { label: 'Масштаб', value: '4 бренда, 16+ стран' },
    { label: 'Период', value: '2025 — сейчас' },
  ],
  sections: [
    {
      label: 'Моя роль',
      question: 'Что ты делал в проекте?',
      answers: ['С дизайн-лидом определил архитектуру библиотек', 'Выстроил DesignOps и вёл команду: ревью, ИПР'],
    },
    {
      label: 'Проблема',
      question: 'Что было не так?',
      answers: ['Компоненты брендов разъезжались', 'Правку повторяли в каждом бренде', 'Разработка получала разные макеты'],
    },
    {
      label: 'Исследование',
      question: 'Что показал аудит?',
      answers: [
        'Библиотека не была готова к масштабированию',
        'Аудит прогнал через AI — собрал для этого плагин',
        'Разделил, что меняется по бренду, а что общее',
        'Сверил библиотеку со Storybook',
      ],
    },
    {
      label: 'Решение 1 · Архитектура',
      question: 'Какие три слоя библиотек?',
      media: [
        {
          media: 'compare',
          before: asset('case-cover-ds-jetton.webp'),
          after: asset('case-cover-ds-tonplay.webp'),
          alt: 'Продуктовые библиотеки двух брендов',
          ratio: '552 / 330',
        },
        {
          media: 'image',
          src: asset('case-ds-architecture.webp'),
          alt: 'Схема библиотек: Foundation → Core бренда → Product',
          ratio: '552 / 534.6',
          radius: 17.4,
        },
      ],
      answers: ['Foundation → Core бренда → Product', 'Каждый слой берёт только из нижнего'],
    },
    {
      label: 'Решение 2 · Токены',
      question: 'Как бренд стал режимом переменных?',
      media: [
        {
          media: 'gallery',
          background: asset('case-ds-gallery-bg.webp'),
          slides: [1, 2, 3, 4].map((i) => ({ src: asset(`case-ds-gallery-${i}.webp`), alt: `Токены, слайд ${i}` })),
          ratio: RATIO,
        },
      ],
      answers: ['348 переменных в 7 коллекциях', 'Режим бренда меняет цвет, шрифт и скругления', 'Цвет — Primitive → Semantic → Component'],
    },
    {
      label: 'Решение 3 · Связь с кодом',
      question: 'Когда компонент считается готовым?',
      answers: ['Ready for dev — только когда компонент есть в Storybook', 'У готового две ссылки: Figma и Storybook'],
    },
    {
      label: 'Процесс',
      question: 'Как задача доходит до разработки?',
      answers: ['Creation Guide — Preview, Workspace, Ready for dev', 'Task Preview — задача для БА и ПМ в одном месте'],
    },
    {
      label: 'Результат',
      question: 'Что в итоге?',
      media: [
        {
          media: 'compare',
          before: asset('case-ds-compare-A1.webp'),
          after: asset('case-ds-compare-B1.webp'),
          alt: 'Одни экраны в двух брендах',
          ratio: '552 / 282.6',
        },
      ],
      answers: [
        'Новый бренд — набор значений, не компонентов',
        'Launch Kit — старт с готовых шаблонов',
        'Процесс — от Jira до Ready for dev',
      ],
    },
  ],
};

export const cases: CaseStudy[] = [designSystem, cashier];
export const findCase = (id: string | null) => cases.find((c) => c.id === id) ?? null;
