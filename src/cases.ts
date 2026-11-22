// Тексты кейсов из макета: страница «Новый сайт», кадры «Portfolio / Case Cashier — Dark» и «Portfolio / Case Design System — Dark».

export type CaseBlock =
  /** links — слова из текста, которые становятся ссылками (подчёркнуты, цвет текста), как в макете */
  | { type: 'text'; text: string; links?: Record<string, string> }
  /** Пункты с синей точкой */
  | { type: 'bullets'; items: string[] }
  /** Карточки по две в ряд: заголовок и пояснение */
  | { type: 'steps'; items: { title: string; text: string }[] };

/** media — картинка, галерея или сравнение в верхней части карточки секции, над подписью */
export type CaseSection = { label: string; title: string; media?: CaseMedia; blocks: CaseBlock[] };

/**
 * Картинка, галерея или сравнение: обложка кейса или блок перед секцией.
 * ratio — пропорция кадра из макета, например '936 / 559.8'; radius — скругление, если не 24; border — обводка 1px (border/media)
 */
export type CaseMedia = (
  | { media: 'image'; src: string; alt: string; ratio: string }
  /** background — общий неподвижный фон; слайды — прозрачные PNG размером с кадр, листаются поверх фона */
  | { media: 'gallery'; background: string; slides: { src: string; alt: string }[]; ratio: string }
  /** Две картинки друг на друге: before слева от разделителя, after справа; разделитель перетаскивается */
  | { media: 'compare'; before: string; after: string; alt: string; ratio: string }
) & { radius?: number; border?: boolean };

