# Аудит `bsr-modaldialog`

Исходное состояние — `3.0.4`. Результат работы — `3.1.0` (см. `CHANGELOG.md`).

## Область и метод

Проверено: весь `src/`, `package.json`, `rollup.config.js`, `tsconfig.json`,
`.eslintrc.js`, `README.md`, историю коммитов и `dist/`.

Читать код было недостаточно, поэтому:

- `npx tsc --noEmit` (типы),
- `npm run build` (сборка),
- `npm audit` (зависимости),
- воспроизведение поведения в `jsdom` с настоящими `react` / `react-dom`:
  две копии React, двойной `root.unmount()`, деструктуризация props в конструкторе;
- проверка интеграции в условиях реального потребителя
  (`WebstormProjects/audio_map_80/client`: React 18.3.1, Vite 8.3.4, TypeScript 5.7.3,
  `bsr-modaldialog@2.3.7` из npm).

Найдено 25 пунктов. Ниже — что исправлено, чем это подтверждено и что осталось.

## Резюме

| # | Проблема | Было | Стало |
| --- | --- | --- | --- |
| 1 | React/ReactDOM вкомпилированы в пакет | 1.65 МБ, 2 копии React, `Invalid hook call` | `external`, 10 КБ |
| 2 | Ошибка в контенте диалога | промис никогда не завершается | reject + размонтирование |
| 3 | Уязвимости зависимостей | 80 (4 critical / 45 high) | 7 (только dev-инструментарий) |
| 4 | `onClose` | никогда не вызывался | вызывается ровно один раз |
| 5 | `removeChild` без проверок | падение при `ModalDialog` без `WrapperModal` | guard-проверки |
| 6 | `serviceDialog` + `setTimeout(1)` | возможна привязка к чужому диалогу | синхронная регистрация |
| 7 | Побочные эффекты в конструкторе | ломается в StrictMode | перенесены в `componentDidMount` |
| 8 | Таймер `timeOut` | повторный resolve / unmount / `getData` | `clearTimeout`, один раз |
| 9 | `private: true` | публикация невозможна | убрано |
| 10 | `@powershell copy` | сборка только под Windows | `node scripts/copy-css.mjs` |
| 11 | `dist/` в git | ~3.3 МБ, диффы по 44 тыс. строк | в `.gitignore`, устаревшие `.d.ts` удалены |
| 12-13 | Нет минификации, `exports`, `sideEffects` | — | добавлено |
| 14-15 | Ловушка фокуса, автофокус | только при монтировании, дырки | пересчёт на каждый Tab |
| 16-19 | Контракт кнопок, типы, мёртвый код | — | cleanup / типы |
| 20-25 | `uuid`, CSS, a11y, SSR, инфраструктура | — | см. разделы ниже |

## 1. Критично: пакет содержал вторую копию React

`rollup.config.js` не выносил `react`/`react-dom` в `external`, поэтому в
`dist/cjs/index.js` и `dist/esm/index.js` лежали `react_development`,
`react_production` и `reactDomClient_production` (по 1.65 МБ каждый).

Подтверждение было прямо в коде потребителя —
`audio_map_80/client/src/components/tooltip/Tip.tsx`:

> `Implemented as a class component on purpose: some parts of the app render inside`
> `bsr-modaldialog, which uses its own React renderer where function components with`
> `hooks throw "Invalid hook call". Class components work there.`

Воспроизведено на React 18.3.1 потребителя (`hookcheck.cjs`):

```
=== OLD bsr-modaldialog 2.3.7 (bundled React) ===
TypeError: Cannot read properties of null (reading 'useState')
    at HookBody (hookcheck.cjs:31:33)
    at renderWithHooks (.../bsr-modaldialog/dist/cjs/index.js:19806:19)

=== NEW bsr-modaldialog 3.1.0 (external React) ===
package      : 3.1.0 | main bundle: 10 KB
hook body    : RENDERED
hook errors  : none
```

Исправлено: `external` для `react`, `react-dom`, `react-dom/*`, `react-icons`,
`react-icons/*`, `react/jsx-runtime`. `react`/`react-dom` — peer-зависимости
(диапазон расширен до `^18.3.0 || ^19.0.0`, иначе пакет вообще нельзя было
поставить в проект на React 18).

## 2. Ошибка в контенте «вешала» промис

`__innerCloseDom` резолвил/реджектил промис только при закрытии, а исключение в
контенте размонтировало React root без уведомления вызывающего. Добавлен error
boundary (`getDerivedStateFromError` + `componentDidCatch`): промис реджектится,
контейнер удаляется. Тест: `an error in the dialog content rejects the promise
instead of hanging`.

## 3. Зависимости

