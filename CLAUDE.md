# Випускник+ — Фронтенд

## Опис проекту

Інтернет-магазин кастомних шкільних стрічок та аксесуарів для шкільних свят.
Назва компанії: **Випускник +**

---

## Стек технологій

| Шар | Технологія |
|-----|-----------|
| Frontend | React + Vite |
| Мова | TypeScript |
| UI бібліотека | Ant Design (antd) |
| Анімації | Framer Motion |
| Управління станом | MobX |
| Роутинг | React Router DOM |
| Стилі | Tailwind CSS + окремі CSS файли на компонент |
| Backend | ASP.NET Core Web API (.NET 8), задеплоєний на Contabo |
| База даних | PostgreSQL + Entity Framework Core |

---

## Дизайн-система

### Кольори бренду

```
--color-primary:      #e91e8c   /* яскравий рожевий */
--color-primary-dark: #c2185b
--color-secondary:    #7c3aed   /* фіолетовий */
--color-accent:       #4f46e5   /* індиго */

--color-gradient-start: #ec4899  /* pink-500 */
--color-gradient-mid:   #9333ea  /* purple-600 */
--color-gradient-end:   #4f46e5  /* indigo-600 */

--color-bg:           #ffffff
--color-bg-soft:      #f9fafb
--color-bg-dark:      #111827

--color-text:         #1a1a2e
--color-text-muted:   #6b7280
--color-border:       #e5e7eb
```

### Типографіка
- Шрифт: `system-ui, 'Segoe UI', Roboto, sans-serif`
- Заголовки: жирний, щільний letter-spacing

### Відступи
- Базова одиниця Tailwind (4px)
- Секції: `py-24` (desktop), `py-16` (mobile)
- Контейнер: `max-w-6xl mx-auto px-6`

---

## Правила коду

### Мова
- Весь код, змінні, функції, коментарі, назви файлів: **англійська**
- Текст інтерфейсу та контент: **українська**

### Без емодзі
Ніколи не використовувати емодзі — ні в UI, ні в коді, ні в коментарях.

### TypeScript
- Всі нові файли на TypeScript (`.tsx`, `.ts`)
- Явні типи та інтерфейси для пропсів, моделей стору та відповідей API
- Уникати `any`; використовувати `unknown` з подальшим звуженням типу

### Правила компонентів
- Один компонент — один файл
- Назва файлу = назва компонента: `ProductCard.tsx` експортує `ProductCard`
- `src/components/` — спільні; `src/pages/` — рівень маршруту

### Іменування файлів
| Тип | Конвенція | Приклад |
|-----|-----------|---------|
| Компоненти | PascalCase | `ProductCard.tsx` |
| Сторінки | PascalCase | `Home.tsx` |
| Хуки | camelCase + `use` | `useCart.ts` |
| Стори (MobX) | PascalCase + `Store` | `CartStore.ts` |
| Утиліти | camelCase | `formatPrice.ts` |
| CSS файли | та сама назва що й компонент | `ProductCard.css` |

### Стилі
- Кожен компонент з кастомними стилями — **власний CSS файл** в тій самій директорії
- Tailwind — для layout та відступів; CSS файли — для кастомних/брендових стилів
- Inline-стилі тільки для динамічно обчислюваних значень

### Адаптивність
- **Desktop-first**: `md:` для планшета, `sm:` для мобайлу

---

## Структура проекту

```
src/
  App.tsx                          # Кореневий компонент, маршрути, Ant Design тема
  main.tsx
  index.css

  pages/
    About/                         # /about
    Account/                       # /account — профіль, замовлення, дизайни
    Auth/                          # /auth — вхід та реєстрація
    Cart/                          # /cart
    Catalog/                       # /catalog
    Checkout/                      # /checkout
    Contacts/                      # /contacts
    ConstructorHub/                 # /constructor
    Events/                        # /events
    GuestOrders/                   # /orders/guest
    Home/                          # /
    NotFound/                      # *
    OrderDetail/                   # /orders/:id
    OrderSuccess/                  # /order-success
    ProductPage/                   # /catalog/:id
    RibbonConstructor/             # /constructor/ribbon

  components/
    layout/
      Navbar.tsx / Navbar.css
      Footer.tsx / Footer.css
    cart/
      CartFloat.tsx / CartFloat.css
    ui/
      AnimatedSection.tsx
      CartToast.tsx / CartToast.css
      CountUp.tsx
      NamesDrawer.tsx / NamesDrawer.css
      RibbonEditorPreview.tsx / RibbonEditorPreview.css
      RibbonPreview.tsx / RibbonPreview.css
      TiltCard.tsx / TiltCard.css

  stores/
    RootStore.ts
    AuthStore.ts    # auth, refresh tokens, saved designs (id: number|string — string для optimistic temp IDs)
    CartStore.ts    # localStorage; productId: number|null (null для кастомних стрічок)
    ToastStore.ts

  api/
    client.ts       # VITE_API_URL; перехоплює 401 → auto-refresh → retry; dispatch auth:session-expired при невдачі
    token.ts        # getToken/setToken/getRefreshToken/setRefreshToken (localStorage)
    guest.ts        # getGuestToken (UUID), getGuestOrders, claimGuestOrders
    orders.ts       # createOrder, getUserOrders, getOrder
    products.ts     # getProducts, getProduct
    categories.ts   # getProductCategories() → GET /api/v1/product-categories (ProductCategoryResponse[])
    designs.ts             # fetchDesigns, createDesign, updateDesign, deleteDesign
    ribbon-print-types.ts  # getRibbonPrintTypes() → GET /api/v1/ribbon-print-types
    ribbon-emblems.ts      # getRibbonEmblems() → GET /api/v1/ribbon-emblems
    constructor-rules.ts   # getConstructorRules() → GET /api/v1/constructor/rules → ConstructorRulesResponse
    types.ts               # Shared API types (RibbonPrintTypeResponse, RibbonEmblemResponse з svgUrlLeft/svgUrlRight,
                           # ConstructorIncompatibilityResponse, ConstructorForcedTextResponse, ConstructorRulesResponse)

  constants/
    nav.ts
    products.ts     # Мок-дані (замінені реальним API)
    ribbonRules.ts  # RibbonState, типи конструктора; PRINT_TYPES/MATERIALS/FONTS — статичні fallback значення
                    # НЕ містить disabled/isOptionDisabled логіки — правила беруться з API (constructor-rules)

  hooks/
    useScrollAnimation.ts

  types/
    nav.ts
    product.ts      # Product тепер має categoryId/categoryName/subcategoryId?/subcategoryName? (замість enum Category)

  assets/
    hero.png
```

