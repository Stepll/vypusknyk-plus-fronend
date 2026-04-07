import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Tabs } from 'antd'
import { observer } from 'mobx-react-lite'
import { MOCK_PRODUCTS } from '../../constants/products'
import { RibbonColor, ProductCategory } from '../../types/product'
import NamesDrawer, { NamesData, countNames } from '../../components/ui/NamesDrawer'
import { useRootStore } from '../../stores/RootStore'
import './ProductPage.css'

const NAMED_PRICE_EXTRA = 20

const COLOR_HEX: Record<RibbonColor, string> = {
  coral: '#ff6b5b',
  'blue-yellow': '#1a56a0',
  white: '#d0d0d0',
  gold: '#c9a84c',
  red: '#e53935',
  green: '#43a047',
  purple: '#7c3aed',
  black: '#333333',
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ribbon: 'Стрічки',
  medal: 'Медалі',
  certificate: 'Грамоти',
  accessory: 'Аксесуари',
}

const CATEGORY_SPECS: Record<ProductCategory, { label: string; value: string }[]> = {
  ribbon: [
    { label: 'Матеріал', value: 'Поліестер 100%' },
    { label: 'Ширина', value: '10 см' },
    { label: 'Довжина', value: '90–110 см' },
    { label: 'Метод нанесення', value: 'Сублімаційний друк' },
    { label: 'Персоналізація', value: "Ім'я, клас, школа" },
    { label: 'Термін виготовлення', value: '5 робочих днів' },
  ],
  medal: [
    { label: 'Матеріал', value: 'Цинковий сплав' },
    { label: 'Діаметр', value: '70 мм' },
    { label: 'Покриття', value: 'Золото / Срібло / Бронза' },
    { label: 'Гравіювання', value: 'Лазерне' },
    { label: 'Кріплення', value: 'Стрічка 10 мм' },
    { label: 'Термін виготовлення', value: '5 робочих днів' },
  ],
  certificate: [
    { label: 'Формат', value: 'A4 (210 × 297 мм)' },
    { label: 'Папір', value: 'Дизайнерський, 200 г/м²' },
    { label: 'Друк', value: 'Кольоровий цифровий' },
    { label: 'Персоналізація', value: "Ім'я, клас, дата" },
    { label: 'Термін виготовлення', value: '5 робочих днів' },
  ],
  accessory: [
    { label: 'Матеріал', value: 'Метал / тканина' },
    { label: 'Оздоблення', value: 'Гравіювання на замовлення' },
    { label: 'Розмір', value: 'Вказано в описі' },
    { label: 'Термін виготовлення', value: '5 робочих днів' },
  ],
}

const DELIVERY_ROWS = [
  { title: 'Стандартне виготовлення', value: '5 робочих днів' },
  { title: 'Термінове виготовлення', value: '2 робочі дні +30% (замовлення до 14:00)' },
  { title: 'Нова Пошта / Укрпошта', value: '1–3 дні після виготовлення' },
  { title: 'Безкоштовна доставка', value: 'від 500 грн' },
  { title: 'Оплата', value: 'Передоплата або 50% при замовленні' },
]

const EMPTY_NAMES_DATA: NamesData = {
  school: '',
  groups: [{ className: '', names: '' }],
}

