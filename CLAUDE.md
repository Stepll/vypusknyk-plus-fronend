# Випускник+ — Налаштування проекту

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

Базуються на основному градієнті рожевий → фіолетовий → індиго.

```
--color-primary:      #e91e8c   /* яскравий рожевий — основний колір бренду */
--color-primary-dark: #c2185b   /* hover/active стани */
--color-secondary:    #7c3aed   /* фіолетовий — другорядний акцент */
--color-accent:       #4f46e5   /* індиго — посилання, виділення */

--color-gradient-start: #ec4899  /* pink-500 */
--color-gradient-mid:   #9333ea  /* purple-600 */
--color-gradient-end:   #4f46e5  /* indigo-600 */

--color-bg:           #ffffff
--color-bg-soft:      #f9fafb   /* фон секцій */
--color-bg-dark:      #111827   /* футер, темні секції */

--color-text:         #1a1a2e   /* основний текст */
--color-text-muted:   #6b7280   /* другорядний текст */
--color-border:       #e5e7eb
```

### Типографіка
- Шрифт: системний стек (`system-ui, 'Segoe UI', Roboto, sans-serif`)
- Заголовки: жирний, щільний letter-spacing
- Основний текст: звичайний, line-height 1.5

### Відступи
- Базова одиниця Tailwind (4px)
- Відступи секцій: `py-24` (десктоп), `py-16` (мобайл)
- Контейнер: `max-w-6xl mx-auto px-6`

---

## Правила коду

### Мова
- Весь код, змінні, функції, коментарі, назви файлів: **англійська**
- Текст інтерфейсу та контент: **українська**

### Без емодзі
Ніколи не використовувати емодзі — ні в UI, ні в коді, ні в коментарях, ні в назвах файлів.

### TypeScript
- Всі нові файли на TypeScript (`.tsx`, `.ts`)
- Явні типи та інтерфейси для пропсів, моделей стору та відповідей API
- Уникати `any`; використовувати `unknown` з подальшим звуженням типу

### Правила компонентів
- Один компонент — один файл
- Назва файлу збігається з назвою компонента: `ProductCard.tsx` експортує `ProductCard`
- Компоненти в `src/components/` (спільні) або `src/pages/` (рівень маршруту)

### Іменування файлів
| Тип | Конвенція | Приклад |
|-----|-----------|---------|
| Компоненти | PascalCase | `ProductCard.tsx` |
| Сторінки | PascalCase | `Home.tsx` |
| Хуки | camelCase з префіксом `use` | `useCart.ts` |
| Стори (MobX) | PascalCase + суфікс `Store` | `CartStore.ts` |
| Утиліти | camelCase | `formatPrice.ts` |
| CSS файли | та сама назва що й компонент | `ProductCard.css` |
| Константи | camelCase | `nav.ts` |

### Стилі
- Кожен компонент, якому потрібні кастомні стилі, отримує **власний CSS файл** в тій самій директорії
- CSS файл іменується так само як компонент: `Navbar.tsx` + `Navbar.css`
- Tailwind — для layout та відступів; CSS файли — для кастомних/брендових стилів
- Ніяких inline-стилів, крім динамічно обчислюваних значень

### Адаптивність
- **Desktop-first**: проектуємо для великих екранів, потім брейкпоінти для менших
- Tailwind брейкпоінти: `md:` для планшета, `sm:` для мобайлу

---

## Структура проекту

Кожна сторінка знаходиться в окремій папці: `pages/PageName/PageName.tsx` + `PageName.css`.