export type CaseStudy = {
  id: string;
  /** Обложка: блок 936×500 со скруглением 24 вверху панели, крестик лежит поверх неё */
  cover: CaseMedia;
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
    cover: {
      media: 'compare',
      before: asset('case-cover-ds-jetton.webp'),
      after: asset('case-cover-ds-tonplay.webp'),
      alt: 'Обложки продуктовых библиотек в брендах JetTon и TonPlay',
      ratio: '936 / 500',
    },
    title: 'Одна дизайн-система для четырёх брендов',
    lead: 'Свёл четыре White-Label бренда к общей базе: общее наследуется, различия живут в точках расширения.',
    meta: [
      { label: 'Роль', value: 'Ведущий дизайнер' },
      { label: 'Команда', value: '16 дизайнеров' },
      { label: 'Масштаб', value: '4 бренда, 16+ стран' },
      { label: 'Период', value: '2025 — сейчас' },
    ],
    role: {
      label: 'Моя роль',
      items: [
        'С дизайн-лидом определил архитектуру и границы системы.',
        'Спроектировал API компонентов и правила расширений.',
        'Подготовил контекст для Figma MCP и план перехода.',
      ],
    },
    sections: [
      {
        label: 'Проблема',
        title: 'Бренды расходились в деталях',
        blocks: [
          {
            type: 'text',
            text: 'Похожие компоненты расходились между брендами. Одну правку повторяли четыре раза, а задуманные отличия было не отличить от случайных.',
          },
        ],
      },
      {
        media: {
          media: 'gallery',
          background: asset('case-ds-gallery-bg.webp'),
          slides: [1, 2, 3, 4].map((i) => ({ src: asset(`case-ds-gallery-${i}.webp`), alt: `Основа дизайн-системы, слайд ${i}` })),
          ratio: '936 / 559.8',
        },
        label: 'Токены',
        title: 'Бренд меняет значения, а не компоненты',
        blocks: [
          {
            type: 'text',
            text: 'Три слоя: палитра → роли → значения бренда. Компоненты ссылаются только на роли, поэтому новый бренд — это новый набор значений.',
          },
        ],
      },
      {
        label: 'Компоненты',
        title: 'Жёсткая база, расширение через слоты',
        blocks: [
          {
            type: 'text',
            text: 'Вместо флагов — слоты: база держит состояния и токены, продукт добавляет своё. Цена — локальные решения поддерживает продукт, а не DS.',
          },
          {
            type: 'steps',
            items: [
              { title: 'Контракт компонента', text: 'Что допустимо и что не меняется ни в одном бренде.' },
              { title: 'Почему не флаги', text: 'Каждый флаг умножает сочетания для проверки.' },
            ],
          },
        ],
      },
      {
        label: 'Проверки',
        title: 'AI проверяет состояния, решение — за мной',
        blocks: [
          {
            type: 'text',
            text: 'Для Figma MCP описал токены, ограничения и состояния. Результат сверяю со State Matrix: ошибки, локали, RTL.',
          },
          {
            type: 'steps',
            items: [{ title: 'RTL без переворота данных', text: 'Номер карты, адрес и сумма остаются слева направо.' }],
          },
        ],
      },
      {
        label: 'Внедрение',
        title: 'Обновления без поломок у продуктов',
        blocks: [
          {
            type: 'text',
            text: 'Компонент публикуется, когда готовы дизайн, документация и проверки. У ломающих изменений — замена, срок поддержки и план перехода.',
          },
        ],
      },
      {
        media: {
          media: 'compare',
          before: asset('case-ds-compare-A1.webp'),
          after: asset('case-ds-compare-B1.webp'),
          alt: 'Одни и те же экраны в двух брендах',
          ratio: '936 / 479.2',
        },
        label: 'Результат',
        title: 'Четыре бренда на одной базе',
        blocks: [
          {
            type: 'text',
            text: 'Общая база и расширения обновляются независимо. Дальше — Code Connect и DTCG.',
          },
          {
            type: 'bullets',
            items: [
              'Новый бренд — набор значений токенов.',
              'Ломающие изменения идут через план перехода.',
              'Применение отслеживаю по detach и исключениям.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: '1win-product',
    cover: { media: 'image', src: asset('case-cover-cashier.webp'), alt: 'Кошелёк кассы на телефоне', ratio: '936 / 500' },
    title: 'Касса: пополнение и вывод',
    lead: 'Одна касса для фиата и крипты в 4 White-Label продуктах. Условия видны до отправки денег.',
    meta: [
      { label: 'Роль', value: 'Ведущий дизайнер' },
      { label: 'Продукты', value: '4 White-Label' },
      { label: 'Рынки', value: '16+ стран, RTL' },
      { label: 'Период', value: '2025 — сейчас' },
    ],
    role: {
      label: 'Моя роль',
      items: [
        'Спроектировал навигацию кошелька и пути для фиата и крипты.',
        'Решил, какие условия показывать до подтверждения, а какие — после.',
        'С AI собрал сценарии проверки условий и ошибок.',
      ],
    },
    sections: [
      {
        label: 'Проблема',
        title: 'Ошибка в кассе стоит денег',
        blocks: [
          {
            type: 'text',
            text: 'Пополнение, вывод и история были отдельными формами. Минимум, сеть и влияние на бонус пользователь узнавал после отправки — а перевод в неверную сеть не вернуть.',
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
          ratio: '936 / 559.8',
          border: true,
        },
        label: 'Пополнение',
        title: 'Общий порядок шагов, разные поля',
        blocks: [
          {
            type: 'text',
            text: 'Порядок шагов одинаковый для всех методов, поля — свои: у фиата сумма и реквизиты, у крипты монета, сеть, адрес и QR.',
          },
          {
            type: 'steps',
            items: [
              { title: 'Повтор в один тап', text: 'Метод и сумма последних пополнений уже заполнены.' },
              { title: 'Правила рядом с реквизитами', text: 'Банк, сумма, одна операция и таймер реквизитов.' },
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
          ratio: '936 / 559.8',
          border: true,
        },
        label: 'Вывод',
        title: 'Всё, что можно потерять, — до кнопки',
        blocks: [
          {
            type: 'text',
            text: 'Итог, реквизиты и сгорающие бонусы видны до подтверждения. Для фиата — сначала проверка профиля, для крипты — сверка сети и адреса.',
          },
          {
            type: 'steps',
            items: [
              { title: 'Бонусы не сгорают молча', text: 'Предупреждение стоит над кнопкой подтверждения.' },
              { title: 'Профиль — до суммы', text: 'Если данных не хватает, вывод сразу ведёт в профиль.' },
            ],
          },
        ],
      },
      {
        media: { media: 'image', src: asset('case-product-history.webp'), alt: 'История операций', ratio: '936 / 470.2', radius: 32, border: true },
        label: 'История',
        title: 'Операция живёт после отправки',
        blocks: [
          {
            type: 'text',
            text: 'У операции есть статус, сумма и реквизиты. Действие зависит от состояния: повторить, написать в поддержку или отменить вывод.',
          },
        ],
      },
      {
        label: 'Результат',
        title: 'Одна касса вместо отдельных форм',
        blocks: [
          {
            type: 'text',
            text: 'Одна логика для пополнения, вывода и истории в 4 продуктах и 16+ странах.',
          },
          {
            type: 'bullets',
            items: [
              'Новый метод меняет поля, а не путь.',
              'Всё, что влияет на деньги, видно до подтверждения.',
              'Эффект на ошибки ещё предстоит измерить.',
            ],
          },
        ],
      },
    ],
  },
];

export const findCase = (id: string | null) => cases.find((c) => c.id === id) ?? null;