`react-scripts@5.0.1` не использовался ни одним скриптом, но тянул webpack,
babel, jest, workbox, tailwind и был источником почти всех алертов
(в т.ч. `postcss@8.4.38` и `ws` со скриншота). После чистки:

```
npm audit: 80 (4 critical, 45 high, 17 moderate, 14 low)
        -> 7 (1 moderate, 6 high, только dev-инструментарий rollup/eslint)
удалено 1426 транзитивных пакетов
```

`uuid@9` (moderate, и он был в `devDependencies`, хотя используется в рантайме)
заменён внутренним генератором id — минус зависимость. `react-icons` перенесён в
`dependencies`.

## 4-11. Остальные исправления

- **`onClose`** назначался на `div.onclose` — такого события у `div` нет, колбэк
  был мёртвым. Теперь вызывается в момент фактического закрытия (ровно один раз).
- **`componentWillUnmount`**: `document.body.removeChild(this.props.__container)`
  без проверок падал, если `ModalDialog` используют напрямую (он экспортируется),
  и ломал восстановление фокуса. Добавлены проверки `parentNode` / `document.contains`.
- **`BaseBodyDialog`** привязывал `validate`/`getData`/`selfClose` через
  `setTimeout(1)` к глобальному `hostDialog.currentDialog` — возможна привязка к
  позже открытому диалогу. Теперь регистрация синхронная, в конструкторе
  (это важно: потребители переопределяют `componentDidMount` **без** `super()`,
  см. `DialogContentFeature.tsx`, `colorDialog.tsx`, `dialogError.tsx`).
- **Побочные эффекты из конструктора** (`hostDialog` без самоссылки при повторном
  конструкторе, `document.activeElement` — в `componentDidMount`).
- **`timeOut`**: таймер очищается, повторное закрытие не резолвит промис дважды и
  не размонтирует root повторно (добавлен флаг `closed`, `__actionUnmount` идемпотентен).
- **`private: true`** убрано — по README пакет ставится из npm.
- **Сборка**: `@powershell copy` заменён на `node scripts/copy-css.mjs` (работает в CI
  на Linux/macOS), добавлены минификация (terser) и шаг `tsc --emitDeclarationOnly`
  (декларации перестали дублироваться в `dist/cjs/esm/`, устаревшие
  `dist/*/modal/*.d.ts` удалены).
- **`dist/`** убран из git и добавлен в `.gitignore`.
- **`exports` + `sideEffects`**. Важно: `./dist/index.css` и `./dist/*` обязаны
  остаться доступными, иначе ломается `import "bsr-modaldialog/dist/index.css"`
  у потребителя. Проверено негативным контролем (без этих ключей):
  ```
  Build failed with 1 error:
  "./dist/index.css" is not exported under the conditions ["module","browser","production","import"]
  ```
  Дополнительно: ESM-сборка теперь `dist/esm/index.mjs`, иначе Node не смог бы
  загрузить её как ESM (пакет без `"type": "module"`), и `import 'bsr-modaldialog'`
  в нативном ESM падал бы.
- **Ловушка фокуса** пересчитывает фокусируемые элементы на каждое нажатие Tab
  (раньше список собирался один раз при монтировании, динамические кнопки
  игнорировались) и не выпускает фокус за пределы диалога.
- **`findHighestZIndex`** игнорирует `z-index: auto` и не возвращает
  `Number.MIN_SAFE_INTEGER`, если ни у одного элемента нет `z-index`.
- **CSS**: `.ass-dialog` / `.main-dialog` переведены с `position: absolute` на
  `position: fixed` (оверлей больше не «уезжает» при прокрутке), удалён
  неиспользуемый `.icon-close` с невалидным `size: 25px`.
- **Типы**: экспортируется `ResolvePromise` (тип результата промиса), убраны
  `any`-поля-обёртки, `@ts-ignore` → `@ts-expect-error`, исправлена сигнатура
  конструктора (`constructor({props})` — работала случайно), удалён мёртвый код
  (`state.isShow`, `promiseInfo`, `body`, `focusable`).
- **Линт**: вместо `.eslintrc.js` (eslint 7 без TS-парсера, который не линтил
  `.tsx`) — flat-config с `typescript-eslint@8` и скрипт `npm run lint`.
- **Тесты** (`npm test`, 25 тестов, jsdom): закрытие кнопкой / Esc / оверлеем,
  `onCancel`, `timeOut`, `onClose`/`onShow`, восстановление фокуса, ловушка фокуса,
  хуки в контенте, `getData`/`validate`/`selfClose`, вложенные диалоги, ошибка в
  контенте, ESM-вход, отсутствие React в бандле, доступность `dist/index.css`.
- **Инфраструктура**: добавлены `LICENSE` (MIT) и `CHANGELOG.md`.

## Проверка интеграции с `audio_map_80/client`

