// Актуальные кейсы: карточки «Касса» и «DS».

export type CaseBlock =
  /** links — слова из текста, которые становятся ссылками (подчёркнуты, цвет текста), как в макете */
  | { type: 'text'; text: string; links?: Record<string, string> }
  /** Ответы в отдельных сообщениях */
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
  | { media: 'emoji'; src: string; alt: string; ratio: string }
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

const cashier: CaseStudy = {
  "id": "1win-product",
  "cover": {
    "media": "emoji",
    "src": asset('emoji-coin.webp'),
    "alt": "Монета",
    "ratio": "952 / 260"
  },
  "title": "Касса, которая не теряет платёж",
  "lead": "Пересобрал кассу iGaming-платформы: пополнение, вывод и история для фиата и крипты в одном модуле. Сбой провайдера больше не обрывает сценарий.",
  "meta": [
    {
      "label": "Роль",
      "value": "Ведущий дизайнер"
    },
    {
      "label": "Команда",
      "value": "5 дизайнеров"
    },
    {
      "label": "Масштаб",
      "value": "8 валют, 20+ методов"
    },
    {
      "label": "Период",
      "value": "2025 — сейчас"
    }
  ],
  "sections": [
    {
      "label": "Моя роль",
      "title": "Что ты делал в проекте?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Спроектировал кассу целиком: депозит, вывод, история.",
            "Руководил A/B-тестом комиссии на вывод.",
            "Вёл 13 итераций от задачи до релиза."
          ]
        }
      ]
    },
    {
      "label": "Контекст",
      "title": "Почему сбой провайдера — это сбой продукта?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Реквизиты выдаются не сразу.",
            "Методы отключаются без предупреждения.",
            "Пользователь видит не провайдера, а кассу."
          ]
        }
      ]
    },
    {
      "label": "Исследование",
      "title": "Почему начал с причин, а не с экранов?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Разобрал обращения в поддержку и воронку кассы.",
            "Сравнил кассы конкурентов.",
            "С разработкой и СБ собрал ограничения провайдеров."
          ]
        }
      ]
    },
    {
      "label": "Цели",
      "title": "Какие цели и метрики?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Платёж зачисляется сам — доля автозачислений.",
            "Сбой метода не обрывает сессию — депозиты другим методом.",
            "Одна касса на все рынки — конверсия по регионам."
          ]
        }
      ]
    },
    {
      "label": "Решение 1 · Пополнение",
      "title": "Как платёж узнаёт себя сам?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Касса меняет сумму на пару рублей: 2 014 ₽ вместо 2 000 ₽.",
            "По ней платёж зачисляется автоматически.",
            "Ожидание — до 90 секунд, с прогрессом и повтором.",
            "«Я оплатил» — активна только через 10 секунд."
          ]
        }
      ]
    },
    {
      "label": "Решение 2 · Сбои",
      "title": "Что, если метод упал?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Недоступный метод заменяется популярным.",
            "Нет фиата — ведём в крипту.",
            "Быстрое пополнение — прошлый метод и сумма уже заполнены.",
            "Бонус — подсказка, сколько не хватает до него."
          ]
        }
      ]
    },
    {
      "label": "Решение 3 · Вывод",
      "title": "Что видно до кнопки вывода?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "До подтверждения видны сумма, комиссия и бонусы, которые сгорят."
          ]
        }
      ]
    },
    {
      "label": "A/B-тест",
      "title": "Быстрый или стандартный вывод?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Задача — переложить часть комиссии на пользователя.",
            "Тест вёл дизайнер команды, я задал рамки и ревьюил.",
            "Быстрый — от 20 минут, с комиссией.",
            "Стандартный — от 120 минут."
          ]
        }
      ]
    },
    {
      "label": "Процесс",
      "title": "Как прошли 13 итераций?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Каждая задача: Preview для бизнеса → Ready for dev.",
            "~440 состояний на платформу, 4 брейкпоинта.",
            "Анимации — прототипами в CodePen."
          ]
        }
      ]
    },
    {
      "label": "Результат",
      "title": "Что дала одна касса вместо набора сценариев?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Охват — 8 валют и 20+ методов.",
            "Автозачисление — по уникальной сумме.",
            "Устойчивость — у каждого сбоя есть следующий шаг."
          ]
        }
      ]
    }
  ]
};
const designSystem: CaseStudy = {
  "id": "1win",
  "cover": {
    "media": "emoji",
    "src": asset('emoji-dividers.webp'),
    "alt": "Разделители картотеки",
    "ratio": "952 / 260"
  },
  "title": "Одна система для четырёх брендов",
  "lead": "Вместе с дизайн-лидом перестроил дизайн-систему White-Label продуктов: общий Foundation, брендовые библиотеки поверх него и процесс от задачи до Storybook.",
  "meta": [
    {
      "label": "Роль",
      "value": "Ведущий дизайнер"
    },
    {
      "label": "Команда",
      "value": "5 дизайнеров"
    },
    {
      "label": "Масштаб",
      "value": "4 бренда, 16+ стран"
    },
    {
      "label": "Период",
      "value": "2025 — сейчас"
    }
  ],
  "sections": [
    {
      "label": "Моя роль",
      "title": "Что ты делал в проекте?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "С дизайн-лидом определил архитектуру библиотек и токенов.",
            "Выстроил DesignOps: файлы, передача, Task Preview.",
            "Вёл команду: ревью, ИПР, Performance Review."
          ]
        }
      ]
    },
    {
      "label": "Проблема",
      "title": "Почему четыре бренда расходились?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Компоненты брендов разъезжались.",
            "Одну правку делали четыре раза.",
            "Разработка получала разные макеты одного компонента."
          ]
        }
      ]
    },
    {
      "label": "Исследование",
      "title": "Зачем аудит перед архитектурой?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Отделил, что меняется по бренду: цвет, шрифт, скругления, иконки.",
            "И что не меняется: поведение, состояния, сетка.",
            "Сверил библиотеку со Storybook."
          ]
        }
      ]
    },
    {
      "label": "Решение 1 · Архитектура",
      "title": "Какие три слоя библиотек?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Foundation — токены, база, иконки.",
            "Core бренда — компоненты, брендбук, ассеты.",
            "Product — экраны. Каждый слой берёт только из нижнего."
          ]
        }
      ]
    },
    {
      "label": "Решение 2 · Токены",
      "title": "Как бренд стал режимом переменных?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "348 переменных в 7 коллекциях.",
            "Режим бренда меняет цвет, шрифт и скругления.",
            "Цвет — Primitive → Semantic → Component.",
            "Иконки — стиль переключается режимом."
          ]
        }
      ]
    },
    {
      "label": "Решение 3 · Связь с кодом",
      "title": "Когда компонент считается готовым?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "26 компонентов: у каждого Ready for dev и ссылка на Storybook.",
            "Launch Kit — новый продукт стартует с готовых шаблонов."
          ]
        }
      ]
    },
    {
      "label": "Процесс",
      "title": "Как задача доходит до публикации?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Creation Guide — Preview, Workspace, Ready for dev.",
            "Task Preview — задача для БА и ПМ в одном месте."
          ]
        }
      ]
    },
    {
      "label": "Результат",
      "title": "Что дала одна база для четырёх брендов?",
      "blocks": [
        {
          "type": "bullets",
          "items": [
            "Масштаб — 348 переменных, 26 компонентов.",
            "Процесс — от Jira до Ready for dev по одному гайду.",
            "Дальше — Code Connect."
          ]
        }
      ]
    }
  ]
};
const cashierMedia: CaseMedia[] = [{ media:'gallery', background:asset('case-product-cashier-bg.webp'),slides:[1,2].map(i=>({src:asset(`case-product-deposit-${i}.webp`),alt:`Пополнение, слайд ${i}`})),ratio:'936 / 559.8',border:true },{ media:'gallery', background:asset('case-product-cashier-bg.webp'),slides:[1,2].map(i=>({src:asset(`case-product-withdraw-${i}.webp`),alt:`Вывод, слайд ${i}`})),ratio:'936 / 559.8',border:true },{media:'image',src:asset('case-product-history.webp'),alt:'История операций',ratio:'936 / 470.2',radius:32,border:true}];
const dsMedia: CaseMedia[] = [{ media: 'gallery', background: asset('case-ds-gallery-bg.webp'), slides: [1,2,3,4].map(i => ({src: asset(`case-ds-gallery-${i}.webp`), alt: `Основа дизайн-системы, слайд ${i}`})), ratio: '936 / 559.8' }, {media:'compare',before:asset('case-ds-compare-A1.webp'),after:asset('case-ds-compare-B1.webp'),alt:'Одни экраны в двух брендах',ratio:'936 / 479.2'}, {media:'compare',before:asset('case-cover-ds-jetton.webp'),after:asset('case-cover-ds-tonplay.webp'),alt:'Продуктовые библиотеки двух брендов',ratio:'936 / 500'}];
[4,6,8].forEach((section, i) => { cashier.sections[section].media = cashierMedia[i]; });
[3,5,7].forEach((section, i) => { designSystem.sections[section].media = dsMedia[i]; });
export const cases: CaseStudy[] = [designSystem, cashier];
export const findCase = (id: string | null) => cases.find(c => c.id === id) ?? null;
