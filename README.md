# KyyNet Gradient

**Визуальный редактор форматированного текста для Minecraft.** Первый сервис экосистемы KyyNet Toolkit.

Живёт на [gradient.kyynet.net](https://gradient.kyynet.net/) · часть [kyynet.net](https://kyynet.net)

---

## Что это

Веб-приложение, в котором администратор сервера Minecraft или разработчик плагинов за несколько кликов собирает красивое цветное и форматированное сообщение (приветствие EssentialsX, лор предмета, MOTD, объявление в чат) **без** запоминания 16 legacy-цветов, hex-значений и путаницы между Legacy / Hex / MiniMessage.

### Ключевые возможности

| Фича | Описание |
|------|---------|
| **Three-format output** | Одновременно Legacy (`&aHi`), Hex (`&#ff5555Hi`), MiniMessage (`<color:#ff5555>Hi</color>`) |
| **Multi-stop gradients** | 2–6 точек с перетягиванием, 12 пресетов (Закат, Океан, Vaporwave, Радуга, Галактика…) |
| **Selection-based formatting** | Выделил «мир» → нажал красный → только «мир» краснеет. Текст остаётся чистым. |
| **Live preview** | Minecraft chat-панель с пиксельным шрифтом Monocraft и классической drop-shadow |
| **9 сцен превью** | Оригинал (фиолет) / трава / песчаник / небо / ночь / белый / серый / тёмно-серый / чёрный |
| **Import** | Вставьте существующий `&aHi` или `<color:#ff0000>Hi</color>` → распарсится в редактируемый документ. Градиенты загружаются прямо в полоску редактора. |
| **Share URL** | Документ кодируется в URL — отправил ссылку = отправил готовое сообщение |
| **Undo / Redo** | Ctrl+Z / Ctrl+Shift+Z, глубина 60 |
| **Bilingual** | RU / EN с мгновенным переключением |
| **Счётчики использования** | Три глобальных: посещения, градиенты применено, текстов скопировано |
| **Visual extras** | Анимированный hero, жидкий фон, конфетти при копировании |

---

## 🚀 Деплой на сервер (2 минуты)

```bash
# на сервере:
cd /var/www
git clone https://github.com/ShevchenkoMikhail/kyynet-gradient.git
cd kyynet-gradient
npm ci
npm run build
```

В папке `dist/` лежит готовый статический сайт. Настройте Nginx:

```nginx
server {
    listen 80;
    server_name gradient.kyynet.net;
    root /var/www/kyynet-gradient/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Или ещё проще — Caddy (сам получит Let's Encrypt сертификат):

```
gradient.kyynet.net {
    root * /var/www/kyynet-gradient/dist
    file_server
    try_files {path} /index.html
}
```

**Всё. Домен `gradient.kyynet.net` уже вшит во все нужные места (meta-теги, sitemap, canonical) — ничего вручную менять не нужно.**

### Обновление после изменений в репо

```bash
cd /var/www/kyynet-gradient
git pull
npm ci
npm run build
```

(Nginx/Caddy просто пересечёт статические файлы, никакой рестарт не нужен.)

---

## 🛠 Локальная разработка

```bash
git clone https://github.com/ShevchenkoMikhail/kyynet-gradient.git
cd kyynet-gradient
npm install
npm run dev             # http://localhost:5173
```

Другие команды:

```bash
npm run build           # production-сборка в dist/
npm run preview         # локальный preview собранной версии
npm run typecheck       # tsc --noEmit
npm run test            # vitest (100+ юнит-тестов)
npm run lint            # eslint
```

---

## 📊 Счётчики использования

В футере три глобальных счётчика:

- **👁 Посещения** — инкрементируется на каждый заход на страницу
- **✨ Градиентов применено** — каждый клик «Применить к тексту»
- **📋 Текстов скопировано** — каждое успешное копирование результата

Бэкенд — бесплатный публичный сервис `abacus.jasoncameron.dev` (namespace: `kyynet-gradient`). Ничего настраивать не надо — работает само. Последние значения кэшируются в `localStorage`, чтобы UI показывал цифры мгновенно при повторных заходах.

---

## Стек

| Слой | Выбор |
|---|---|
| UI | React 18 + strict mode |
| Сборка | Vite 5 |
| Язык | TypeScript 5 |
| CSS | Плоские `.css` файлы + дизайн-токены. Нет Tailwind, нет CSS-in-JS. |
| Шрифт | Monocraft (OFL 1.1, self-hosted) |
| Runtime deps | `react`, `react-dom`, `react-colorful`, `canvas-confetti`, `react-i18next`, `i18next` — 6 штук |

Production bundle: **~95 KB gzipped**.

---

## Структура проекта

```
src/
├── engine/                   # Чистые функции, без UI. Ядро инструмента.
│   ├── types.ts              # Segment, GradientStop, StyleFlags
│   ├── parser.ts             # rawText (&-codes) → Segment[]
│   ├── import.ts             # MiniMessage/Legacy/Hex → Segment[] + gradients
│   ├── encoders/
│   │   ├── legacy.ts         # Segment[] → "&aПривет"
│   │   ├── hex.ts            # Segment[] → "&#ff5555Привет"
│   │   ├── miniMessage.ts    # Segment[] → "<color:#...>Привет</color>"
│   │   └── index.ts          # encodeAll() — все три сразу
│   ├── gradient/
│   │   ├── interpolate.ts    # sRGB multi-stop interpolation
│   │   ├── apply.ts          # Wrap selection with gradient markers
│   │   ├── flatten.ts        # Развернуть §{g1} в per-char hex
│   │   └── presets.ts        # 12 готовых градиентов
│   └── minecraft/
│       ├── legacyPalette.ts  # 16 канонических MC-цветов + nearest-match
│       └── styleCodes.ts     # l/o/n/m/k/r ↔ StyleFlags
│
├── state/                    # React-хуки
│   ├── useFormatDoc.ts       # Главное состояние: segments, gradients, undo/redo
│   ├── useUndoable.ts        # История past/present/future
│   ├── usePersistentState.ts # localStorage-wrapped useState
│   ├── useCopyFeedback.ts    # Copy + toast + confetti + counter
│   └── useCounter.ts         # Subscribe к глобальному счётчику
│
├── components/
│   ├── layout/               # Header / Intro / Footer / FooterStats / LanguageSwitcher
│   ├── preview/              # Preview + RenderedLine + 9 сцен + obfuscated animation
│   ├── editor/               # TextInput, ColorPalette, StyleToolbar, HexPicker,
│   │                         # GradientBuilder, ImportModal
│   ├── output/               # OutputPanel / OutputCard / CopyButton
│   └── feedback/             # ToastHost / ConfettiHost / LiquidBackground
│
├── i18n/                     # i18next + RU/EN dictionaries + typed useT()
├── utils/                    # color, cursor, clipboard, share (URL hash), counterService
├── constants/                # brand.ts, links.ts, defaults.ts
├── styles/                   # tokens.css, global.css, reset.css, animations.css
└── fonts/                    # minecraft.css @font-face

public/
├── fonts/Monocraft.ttf       # Pixel-шрифт для превью
├── favicon.svg               # Иконка во вкладке
├── og-image.svg              # Превью для соцсетей
├── robots.txt                # Для поисковиков
├── sitemap.xml               # Sitemap для Google
└── manifest.webmanifest      # PWA-метаданные (можно «добавить на экран»)

tests/engine/                 # 100 unit-тестов для парсера/энкодеров/импорта
```

---

## Архитектурные решения (для разработчиков и ИИ-ассистентов)

1. **Non-destructive formatting model.** Текст и форматирование хранятся раздельно. Источник истины — `Segment[]`, каждый символ знает `color`, `styles`, `gradientId`. В textarea только чистый текст, форматирование применяется к выделению.

2. **Three independent encoders.** `parser` → `Segment[]` → три энкодера (Legacy/Hex/MiniMessage). Каждый — чистая функция, тестируется отдельно. Добавить новый формат (например, `/tellraw` JSON) = один файл.

3. **Portal-rendered popovers.** Gradient stop popover и Import modal рендерятся в `document.body` через `createPortal`, чтобы обойти z-index ловушки от `backdrop-filter` в родителях.

4. **Design tokens.** Все цвета, радиусы, тени, шрифты — в `src/styles/tokens.css` как CSS custom properties. Будущие сиблинги KyyNet Toolkit переопределяют токены — семья сохранится без правок компонентов.

5. **URL hash persistence.** Весь документ кодируется в `location.hash` через run-length encoding + bitfield для стилей + base64. Делитесь ссылкой = делитесь готовой записью.

6. **Offline-first + опциональный бэкенд.** Всё работает локально (localStorage). Счётчики используют внешний бесплатный API с graceful fallback на кэш.

7. **Segment-first import.** `importFromCode(str)` возвращает `{ segments, gradients, lastGradientStops }`. Импортированный градиент загружается в редактор-полоску через `GradientBuilderHandle.loadStops` (forwardRef + useImperativeHandle).

---

## Верификация

```bash
npm run typecheck       # ✅ clean
npm run test            # ✅ 100 passed
npm run build           # ✅ ~95 KB gzipped
```

---

## Лицензия

MIT — см. [LICENSE](LICENSE). Шрифт Monocraft по лицензии SIL OFL 1.1 (© IdreesInc).

---

## Часть KyyNet

Основной сайт: [kyynet.net](https://kyynet.net) · Играйте на Minecraft-сервере: **[play.kyynet.net](https://play.kyynet.net)**