---

## Управління станом (MobX)

- `makeAutoObservable` в конструкторах
- Стори через React Context (`RootStore`), не імпортувати напряму в компоненти
- Локальний UI стан — `useState`

**SavedDesign.id** в `AuthStore.ts` має тип `number | string` — `string` тільки для тимчасових optimistic update ID (до синхронізації з сервером).

---

## API

- Base URL: `VITE_API_URL` (prod: `https://75.119.152.4.sslip.io`)
- Всі виклики через `src/api/` — ніколи напряму в компонентах
- `client.ts` auto-refresh при 401; при невдачі — `auth:session-expired` → AuthStore скидає стан
- Гостьові сесії: `guestToken` UUID генерується в `api/guest.ts`, зберігається в localStorage

---

## Конструктор стрічок (RibbonConstructor)

**Паттерн статичного fallback**: UI стан ініціалізується зі статичних констант (`PRINT_TYPES`, `COLORS` і т.д. з `ribbonRules.ts`), замінюється реальними даними API після завантаження.

**API стани конструктора:**
- `apiFonts` — завантажуються з `/api/v1/ribbon-fonts`; `fontFamily` передається напряму до превью
- `apiPrintTypes` — завантажуються з `/api/v1/ribbon-print-types`
- `apiEmblems` — завантажуються з `/api/v1/ribbon-emblems`; mapуються до `EmblemEntry[]` для превью
- `rules` — завантажуються з `/api/v1/constructor/rules` → `ConstructorRulesResponse`

**Система динамічних правил** (замінила хардкодовані `disabled` функції):
- `getFieldValue(state, type)` — маппінг типу поля до значення стану; emblem: `sortOrder → slug` через `apiEmblems`
- `getOptionStatus(type, slug)` — перевіряє несумісності в обидва боки; повертає `{ disabled, warning, message }`
- `forceSelect(type, slug)` — примусово вмикає опцію і вирішує конфлікти: `applyField → resolveConflicts → applyForcedTexts`
- `resolveConflicts(state, changedType)` — для кожного конфлікту скидає інше поле на перший не-конфліктний варіант
- `applyForcedTexts(state)` — якщо правило forcedText застосовується до `mainText`, скидає до першого дозволеного значення
- **emblemKey = sortOrder**: ідентифікатор емблеми в стані — `sortOrder` (число), slug використовується тільки для порівняння з правилами
- **Force-select UX**: клік на задізейблену кнопку вмикає її і автоматично перемикає конфліктні поля; `mainText` може стати `<Select>` якщо діє forcedText-правило

**RibbonEditorPreview** (`src/components/ui/RibbonEditorPreview.tsx`):
- `fontFamily?: string` — передається напряму (пріоритет над `getFontFamily(font)` lookup)
- `emblems?: EmblemEntry[]` — масив `{ sortOrder, svgUrlLeft, svgUrlRight }`
- `EmblemFromUrl` — компонент що завантажує SVG через `fetch`, кешує в `_svgCache`, інжектує через `ref.current.innerHTML` (обхід обмеження React на `dangerouslySetInnerHTML` в SVG)
- Auto-scaling: парсить `viewBox` → `scale = min(48/vbW, 52/vbH)` → центрує через `translate(tx, ty) scale(scale)`
- `hasRightEmblem = emblemSvgRight !== null || is3D` — умова відображення правої емблеми і розрахунку ширини

---

## Деплой

- **Фронт**: Vercel, `https://vypusknyk-plus-fronend.vercel.app`, автодеплой при push до main
- **Бек**: Contabo VPS `75.119.152.4`, Docker Compose, HTTPS через Nginx + sslip.io
- **Репо фронту**: `https://github.com/Stepll/vypusknyk-plus-fronend`
- **Репо беку**: `https://github.com/Stepll/vypusknyk-plus-backend`
- **Адмінка**: `https://github.com/Stepll/vypusknyk-plus-admin` (окремий Vercel проект)

---

## TODO

- [ ] Домен: купити домен, прив'язати до `75.119.152.4`, оновити `VITE_API_URL` на Vercel
- [ ] Зображення продуктів: завантажити реальні фото через адмінку (MinIO)
- [ ] Синхронізація кошика з бекендом (зараз тільки localStorage)
