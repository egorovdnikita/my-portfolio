// Тексты кейсов из макета: страница «Новый сайт», кадры «Portfolio / Case Cashier — Dark» и «Portfolio / Case Design System — Dark».

export type CaseBlock =
  /** links — слова из текста, которые становятся ссылками (подчёркнуты, цвет текста), как в макете */
  | { type: 'text'; text: string; links?: Record<string, string> }
  /** Пункты с синей точкой */
  | { type: 'bullets'; items: string[] }
  /** Карточки по две в ряд: заголовок и пояснение */
  | { type: 'steps'; items: { title: string; text: string }[] };

/** media — картинка перед секцией */
export type CaseSection = { label: string; title: string; media?: CaseMedia; blocks: CaseBlock[] };

/**
 * Картинка перед секцией: прозрачный WebP 936 по ширине из макета (телефоны прямо на панели).
 * ratio — пропорция кадра, radius — скругление, если картинка обрезана по углам,
 * shade — затемнение снизу в цвет панели (доля высоты), как прямоугольник Cover / Shade в макете.
 */
export type CaseMedia = { src: string; alt: string; ratio: string; radius?: number; shade?: number };

export type CaseStudy = {
  id: string;
  /** Обложка панели: прозрачный WebP 952×400 из макета, снизу затемняется градиентом в цвет панели */
  cover: { src: string; alt: string };
  title: string;
  lead: string;
  meta: { label: string; value: string }[];
  /** Блок «Моя роль» после фактов: подпись и пункты */
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
    cover: { src: asset('case-cover-ds.webp'), alt: 'Обложки продуктовых библиотек JetTon и TonPlay' },
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
        media: { src: asset('case-ds-tokens.webp'), alt: 'Токены фона дизайн-системы: тёмная и светлая тема', ratio: '936 / 470.2', shade: 128 / 470.2 },
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
        media: { src: asset('case-ds-brands.webp'), alt: 'Одни и те же экраны в двух брендах: JetTon и TonPlay', ratio: '936 / 479.2', radius: 24 },
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
    cover: { src: asset('case-cover-cashier.webp'), alt: 'Кошелёк кассы на телефоне' },
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
        media: { src: asset('case-cashier-deposit.webp'), alt: 'Пополнение: способ, сумма, проверка и реквизиты', ratio: '936 / 557.2' },
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
        media: { src: asset('case-cashier-withdraw.webp'), alt: 'Вывод: способ, данные, подтверждение и проверка профиля', ratio: '936 / 557.2' },
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
        media: { src: asset('case-cashier-history.webp'), alt: 'История операций и статусы перевода', ratio: '936 / 470.2' },
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
