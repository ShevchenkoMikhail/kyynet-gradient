# KyyNet Gradient

**Визуальный редактор форматированного текста для Minecraft.** Первый сервис экосистемы KyyNet Toolkit.

[🇷🇺 Russian](#russian) · [🇬🇧 English](#english)

---

## <a id="russian"></a>🇷🇺 Что это

Веб-приложение, в котором администратор сервера Minecraft или разработчик плагинов за несколько кликов собирает красивое цветное и форматированное сообщение (приветствие EssentialsX, лор предмета, MOTD, объявление в чат) **без** запоминания 16 legacy-цветов, hex-значений и путаницы между Legacy / Hex / MiniMessage.

### Ключевые возможности

| Фича | Описание |
|------|---------|
| **Three-format output** | Одновременно Legacy (`&aHi`), Hex (`&#ff5555Hi`), MiniMessage (`<color:#ff5555>Hi</color>`) |
| **Multi-stop gradients** | Градиент из 2–6 точек с перетягиванием, не только «от и до» |
| **12 пресетов градиентов** | Закат, Океан, Vaporwave, Огонь, Лес, Радуга, Галактика и т. д. — клик и применить |
| **Selection-based formatting** | Выделил «мир» → нажал красный → только «мир» краснеет. Текст остаётся чистым. |
| **Live preview** | Minecraft chat-панель с пиксельным шрифтом Monocraft и классической игровой drop-shadow |
| **9 сцен превью** | Оригинал (фиолетовый) / трава / песчаник / небо / ночь / белый / серый / тёмно-серый / чёрный — видно как текст смотрится на разных фонах |
| **Import** | Вставьте существующий `&aHi`, `§aHi` или `<color:#ff0000>Hi</color>` → распарсится в редактируемый документ |
| **Share URL** | Документ кодируется в `location.hash` — отправил ссылку = отправил готовое сообщение |
| **Undo / Redo** | Ctrl+Z / Ctrl+Shift+Z, глубина 60 |
| **Bilingual** | RU / EN с мгновенным переключением, запоминается |
| **Счётчик посещений** | Глобальный (через counterapi.dev) с graceful fallback на localStorage |
| **Visual extras** | Пиксельная анимация заголовка, жидкий фиолетово-зелёный фон, конфетти при копировании |

### Быстрый старт (разработка)

```bash
git clone https://github.com/<user>/kyynet-gradient.git
cd kyynet-gradient
npm install
npm run dev                  # dev-сервер на http://localhost:5173
```

Другие команды:

```bash
npm run build         # production-сборка в dist/
npm run preview       # локальный preview собранной версии
npm run typecheck     # tsc --noEmit
npm run test          # vitest (96+ юнит-тестов)
npm run lint          # eslint
```

### Деплой на сервер

**Это полностью статический сайт.** После `npm run build` папка `dist/` содержит всё необходимое:

```
dist/
├── index.html
├── assets/
│   ├── index-<hash>.js
│   └── style-<hash>.css
├── fonts/Monocraft.ttf
└── favicon.svg
```

Вариант 1 — **своим сервером (Nginx / Caddy)**:

```bash
# на сервере:
git clone https://github.com/<user>/kyynet-gradient.git
cd kyynet-gradient
npm ci                       # или npm install
npm run build                # создаёт dist/
# настройте Nginx/Caddy на обслуживание dist/ как статического сайта
```

Минимальная конфигурация **Nginx** (SPA-совместимая):

```nginx
server {
    listen 80;
    server_name gradient.kyynet.net;
    root /var/www/kyynet-gradient/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|woff2?|ttf|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Caddy** (ещё проще):

```
gradient.kyynet.net {
    root * /var/www/kyynet-gradient/dist
    file_server
    try_files {path} {path}/ /index.html
}
```

Вариант 2 — **Cloudflare Pages / Netlify / Vercel**:

1. Подключить GitHub-репозиторий.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Готово — деплой автоматически при push в main.

### Что дополнительно настроить на сервере?

**Ничего обязательного.** Проект самодостаточен. Но опционально:

1. **Замена placeholder-ссылок** в [src/constants/links.ts](src/constants/links.ts) — сейчас это заглушки на `kyynet.net/about`, `/contacts`, `/privacy`. Можно указать рабочие.
2. **Свой счётчик посещений**. По умолчанию используется `api.counterapi.dev/v1/kyynet-gradient/visits` (бесплатный сервис, 1000 req/day). Если хочется свой:
   - Подмените URL в [src/components/layout/Footer/VisitCounter.tsx](src/components/layout/Footer/VisitCounter.tsx) — `COUNTER_URL`
   - Или поднимите простой endpoint на бэкенде, возвращающий `{ "count": N }`
3. **Шрифт Monocraft → WOFF2**. Сейчас в `public/fonts/` лежит `.ttf` (210 KB). Конвертация в `.woff2` сжимает ~40%. Обновите `src/fonts/minecraft.css` и `index.html` preload.
4. **Брендинг**. Имя сервиса — в [src/constants/brand.ts](src/constants/brand.ts) (`SERVICE_NAME`). Дизайн-токены (цвета, шрифты, тени) — в [src/styles/tokens.css](src/styles/tokens.css) — единая точка для всего семейства KyyNet.

### Стек

| Слой | Выбор |
|---|---|
| UI | React 18 + strict mode |
| Сборка | Vite 5 + `@vitejs/plugin-react` |
| Язык | TypeScript 5 |
| CSS | Плоские `.css` файлы + дизайн-токены (CSS custom properties). Нет Tailwind, нет CSS-in-JS. |
| Шрифт | Monocraft (OFL 1.1, кириллица, self-hosted) |
| Внешние пакеты | `react-colorful` (цветопикер) · `canvas-confetti` (конфетти) · `react-i18next` + `i18next` (локализация) |
| Тесты | `vitest` + `@testing-library/react` + `playwright` |

**Итого рантайм-зависимостей: 6** (`react`, `react-dom`, `react-colorful`, `canvas-confetti`, `i18next`, `react-i18next`).

### Структура проекта

```
src/
├── engine/                   # Чистые функции, без UI. Ядро инструмента.
│   ├── types.ts              # Segment, GradientStop, StyleFlags
│   ├── parser.ts             # rawText (&-codes) → Segment[]
│   ├── import.ts             # MiniMessage/Legacy/Hex → Segment[]
│   ├── encoders/
│   │   ├── legacy.ts         # Segment[] → "&aПривет"
│   │   ├── hex.ts            # Segment[] → "&#ff5555Привет"
│   │   ├── miniMessage.ts    # Segment[] → "<color:#ff5555>Привет</color>"
│   │   └── index.ts          # encodeAll() — вызывает все три
│   ├── gradient/
│   │   ├── interpolate.ts    # sRGB линейная интерполяция multi-stop
│   │   ├── apply.ts          # Wrap selection with gradient markers
│   │   ├── flatten.ts        # Развернуть §{g1}...§{/g1} в per-char hex
│   │   └── presets.ts        # 12 готовых градиентов
│   └── minecraft/
│       ├── legacyPalette.ts  # 16 канонических MC-цветов + nearest-match
│       └── styleCodes.ts     # l/o/n/m/k/r ↔ StyleFlags
│
├── state/                    # React-хуки
│   ├── useFormatDoc.ts       # Главный state: segments, gradients, outputs + undo/redo + persistence
│   ├── useUndoable.ts        # Универсальный undo-stack
│   ├── usePersistentState.ts # localStorage-wrapped useState
│   └── useCopyFeedback.ts    # Копирование + тост + конфетти
│
├── components/
│   ├── layout/               # Header / Intro / Footer / LanguageSwitcher / VisitCounter
│   ├── preview/              # Preview panel + per-char rendering + obfuscated animation + scene switcher
│   ├── editor/               # TextInput, ColorPalette, StyleToolbar, HexPicker, GradientBuilder, ImportModal
│   ├── output/               # OutputPanel / OutputCard / CopyButton
│   └── feedback/             # ToastHost / ConfettiHost / LiquidBackground
│
├── i18n/                     # i18next init + RU/EN dictionaries + typed useT() hook
├── utils/                    # Color math, cursor insert, clipboard, share (URL hash encode/decode)
├── constants/                # brand.ts, links.ts, defaults.ts
├── styles/                   # tokens.css, global.css, reset.css, animations.css
└── fonts/                    # minecraft.css @font-face

tests/
└── engine/                   # 96 юнит-тестов для парсера, энкодеров, градиента, импорта

public/
└── fonts/Monocraft.ttf       # Self-hosted pixel-шрифт для превью
```

### Архитектурные решения (для ИИ и разработчиков)

1. **Non-destructive formatting model**. Текст и форматирование хранятся раздельно. Источник истины — `Segment[]`, где каждый символ знает свои `color`, `styles`, `gradientId`. Пользователь видит plain-текст в textarea; форматирование применяется к ВЫДЕЛЕНИЮ. Это решает проблему прошлого дизайна, где вставка `&a` в позицию курсора ломала текст.

2. **Three independent encoders**. `parser` → `Segment[]` → три независимых энкодера (Legacy / Hex / MiniMessage). Каждый энкодер — чистая функция, юнит-тестируемая отдельно. Добавление нового формата (например, JSON text component для `/tellraw`) = один новый файл в `engine/encoders/`.

3. **Portal-rendered popovers**. Gradient-стоп попап и Import-модалка рендерятся в `document.body` через `createPortal`, чтобы избегать z-index-ловушек stacking-контекстов (backdrop-filter в родителях).

4. **Design tokens**. Все цвета, радиусы, тени, шрифты — в [src/styles/tokens.css](src/styles/tokens.css) как CSS custom properties. Будущие сиблинги KyyNet Toolkit просто подгрузят свой токен-файл — визуальная семья сохранится без правок компонентов.

5. **URL hash persistence**. Полный документ кодируется в `location.hash` через run-length encoding + bitfield для стилей + base64. Для «Привет мир!» с градиентом = ~240 байт. Делитесь = отправляете саму запись.

6. **Offline-first + опциональный бэкенд**. Всё работает локально (localStorage). Счётчик посещений использует внешний бесплатный сервис с graceful fallback.

### Верификация

```bash
npm run typecheck     # ✅ clean
npm run test          # ✅ 96 passed
npm run build         # ✅ ~94 KB gzipped (39 KB CSS + 267 KB JS)
```

**Lighthouse** (локально, desktop): Performance 95+ · Accessibility 95+ · Best Practices 100 · SEO 100.

### Лицензия

MIT — см. [LICENSE](LICENSE).

Шрифт **Monocraft** использован по лицензии SIL Open Font License 1.1 (автор: IdreesInc).

### Часть KyyNet

Этот проект — первый в планируемой серии инструментов **KyyNet Toolkit**. Играйте на сервере: [play.kyynet.net](https://play.kyynet.net) · Основной сайт: [kyynet.net](https://kyynet.net).

---

## <a id="english"></a>🇬🇧 English (brief)

**KyyNet Gradient** is a visual editor for Minecraft formatted text. Target audience: MC server admins and plugin developers who want to craft colored/styled messages without memorizing 16 legacy colors, juggling three different syntaxes (Legacy, Hex, MiniMessage), or editing raw codes.

**Highlights:**

- Non-destructive formatting (plain text + selection-based apply)
- 12 gradient presets + custom multi-stop gradient builder
- 3 output formats simultaneously with one-click copy
- Import existing coded strings (Legacy / Hex / MiniMessage with `<gradient>` expansion)
- Share URL encodes the entire document in the hash
- Undo / Redo (Ctrl+Z)
- Bilingual RU / EN with instant toggle
- Live Minecraft preview with pixel font, drop-shadow, obfuscated animation
- 9 preview scene backgrounds (original purple / grass / sandstone / sky / night / white / gray / dark gray / black)
- Animated purple hero title with rainbow metallic letters
- Confetti on copy

**Tech**: React 18 + Vite + TypeScript, native CSS (no Tailwind), minimal runtime dependencies (`react-colorful`, `canvas-confetti`, `react-i18next`).

**Build**: `npm run build` → static `dist/` folder. Deploy anywhere that serves static HTML: Nginx, Caddy, Cloudflare Pages, Netlify, Vercel, GitHub Pages.

No server-side logic required. All state persists in `localStorage` + `location.hash`.

See Russian section above for detailed architecture and deployment notes.

### License

MIT. Monocraft font under SIL OFL 1.1 (© IdreesInc).
