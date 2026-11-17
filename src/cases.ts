// Тексты кейсов из макета (страница «Сайт», кадры «Кейс / Дизайн-система для трёх брендов» и «Кейс / Касса и история операций»).

export type CaseBlock =
  | { type: 'text'; text: string }
  /** plain — точка вместо прочерка (блок «Итог») */
  | { type: 'bullets'; items: string[]; plain?: boolean }
  | { type: 'table'; head: [string, string, string]; rows: [string, string, string][] }
  | { type: 'quote'; text: string }
  | { type: 'image'; caption: string; height: number }
  /** Карточки 2×2; lg — текст 16px вместо 14. image — вырезка интерфейса для светлой и тёмной темы */
  | { type: 'steps'; items: { title: string; text: string; image?: ThemedImage }[]; size?: 'lg' }
  /** icon — иконка над заголовком; bare — без иконки и без пунктирной заглушки */
  | { type: 'columns'; items: { title: string; text: string; icon?: string }[]; bare?: boolean }
  /** Схема во всю ширину карточки — своя картинка для светлой и тёмной темы */
  | { type: 'figure'; image: ThemedImage; alt: string };

export type ThemedImage = { light: string; dark: string };

export type CaseSection = { label: string; title: string; blocks: CaseBlock[] };

/** Картинка, галерея или сравнение во всю ширину колонки — отдельной карточкой между секциями */
export type CaseMedia =
  | { media: 'image'; src: string; alt: string }
  /** background — общий неподвижный фон; слайды — прозрачные PNG размером с кадр, листаются поверх фона */
  | { media: 'gallery'; background: string; slides: { src: string; alt: string }[] }
  /** Две картинки друг на друге: before слева от разделителя, after справа; разделитель перетаскивается */
  | { media: 'compare'; before: string; after: string; alt: string; ratio: string };

export const isMedia = (item: CaseSection | CaseMedia): item is CaseMedia => 'media' in item;

export type CaseStudy = {
  id: string;
  tags: string[];
  /** Обложка в шапке кейса — картинка из макета */
  cover?: string;
  title: string;
  lead: string;
  meta: { label: string; value: string }[];
  /** Блок «Моя роль» после шапки: подпись слева, пояснение справа, пункты */
  role?: { label: string; items: string[] };
  sections: (CaseSection | CaseMedia)[];
};

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;
const themed = (name: string): ThemedImage => ({ light: asset(`${name}.png`), dark: asset(`${name}-dark.png`) });

export const BEHANCE = {
  basis: 'https://www.behance.net/gallery/199583107/sajt-rostelekom-bazis',
  lyceum: 'https://www.behance.net/gallery/207229405/rostelekom-licej-ekzameny',
};