```
src/
  App.tsx                          # Кореневий компонент, маршрути, Ant Design тема
  main.tsx                         # Точка входу
  index.css                        # Глобальні стилі

  pages/                           # Сторінки рівня маршруту (кожна в окремій папці)
    About/                         # /about — про компанію
    Account/                       # /account — особистий кабінет (профіль, замовлення, дизайни)
    Auth/                          # /auth — вхід та реєстрація
    Cart/                          # /cart — кошик
    Catalog/                       # /catalog — каталог товарів
    Checkout/                      # /checkout — оформлення замовлення
    Contacts/                      # /contacts — контакти
    ConstructorHub/                 # /constructor — хаб конструкторів
    Events/                        # /events — події
    Home/                          # / — головна сторінка
    NotFound/                      # * — 404
    OrderDetail/                   # /orders/:id — деталі замовлення
    OrderSuccess/                  # /order-success — успішне замовлення
    GuestOrders/                   # /orders/guest — замовлення гостя (без реєстрації)
    ProductPage/                   # /catalog/:id — картка товару
    RibbonConstructor/             # /constructor/ribbon — конструктор стрічок

  components/
    layout/
      Navbar.tsx / Navbar.css      # Фіксована шапка з логотипом, навігацією, кошиком, профілем
      Footer.tsx / Footer.css      # Підвал сайту
    cart/
      CartFloat.tsx / CartFloat.css  # Плаваюча кнопка кошика
    ui/
      AnimatedSection.tsx          # Обгортка з анімацією появи при скролі
      CartToast.tsx / CartToast.css  # Toast-сповіщення (білий пілюль, зверху по центру)
      CountUp.tsx                  # Анімований лічильник чисел
      NamesDrawer.tsx / NamesDrawer.css  # Drawer для введення списку імен
      RibbonEditorPreview.tsx / RibbonEditorPreview.css  # SVG-прев'ю стрічки (міні)
      RibbonPreview.tsx / RibbonPreview.css              # SVG-прев'ю стрічки (повний)
      TiltCard.tsx / TiltCard.css  # Картка з ефектом нахилу при hover

  stores/                          # MobX стори
    RootStore.ts                   # Кореневий стор, React Context
    AuthStore.ts                   # Аутентифікація, refresh tokens, збережені дизайни, claim guestToken після логіну
    CartStore.ts                   # Кошик в localStorage; productId: number | null (null для кастомних стрічок)
    ToastStore.ts                  # Глобальні toast-сповіщення

  constants/
    mockOrders.ts                  # Типи та мок-дані замовлень (OrderStatus, MockOrder, MOCK_ORDERS)
    nav.ts                         # Посилання навігаційного меню
    products.ts                    # Мок-дані товарів каталогу
    ribbonRules.ts                 # Правила та типи конструктора стрічок (RibbonState)

  hooks/
    useScrollAnimation.ts          # Хук для анімації при скролі

  types/
    nav.ts                         # Тип NavLink
    product.ts                     # Тип Product

  api/
    client.ts                      # Базовий API клієнт (VITE_API_URL); перехоплює 401, auto-refresh JWT, dispatch auth:session-expired
    token.ts                       # getToken/setToken/getRefreshToken/setRefreshToken (localStorage)
    guest.ts                       # getGuestToken (UUID), getGuestOrders, claimGuestOrders
    orders.ts                      # createOrder, getUserOrders, getOrder
    products.ts                    # getProducts, getProduct
    designs.ts                     # fetchDesigns, createDesign, updateDesign, deleteDesign
    types.ts                       # Shared API types (OrderResponse, ProductResponse, etc.)

  assets/
    hero.png                       # Зображення для головної сторінки
```

---

## Управління станом (MobX)

- Один стор на домен: `CartStore`, `ProductStore`, `AuthStore`, `OrderStore`
- Стори в `src/stores/`
- Використовувати `makeAutoObservable` в конструкторах
- Передавати стори через React Context, не імпортувати напряму в компоненти
- Локальний UI стан тримати в `useState`, якщо не потрібно шарити між компонентами

---

## Ant Design

- Ant Design компоненти — основа для всіх елементів UI (Button, Input, Select, Table, Modal, Form тощо)
- Перевизначати токени Ant Design через конфіг `theme` в `App.tsx` відповідно до кольорів бренду
- Не змішувати нативні HTML елементи форм з компонентами Ant Design Form

---

## API

- Базовий URL через змінну середовища: `VITE_API_URL` (prod: `https://75.119.152.4.sslip.io`)
- Всі API виклики через `src/api/` — ніколи не викликати `fetch`/`axios` напряму в компонентах або сторах
- Використовувати async/await, не `.then()` ланцюжки
- `client.ts` автоматично оновлює JWT через refresh token при 401; при невдачі dispatch `auth:session-expired`
- Гостьові сесії: `guestToken` (UUID) генерується в `api/guest.ts` і зберігається в localStorage

## Деплой

- Фронт: Vercel, `https://vypusknyk-plus-fronend.vercel.app`, автодеплой при push до main
- Бек: Contabo VPS `75.119.152.4`, Docker Compose, HTTPS через Nginx + sslip.io
- Репо фронту: `https://github.com/Stepll/vypusknyk-plus-fronend`
- Репо беку: `https://github.com/Stepll/vypusknyk-plus-backend`

---

## Git

Конвенцій для назв гілок та повідомлень комітів наразі немає.
