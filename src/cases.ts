// Тексты кейсов из макета (страница «GitHub», кадры «Кейс / White Label, который выдерживает изменения» и «Кейс / Касса казино: от депозита до вывода»).

export type CaseBlock =
  /** links — слова из текста, которые становятся ссылками (подчёркнуты, цвет текста), как в макете */
  | { type: 'text'; text: string; links?: Record<string, string> }
  /** Пункты с синей точкой */
  | { type: 'bullets'; items: string[] }
  /** Карточки по две в ряд: заголовок и пояснение */
  | { type: 'steps'; items: { title: string; text: string }[] };

/** media — картинка, галерея или сравнение в верхней части карточки секции, над подписью */
export type CaseSection = { label: string; title: string; media?: CaseMedia; blocks: CaseBlock[] };

/** Картинка, галерея или сравнение в шапке кейса или вверху карточки секции; ratio — пропорция кадра из макета, например '836 / 500' */
export type CaseMedia =
  | { media: 'image'; src: string; alt: string; ratio: string }
  /** background — общий неподвижный фон; слайды — прозрачные PNG размером с кадр, листаются поверх фона */
  | { media: 'gallery'; background: string; slides: { src: string; alt: string }[]; ratio: string }
  /** Две картинки друг на друге: before слева от разделителя, after справа; разделитель перетаскивается */
  | { media: 'compare'; before: string; after: string; alt: string; ratio: string };

export type CaseStudy = {
  id: string;
  /** Картинка, галерея или сравнение в шапке кейса */
  heroMedia: CaseMedia;
  title: string;
  lead: string;
  meta: { label: string; value: string }[];
  /** Блок «Моя роль» после шапки: подпись слева, пояснение справа, пункты */
  role?: { label: string; items: string[] };
  sections: CaseSection[];
};

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

export const BEHANCE = {
  basis: 'https://www.behance.net/gallery/199583107/sajt-rostelekom-bazis',
  lyceum: 'https://www.behance.net/gallery/207229405/rostelekom-licej-ekzameny',
};