Отдельный стенд с React 18.3.1, `@types/react` 18.3.31, TypeScript 5.7.3 и
Vite 8.3.4 (всё из `node_modules` потребителя), плюс собранный пакет:

1. `tsc -p tsconfig.json` с **их** конфигом (`moduleResolution: "bundler"`,
   `noUncheckedSideEffectImports`, `noUnusedLocals`) — 0 ошибок.
2. `vite build` — успешно, CSS из `bsr-modaldialog/dist/index.css` в бандле,
   никакого дублирования React.
3. Runtime-проверки на React 18.3.1 с их паттернами
   (`BaseBodyDialog` + переопределённый `componentDidMount` без `super()`,
   `data-mode`/`data-focus`, `position: "top"`, `react-icons`):
   ```
   OK  hook body rendered / hook state update works
   OK  body componentDidMount ran (consumer override)
   OK  validate() veto keeps the dialog open
   OK  getData() result delivered -> {"ok":false,"mode":"-1","dataBody":{"mode":"-1","text":"boom"}}
   OK  selfClose works / containers removed
   OK  no "Invalid hook call"
   ALL CONSUMER CHECKS PASSED
   ```

Публичный API не менялся: имена экспортов, props, значения `data-mode`/`data-focus`,
css-классы `main-dialog`, `ass-dialog`, `m-header`, `m-body`, `m-footer`,
`btn-close-modal` — всё как было (тест `the public api of the previous version is unchanged`).
Класс `m-body`, который потребитель использует в `componentDidMount`
(`document.getElementsByClassName('m-body')[0].clientHeight`), сохранён.

### Как поставить потребителю

```jsonc
// audio_map_80/client/package.json
"bsr-modaldialog": "^3.1.0"   // вместо "^2.3.7"
```
```bash
npm install
```
React обновлять не нужно (диапазон peer включает 18.3). Для локальной отладки
можно использовать `file:` / `npm link`.

После этого обходной путь в `Tip.tsx` (классовый тултип из-за `Invalid hook call`)
становится не нужен — но это уже решение владельца кода.

## Что осталось (осознанно не менял)

1. **Кнопка закрытия исчезает, если нет `header` и `icon`** — при монтировании
   удаляется весь `.m-header` вместе с `btn-close-modal`. Это существующее
   поведение, менять его в минорной версии рискованно (влияет на UI). Стоит
   починить в мажорной.
2. **`data-mode` / `data-focus` читаются из `button.props`** — хрупкий контракт:
   любая обёртка кнопки ломает логику. Правильнее принимать `onClick`-коллбэки.
   Мажорная версия.
3. **`hostDialog` — глобальный синглтон**, а не React-context. Он нужен, чтобы
   только верхний диалог реагировал на Esc/оверлей. Замену на context я не делал
   сознательно: риск сломать вложенные диалоги выше выгоды. Также Esc слушается
   на `keyup`, а не `keydown` (сохранено для совместимости).
4. **SSR не поддерживается** (`document` используется при вызове).
5. **a11y**: `aria-live="assertive"` на самом диалоге лишний, нет accessible name
   по умолчанию, `aria-label="Close"` не локализован.
6. **CSS**: цвета и `width: 500px` захардкожены, нет тёмной темы; классы глобальные.
7. **ESM-файл `.mjs`** — теперь корректно, но `dist/cjs` и `dist/esm` дублируют
   логику (нет единого `dist/index.mjs` для браузера). Для библиотеки на 10 КБ это
   нормально.
8. **Нет CI** — стоит добавить GitHub Actions с `npm ci && npm run lint && npm test`,
   тогда `npm test` (сборка + тесты) будет проверяться на каждый PR.
9. **`public/`** (favicon, `index.html`, `manifest.json`, логотипы) — мусор от
   Create React App, библиотеке не нужен; не удалял.
10. **`.idea/` закоммичен** — стандартная гигиена: убрать из git и добавить в
    `.gitignore`.
11. **Остаточные 7 уязвимостей** — в dev-инструментарии (`rollup`,
    `@rollup/plugin-terser` → `serialize-javascript`, `eslint` и их транзитивные
    зависимости); в публикуемый пакет они не попадают. У части из них
    исправленной версии пока нет — это ожидаемо и не влияет на `dist`.
12. **`useDefineForClassFields`** — проект потребителя использует
    `useDefineForClassFields: true`, а библиотека собирается с `target: es5`
    (свои `__extends`). Совместимо, но при следующем мажоре стоит поднять `target`.

## Проверенные команды

```bash
npm run build   # tsc (d.ts) + rollup (cjs/esm, terser) + copy css
npm run lint    # eslint flat config + typescript-eslint
npm test        # сборка + 25 тестов на jsdom
npm audit
```