const ProductPage = observer(function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cart, toast } = useRootStore()

  const product = useMemo(
    () => MOCK_PRODUCTS.find(p => p.id === Number(id)),
    [id]
  )

  useEffect(() => {
    if (!product) navigate('/catalog', { replace: true })
  }, [product, navigate])

  const minOrder = product?.minOrder ?? 1
  const [qty, setQty] = useState(minOrder)
  const [activePhoto, setActivePhoto] = useState(0)
  const [namesDrawerOpen, setNamesDrawerOpen] = useState(false)
  const [namesData, setNamesData] = useState<NamesData>(EMPTY_NAMES_DATA)

  // Reset state when navigating between product pages
  useEffect(() => {
    setQty(product?.minOrder ?? 1)
    setActivePhoto(0)
    setNamesDrawerOpen(false)
    setNamesData(EMPTY_NAMES_DATA)
    window.scrollTo(0, 0)
  }, [id, product?.minOrder])

  const namedCount = useMemo(() => countNames(namesData.groups), [namesData])

  if (!product) return null

  const isRibbon = product.category === 'ribbon'
  const hasExcessNames = namedCount > qty
  const namedRibbons = Math.min(namedCount, qty)
  const regularRibbons = Math.max(0, qty - namedCount)
  const total = namedRibbons * (product.price + NAMED_PRICE_EXTRA) + regularRibbons * product.price

  const photoColor = product.color ? COLOR_HEX[product.color] : undefined
  const bgGradient = photoColor
    ? `linear-gradient(145deg, ${photoColor}dd, ${photoColor}77)`
    : 'linear-gradient(135deg, #ec4899, #9333ea, #4f46e5)'

  const related = MOCK_PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const totalLabel = namedCount > 0 && !hasExcessNames
    ? [
        namedRibbons > 0 && `${namedRibbons} іменних × ${product.price + NAMED_PRICE_EXTRA}`,
        regularRibbons > 0 && `${regularRibbons} × ${product.price}`,
      ].filter(Boolean).join(' + ') + ' грн'
    : `${qty} шт × ${product.price} грн`

  return (
    <div className="product-page">

      {/* Dark top band — gives transparent navbar visible contrast */}
      <div className="product-top-band">
        <div className="product-page__container">
          <nav className="product-breadcrumbs">
            <Link to="/" className="product-breadcrumbs__link">Головна</Link>
            <span className="product-breadcrumbs__sep">/</span>
            <Link to="/catalog" className="product-breadcrumbs__link">Каталог</Link>
            <span className="product-breadcrumbs__sep">/</span>
            <Link to="/catalog" className="product-breadcrumbs__link">
              {CATEGORY_LABELS[product.category]}
            </Link>
            <span className="product-breadcrumbs__sep">/</span>
            <span className="product-breadcrumbs__current">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="product-page__container">

        {/* Hero */}
        <div className="product-hero">

          {/* Gallery */}
          <div className="product-gallery">
            <motion.div
              key={activePhoto}
              className="product-gallery__main"
              style={{ background: bgGradient }}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            />
            <div className="product-gallery__thumbs">
              {[0, 1, 2, 3].map(i => (
                <button
                  key={i}
                  className={`product-gallery__thumb ${activePhoto === i ? 'product-gallery__thumb--active' : ''}`}
                  style={{ background: bgGradient, opacity: activePhoto === i ? 1 : 0.45 }}
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Фото ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="product-details">

            <div className="product-details__badges">
              {product.popular && <span className="pp-badge pp-badge--popular">Популярне</span>}
              {product.isNew && <span className="pp-badge pp-badge--new">Нове</span>}
            </div>

            <h1 className="product-details__name">{product.name}</h1>

            <div className="product-details__tags">
              {product.tags.map(tag => (
                <span key={tag} className="product-details__tag">#{tag}</span>
              ))}
            </div>

            <div className="product-details__price-row">
              <span className="product-details__price">{product.price} грн</span>
              <span className="product-details__unit">/ шт</span>
            </div>
            <p className="product-details__min-order">
              Мінімальне замовлення: {product.minOrder} шт
            </p>

            <div className="product-details__divider" />

            {/* Qty + names button */}
            <div className="product-details__qty-row">
              <div className="product-details__qty">
                <button
                  className="product-details__qty-btn"
                  onClick={() => setQty(q => Math.max(minOrder, q - 1))}
                  aria-label="Зменшити кількість"
                >
                  −
                </button>
                <span className="product-details__qty-val">{qty}</span>
                <button
                  className="product-details__qty-btn"
                  onClick={() => setQty(q => q + 1)}
                  aria-label="Збільшити кількість"
                >
                  +
                </button>
              </div>

              {isRibbon && (
                <button
                  className={`product-details__names-btn ${namedCount > 0 ? 'product-details__names-btn--filled' : ''}`}
                  onClick={() => setNamesDrawerOpen(true)}
                >
                  <span className="product-details__names-icon">+</span>
                  {namedCount > 0 ? `${namedCount} іменних` : 'Додати імена'}
                </button>
              )}
            </div>

            {/* Names meta info */}
            {isRibbon && (
              <div className="product-names-meta">
                <p className="product-names-meta__note">
                  Іменна стрічка +{NAMED_PRICE_EXTRA} грн/шт
                </p>
                {namedCount > 0 && !hasExcessNames && (
                  <p className="product-names-meta__count">
                    +{namedCount * NAMED_PRICE_EXTRA} грн за іменні
                  </p>
                )}
                {hasExcessNames && (
                  <p className="product-names-meta__warning">
                    Іменних ({namedCount}) більше ніж замовлено ({qty})
                  </p>
                )}
              </div>
            )}

            {/* Total */}
            <div className="product-details__total">
              <span className="product-details__total-label">{totalLabel}</span>
              <span className="product-details__total-value">{total} грн</span>
            </div>

            {/* Actions */}
            <div className="product-details__actions">
              <Button
                type="primary"
                className="product-details__add-btn"
                onClick={() => {
                  cart.addItem({
                    productId: product.id,
                    productName: product.name,
                    productCategory: product.category,
                    productColor: product.color,
                    basePrice: product.price,
                    qty,
                    namesData: isRibbon && countNames(namesData.groups) > 0 ? namesData : null,
                  })
                  toast.show(`${qty} ${qty === 1 ? 'товар додано' : qty < 5 ? 'товари додано' : 'товарів додано'} до кошика`)
                }}
              >
                Додати до кошика
              </Button>
              {isRibbon && (
                <Link to="/constructor">
                  <Button className="product-details__constructor-btn">
                    Конструктор стрічок
                  </Button>
                </Link>
              )}
            </div>

            <p className="product-details__delivery-note">
              Стандартний термін виготовлення: 5 робочих днів
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <Tabs
            defaultActiveKey="desc"
            items={[
              {
                key: 'desc',
                label: 'Опис',
                children: (
                  <p className="product-tab-text">{product.description}</p>
                ),
              },
              {
                key: 'specs',
                label: 'Характеристики',
                children: (
                  <table className="product-specs-table">
                    <tbody>
                      {CATEGORY_SPECS[product.category].map(s => (
                        <tr key={s.label} className="product-specs-row">
                          <td className="product-specs-row__label">{s.label}</td>
                          <td className="product-specs-row__value">{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ),
              },
              {
                key: 'delivery',
                label: 'Доставка',
                children: (
                  <div className="product-delivery-list">
                    {DELIVERY_ROWS.map(row => (
                      <div key={row.title} className="product-delivery-item">
                        <span className="product-delivery-item__title">{row.title}</span>
                        <span className="product-delivery-item__value">{row.value}</span>
                      </div>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="product-related">
            <h2 className="product-related__title">Схожі товари</h2>
            <div className="product-related__grid">
              {related.map(p => {
                const relBg = p.color
                  ? `linear-gradient(145deg, ${COLOR_HEX[p.color]}dd, ${COLOR_HEX[p.color]}77)`
                  : 'linear-gradient(135deg, #ec4899, #4f46e5)'
                return (
                  <Link key={p.id} to={`/catalog/${p.id}`} className="product-related-card">
                    <div className="product-related-card__photo" style={{ background: relBg }} />
                    <div className="product-related-card__body">
                      <p className="product-related-card__name">{p.name}</p>
                      <span className="product-related-card__price">{p.price} грн</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

      </div>

      {isRibbon && (
        <NamesDrawer
          open={namesDrawerOpen}
          onClose={() => setNamesDrawerOpen(false)}
          data={namesData}
          onChange={setNamesData}
        />
      )}
    </div>
  )
})

export default ProductPage