export const cases: CaseStudy[] = [
  {
    id: '1win',
    heroMedia: {
      media: 'compare',
      before: asset('case-ds-compare-A2.jpg'),
      after: asset('case-ds-compare-B2.jpg'),
      alt: 'Обложки продуктовых библиотек в двух брендах',
      ratio: '836 / 500',
    },
    title: 'Дизайн-система для White Label',
    lead: 'Объединил четыре бренда в одной системе, сохранив общие правила и продуктовые различия. С AI подготовил проверки состояний и Handoff.',
    meta: [
      { label: 'Роль', value: 'Ведущий дизайнер' },
      { label: 'Команда', value: '16 дизайнеров' },
      { label: 'Масштаб', value: '4 бренда, 16+ стран' },
      { label: 'Период', value: '2025 — сейчас' },
    ],
    role: {
      label: 'Моя роль',
      items: [
        'С дизайн-лидом определил архитектуру и границы общей системы.',
        'Спроектировал Component API и правила продуктовых расширений.',
        'Подготовил AI-контекст, проверки и план внедрения.',
      ],
    },
    sections: [
      {
        label: 'Задача',
        title: 'Бренды расходились в деталях',
        blocks: [
          {
            type: 'text',
            text: 'Схожие компоненты постепенно расходились между брендами. Я определил, какие изменения должны наследоваться из общей базы, а какие остаются за продуктом и не требуют новых настроек.',
          },
        ],
      },
      {
        media: {
          media: 'gallery',
          background: asset('case-ds-gallery-bg.jpg'),
          slides: [1, 2, 3, 4].map((i) => ({ src: asset(`case-ds-gallery-${i}.png`), alt: `Основа дизайн-системы, слайд ${i}` })),
          ratio: '836 / 507',
        },
        label: 'Архитектурное решение',
        title: 'Ограничил Component API',
        blocks: [
          {
            type: 'text',
            text: 'По примеру Spotify выбрал Composition over Configuration: оставил продуктам точки расширения, а общей базе — единые состояния. За гибкость пришлось платить поддержкой локальных решений.',
            links: {
              Spotify: 'https://engineering.atspotify.com/2021/04/customization-vs-configuration-in-evolving-design-systems',
            },
          },
          {
            type: 'steps',
            items: [
              { title: 'Архитектура токенов', text: 'Развёл роли, алиасы и брендовые значения.' },
              { title: 'Component Contracts', text: 'Задал допустимые состояния и инварианты.' },
              { title: 'Композиция', text: 'Оставил расширения вместо новых флагов.' },
              { title: 'Границы расширения', text: 'Изолировал продуктовые исключения.' },
            ],
          },
        ],
      },
      {
        label: 'AI и проверка состояний',
        title: 'Дал AI контекст и правила проверки',
        blocks: [
          {
            type: 'text',
            text: 'Для Figma MCP описал токены, ограничения и допустимые состояния. Результат сверяю со State Matrix: проверяю ошибки, локали и RTL, а неподдерживаемые сочетания исключаю.',
            links: {
              'Figma MCP': 'https://www.figma.com/blog/design-systems-ai-mcp/',
              RTL: 'https://www.w3.org/International/articles/inline-bidi-markup/',
            },
          },
          {
            type: 'steps',
            items: [
              { title: 'Покрытие состояний', text: 'Отсекаю недопустимые сочетания состояний.' },
              { title: 'Смешанное направление', text: 'Разделяю направление текста и реквизитов.' },
            ],
          },
        ],
      },
      {
        label: 'Правила и внедрение',
        title: 'Организовал поэтапный переход',
        blocks: [
          {
            type: 'text',
            text: 'По модели Carbon задал критерии готовности: дизайн, документация и проверки. Совместимые обновления отделил от Breaking Changes, для которых нужен свой план перехода и срок поддержки.',
            links: {
              Carbon: 'https://www.carbondesignsystem.com/getting-started/contributing/product-development-lifecycle',
            },
          },
          {
            type: 'steps',
            items: [
              { title: 'Критерии готовности', text: 'Проверить контракт перед публикацией.' },
              { title: 'Поэтапный переход', text: 'Обновлять сценарии поэтапно.' },
              { title: 'Deprecation Policy', text: 'Назначить замену и срок поддержки.' },
              { title: 'Применение', text: 'Считать применение, Detach и исключения.' },
            ],
          },
        ],
      },
      {
        media: {
          media: 'compare',
          before: asset('case-ds-compare-A1.jpg'),
          after: asset('case-ds-compare-B1.jpg'),
          alt: 'Одни и те же экраны в двух брендах',
          ratio: '836 / 428',
        },
        label: 'Результат и развитие',
        title: 'Совместимость стала частью дизайна',
        blocks: [
          {
            type: 'text',
            text: 'Общую базу отделил от продуктовых расширений и зафиксировал границы изменений. Следующий этап — Code Connect для связи с кодом и DTCG для обмена токенами между инструментами.',
            links: {
              'Code Connect': 'https://developers.figma.com/docs/code-connect/code-connect-ui-setup/',
              DTCG: 'https://www.designtokens.org/technical-reports/',
            },
          },
          {
            type: 'bullets',
            items: [
              'Общая база и продуктовые расширения развиваются независимо.',
              'Breaking Changes требуют отдельного плана перехода.',
              'Проверяю Adoption, исключения и стоимость обновлений.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: '1win-product',
    heroMedia: { media: 'image', src: asset('case-product-hero.jpg'), alt: 'Кошелёк кассы', ratio: '836 / 500' },
    title: 'Касса казино: пополнение и вывод',
    lead: 'Связал пополнение, вывод и историю в один путь с понятными условиями и статусами операций. Разделил банковские и криптовалютные сценарии.',
    meta: [
      { label: 'Роль', value: 'Ведущий дизайнер' },
      { label: 'Продукты', value: '4 White-Label' },
      { label: 'Рынки', value: '16+ стран, RTL' },
      { label: 'Период', value: '2025 — сейчас' },
    ],
    role: {
      label: 'Моя роль',
      items: [
        'Спроектировал общую навигацию и разные пути перевода.',
        'Разделил банковские и криптовалютные сценарии.',
        'С AI собрал сценарии для проверки условий и ошибок.',
      ],
    },
    sections: [
      {
        label: 'Контекст',
        title: 'Разные переводы — один понятный путь',
        blocks: [
          {
            type: 'text',
            text: 'Я сохранил общую навигацию кошелька, но разделил шаги по задаче. При пополнении важно отправить деньги верно, при выводе — проверить итог, после перевода — найти результат.',
          },
        ],
      },
      {
        media: {
          media: 'gallery',
          background: asset('case-product-cashier-bg.webp'),
          slides: [
            { src: asset('case-product-deposit-1.webp'), alt: 'Пополнение банковской картой' },
            { src: asset('case-product-deposit-2.webp'), alt: 'Пополнение криптовалютой' },
          ],
          ratio: '836 / 500',
        },
        label: 'Депозит · Фиат и криптовалюта',
        title: 'Общий путь с разными условиями',
        blocks: [
          {
            type: 'text',
            text: 'Для банка оставил сумму, бонус и реквизиты; для крипты — монету, сеть, адрес и QR. Сохранил общий порядок шагов, но вынес риски каждого способа до отправки денег.',
          },
          {
            type: 'steps',
            items: [
              { title: 'Фиат: сумма и реквизиты', text: 'Связал ввод, лимиты и условия платежа.' },
              { title: 'Крипта: монета и сеть', text: 'Показал адрес, QR и минимум перевода.' },
            ],
          },
        ],
      },
      {
        media: {
          media: 'gallery',
          background: asset('case-product-cashier-bg.webp'),
          slides: [
            { src: asset('case-product-withdraw-1.webp'), alt: 'Вывод на банковскую карту' },
            { src: asset('case-product-withdraw-2.webp'), alt: 'Вывод в криптовалюте' },
          ],
          ratio: '836 / 500',
        },
        label: 'Вывод · Фиат и криптовалюта',
        title: 'Проверить всё до подтверждения',
        blocks: [
          {
            type: 'text',
            text: 'Перед подтверждением я собрал реквизиты, итоговую сумму и последствия для бонусов. Для фиата добавил проверку профиля, для крипты — сверку монеты, сети и адреса.',
          },
          {
            type: 'steps',
            items: [
              { title: 'Фиат: данные и итог', text: 'Вынес итог и переход к проверке профиля.' },
              { title: 'Крипта: сеть и адрес', text: 'Дал сверить сеть, адрес и сумму к получению.' },
            ],
          },
        ],
      },
      {
        media: { media: 'image', src: asset('case-product-history.jpg'), alt: 'История операций', ratio: '836 / 420' },
        label: 'История операций',
        title: 'Не искать перевод заново',
        blocks: [
          {
            type: 'text',
            text: 'Я продолжил сценарий в истории: сохранил статус, сумму и реквизиты операции. Действия связал с её состоянием — повторить перевод, обратиться за помощью или отменить вывод.',
          },
        ],
      },
      {
        label: 'Результат',
        title: 'Единый путь вместо отдельных форм',
        blocks: [
          {
            type: 'text',
            text: 'Собрал единый путь для пополнения и вывода: условия — до подтверждения, статус и помощь — после. Скорость перевода зависит от провайдера; эффект на ошибки ещё предстоит измерить.',
          },
          {
            type: 'bullets',
            items: [
              'Условия видны до подтверждения перевода.',
              'К операции можно вернуться через историю.',
              'Эффект на ошибки и обращения ещё предстоит измерить.',
            ],
          },
        ],
      },
    ],
  },
];

export const findCase = (id: string | null) => cases.find((c) => c.id === id) ?? null;
