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
 * Секция-переписка: подпись по центру, вопрос справа, картинки и ответы слева (отступ 4px).
 */
export type CaseSection = {
  label: string;
  question: string;
  media?: CaseMedia[];
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
    { label: 'Команда', value: 'PM, BA и QA' },
    { label: 'Масштаб', value: '40+ методов' },
    { label: 'Период', value: '2025 — сейчас' },
  ],
  sections: [
    {
      label: 'Моя роль',
      question: 'Что ты делал в проекте?',
      answers: ['Спроектировал кассу целиком: депозит, вывод, история', 'Руководил A/B-тестом и вёл итерации до релиза'],
    },
    {
      label: 'Проблема',
      question: 'Почему сбой провайдера — это сбой продукта?',
      answers: [
        'Банки блокируют прямые платежи — только переводы',
        'Реквизиты выдаёт провайдер — не сразу и не всегда',
        'А пользователь видит не провайдера, а кассу',
      ],
    },
    {
      label: 'Исследование',
      question: 'Откуда знал, что чинить?',
      answers: [
        'Топ жалоб: деньги ушли, а баланс пуст',
        'И крипта, отправленная не в ту сеть',
        'Посмотрел воронку и кассы конкурентов',
        'С разработкой собрал ограничения провайдеров',
      ],
    },
    {
      label: 'Цель',
      question: 'Как поймём, что сработало?',
      answers: [
        'Цель — меньше сорванных депозитов и ручной сверки',
        'Платёж зачисляется сам — доля автозачислений',
        'Сбой не рвёт сессию — депозиты другим методом',
        'Раскатывали по брендам — сравнивали со старой',
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
        'Провайдер меняет сумму — я сделал это понятным',
        'По ней платёж зачисляется сам',
        'Поиск реквизитов — до 90 секунд, с повтором',
      ],
    },
    {
      label: 'Решение 2 · Сбои',
      question: 'Что, если метод упал?',
      answers: ['Быстрое пополнение — прошлый метод уже выбран', 'Недоступный метод заменяется популярным', 'Без фиата ведём в крипту'],
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
      answers: ['Сумма к зачислению и бонусы, которые сгорят', 'Профиль не подтверждён — сразу ведём в профиль'],
    },
    {
      label: 'A/B-тест',
      question: 'Быстрый или стандартный вывод?',
      media: [{ media: 'image', src: asset('case-product-ab.webp'), alt: 'Вывод: быстрый и стандартный', ratio: RATIO }],
      answers: [
        'Хотели переложить часть комиссии на пользователя',
        'Тест вёл дизайнер команды под моим руководством',
        'Быстрый — от 20 минут, с комиссией',
        'Стандартный — от 120 минут',
        'Гипотеза не подтвердилась — быстрый вывод убрали',
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
        'Конверсия +15% — оплату доводят до конца',
        'Обращений −20–40% — платежи доходят сами',
        '8 валют — новый рынок без новой кассы',
      ],
    },
  ],
};

const designSystem: CaseStudy = {
  id: '1win',
  cover: { media: 'emoji', src: asset('emoji-robot.webp'), alt: 'Робот' },
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
      answers: ['Один продукт, 4 бренда — компоненты разъехались', 'Правку повторяли в каждом бренде', 'Разработка получала разные макеты'],
    },
    {
      label: 'Цель',
      question: 'Зачем это бизнесу?',
      answers: ['Новый бренд — без новой разработки', 'Команда не делает одну работу четыре раза'],
    },
    {
      label: 'Исследование',
      question: 'Что показал аудит?',
      answers: [
        'Прогнал библиотеку через свой AI-плагин',
        'Нашёл хардкод цветов и отвязанные инстансы',
        'Дубли компонентов по брендам, нехватка состояний',
        'Разделил, что меняется по бренду, а что общее',
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
      answers: [
        'Сначала Figma уходила вперёд Storybook',
        'Теперь Ready for dev — только когда компонент в коде',
        'У готового две ссылки: Figma и Storybook',
      ],
    },
    {
      label: 'Процесс',
      question: 'Как задача доходит до разработки?',
      answers: [
        'Creation Guide — Preview, Workspace, Ready for dev',
        'Task Preview — задача для БА и ПМ в одном месте',
        'Всех сразу перевести не вышло — пошли по продукту',
      ],
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
        'Бренд за 1–2 недели — рынок открываем быстрее',
        'Launch Kit — продукт стартует не с нуля',
        'Макеты вдвое быстрее — и меньше правок на ревью',
      ],
    },
  ],
};

export const cases: CaseStudy[] = [designSystem, cashier];
export const findCase = (id: string | null) => cases.find((c) => c.id === id) ?? null;