export const cases: CaseStudy[] = [
  {
    id: '1win',
    cover: asset('cover-case-ds-v3.jpg'),
    tags: ['Design System', 'White-Label', 'Variables', 'Slots', 'RTL', 'Storybook', 'DesignOps'],
    title: 'Одна дизайн-система для трёх брендов',
    lead: 'Когда я проектировал White Label для трёх брендов, мне нужно было решить, что команда сможет переиспользовать при запуске нового продукта. Я начал с форм и навигации: в них часто повторялись одни и те же решения, даже когда оформление и сценарий различались.',
    meta: [
      { label: 'Роль', value: 'Ведущий дизайнер' },
      { label: 'Команда', value: '16 дизайнеров' },
      { label: 'Масштаб', value: '3 бренда, 16+ стран' },
      { label: 'Период', value: '2025 — сейчас' },
    ],
    role: {
      label: 'Моя роль',
      items: [
        'Разделил базу и продуктовые решения вместе с дизайн-лидом.',
        'Спроектировал смену темы и слоты для контента.',
        'Проверил подход на регистрации, навигации и кассе.',
      ],
    },
    sections: [
      {
        label: 'Исходная задача',
        title: 'Где команда повторяла одну и ту же работу',
        blocks: [
          {
            type: 'text',
            text: 'При смене бренда менялись цвет, типографика и контент. Вместе с ними команда пересобирала и то, что уже было решено: как показать ошибку в поле, как ведёт себя вкладка и где разместить действие в модальном окне.',
          },
        ],
      },
      {
        media: 'gallery',
        background: asset('case-ds-gallery-bg.jpg'),
        slides: [1, 2, 3, 4].map((i) => ({ src: asset(`case-ds-gallery-${i}.png`), alt: `Основа дизайн-системы, слайд ${i}` })),
      },
      {
        label: 'Ключевое решение',
        title: 'Где смены темы оказалось мало',
        blocks: [
          {
            type: 'text',
            text: 'Смена темы покрывает цвет и типографику. В регистрации этого оказалось мало: формы с почтой и телефоном требуют разных полей и шагов. Я оставил общими поля и их состояния, а последовательность действий — за продуктом.',
          },
        ],
      },
      {
        label: 'Архитектура',
        title: 'Какие решения я сделал общими',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Токены и темы', text: 'Отделил назначение цвета от его значения в теме.' },
              { title: 'Сменное содержимое', text: 'Оставил слоты, чтобы менять текст и иконки в блоках.' },
              { title: 'Адаптация', text: 'Предусмотрел варианты окна по ширине и прокрутке.' },
            ],
          },
          {
            type: 'figure',
            image: { light: asset('case-ds-architecture.jpg'), dark: asset('case-ds-architecture-dark.jpg') },
            alt: 'Схема библиотек: Foundation, Core и продуктовые библиотеки',
          },
        ],
      },
      {
        media: 'compare',
        before: asset('case-ds-compare-A1.jpg'),
        after: asset('case-ds-compare-B1.jpg'),
        alt: 'Одни и те же экраны в двух брендах',
        ratio: '852 / 428',
      },
      {
        label: 'White-Label',
        title: 'Компромисс: у продуктов остались свои блоки',
        blocks: [
          {
            type: 'text',
            text: 'Компромисс был таким: я оставил повторяющееся поведение в базе, а там, где менялась задача пользователя, допускал отдельный продуктовый блок. Команде всё равно нужно было собирать экран под конкретный сценарий.',
          },
          {
            type: 'columns',
            bare: true,
            items: [
              { title: 'Главная', text: 'Вынес навигацию и фильтры в продуктовые компоненты.' },
              { title: 'Регистрация', text: 'Сохранил состояния полей для почты и телефона.' },
              { title: 'Касса', text: 'Вынес расчёт и смену способа из общего окна.' },
            ],
          },
        ],
      },
      {
        media: 'compare',
        before: asset('case-ds-compare-A2.jpg'),
        after: asset('case-ds-compare-B2.jpg'),
        alt: 'Обложки продуктовых библиотек в двух брендах',
        ratio: '852 / 545',
      },
      {
        label: 'Итог',
        title: 'Что в итоге можно собрать повторно',
        blocks: [
          {
            type: 'bullets',
            plain: true,
            items: [
              'Поля, вкладки и модальные окна получили общую основу.',
              'Команда меняет тему и выбирает нужные блоки.',
              'Регистрация, касса и ошибки сохраняют свои сценарии.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: '1win-product',
    cover: asset('cover-case-product-v3.jpg'),
    tags: ['iGaming', 'B2C', 'B2B', 'Payments', 'Casino', 'Локализация', 'Web'],
    title: 'Баланс не изменился. Платить снова?',
    lead: 'Человек вернулся в кассу, а баланс прежний. Я хотел помочь ему понять, что произошло с первым платежом и стоит ли пробовать снова.',
    meta: [
      { label: 'Роль', value: 'Ведущий дизайнер' },
      { label: 'Продукты', value: '3 White-Label' },
      { label: 'Рынки', value: '16+ стран, RTL' },
      { label: 'Период', value: '2025 — сейчас' },
    ],
    role: {
      label: 'Моя роль',
      items: [
        'Разложил оплату на выбор, проверку условий и проверку статуса.',
        'Связал сообщение об обработке с записью в истории.',
        'Проработал недоступный метод, истёкший таймер и задержку.',
      ],
    },
    sections: [
      { media: 'image', src: asset('case-product-scheme.jpg'), alt: 'Схема кассы' },
      {
        label: 'Контекст',
        title: 'Один и тот же баланс, два разных исхода',
        blocks: [
          {
            type: 'text',
            text: 'После оплаты баланс может остаться прежним и при обработке перевода, и когда время оплаты истекло. Я развёл эти состояния, потому что в одном случае нужно проверить уже начатую операцию, а в другом — разобраться, как оплатить заново.',
          },
          {
            type: 'columns',
            bare: true,
            items: [
              {
                title: 'Платёжные методы',
                text: 'Регион может менять следующий шаг оплаты.',
              },
              {
                title: 'Условия до оплаты',
                text: 'Комиссию, сеть и минимум нужно сверить до отправки.',
              },
              {
                title: 'Статус после оплаты',
                text: 'Обработка и истёкший таймер требуют разных действий.',
              },
            ],
          },
        ],
      },
      {
        media: 'gallery',
        background: asset('case-product-gallery-bg.jpg'),
        slides: [1, 2, 3, 4].map((i) => ({ src: asset(`case-product-gallery-phones-${i}.png`), alt: `Экраны кассы, слайд ${i}` })),
      },
      {
        label: 'Касса',
        title: 'Как я расставил подсказки по шагам',
        blocks: [
          {
            type: 'text',
            text: 'До отправки я показываю условия, которые ещё можно проверить. После возврата объясняю статус и следующий шаг.',
          },
          {
            type: 'steps',
            items: [
              {
                title: 'Способ оплаты',
                text: 'Показываю доступные способы и при необходимости уточняю регион.',
                image: themed('cut-product-method'),
              },
              {
                title: 'Условия перевода',
                text: 'До отправки видны сумма и комиссия либо сеть и минимальная сумма.',
                image: themed('cut-product-terms'),
              },
              {
                title: 'Возврат после оплаты',
                text: 'После возврата показываю статус, даже если баланс ещё не обновился.',
                image: themed('cut-product-return'),
              },
              {
                title: 'Следующий шаг',
                text: 'В обработке — проверить историю. Время вышло — повторить или сменить способ.',
                image: themed('cut-product-next'),
              },
            ],
          },
        ],
      },
      {
        label: 'История операций',
        title: 'Как найти тот же платёж позже',
        blocks: [
          {
            type: 'text',
            text: 'Пользователь может закрыть кассу и вернуться позже. В истории он найдёт тот же перевод и сверит сумму, валюту и статус.',
          },
        ],
      },
      { media: 'image', src: asset('case-product-history.jpg'), alt: 'История операций' },
      {
        label: 'Проверка решения',
        title: 'Что бы я проверил на пользователях',
        blocks: [
          {
            type: 'text',
            text: 'Дал бы человеку сценарий с задержкой зачисления и попросил закрыть кассу после оплаты. Затем проверил бы, найдёт ли он операцию без подсказки.',
          },
          {
            type: 'columns',
            bare: true,
            items: [
              { title: 'Вернуться к переводу', text: 'Найдёт ли человек платёж после закрытия кассы?' },
              { title: 'Принять решение', text: 'Поймёт ли, ждать или платить снова?' },
              { title: 'Что измерять', text: 'Доля повторных оплат до зачисления первой.' },
            ],
          },
        ],
      },
      {
        label: 'Итог',
        title: 'Как решение отвечает на «Платить снова?»',
        blocks: [
          {
            type: 'bullets',
            plain: true,
            items: [
              'До отправки можно сверить условия.',
              'Статус первого платежа можно проверить в истории.',
              'Влияние на повторные оплаты пока неизвестно.',
            ],
          },
        ],
      },
    ],
  },
];

export const findCase = (id: string | null) => cases.find((c) => c.id === id) ?? null;
