import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Select, Tag } from 'antd'
import { Product, RibbonColor, SortOption } from '../../types/product'
import { getProducts } from '../../api/products'
import { getProductCategories } from '../../api/categories'
import type { ProductCategoryResponse } from '../../api/types'
import './Catalog.css'

const COLOR_LABELS: Record<RibbonColor, string> = {
  coral: 'Корал',
  'blue-yellow': 'Синьо-жовта',
  white: 'Біла',
  gold: 'Золота',
  red: 'Червона',
  green: 'Зелена',
  purple: 'Фіолетова',
  black: 'Чорна',
}

const COLOR_HEX: Record<string, string> = {
  coral: '#ff6b5b',
  'blue-yellow': '#1a56a0',
  white: '#e8e8e8',
  gold: '#c9a84c',
  red: '#e53935',
  green: '#43a047',
  purple: '#7c3aed',
  black: '#222222',
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular',    label: 'Популярні спочатку' },
  { value: 'price-asc',  label: 'Ціна: від низької' },
  { value: 'price-desc', label: 'Ціна: від високої' },
  { value: 'name-asc',   label: 'За назвою А-Я' },
]

const ALL_COLORS: RibbonColor[] = ['coral', 'blue-yellow', 'white', 'gold', 'red', 'green', 'purple', 'black']

const PROMO_NAMES = [
  'Марія Іваненко',
  'Олена Петренко',
  'Максим Коваленко',
  'Вікторія Шевченко',
  'Андрій Мельник',
  'Богдан Гончаренко',
  'Анастасія Лисенко',
  'Дмитро Ткаченко',
]

function CyclingName() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % PROMO_NAMES.length), 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        className="ribbon-demo__name"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {PROMO_NAMES[index]}
      </motion.span>
    </AnimatePresence>
  )
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([])
  const [loading, setLoading] = useState(true)

  const [activeCategoryIds, setActiveCategoryIds] = useState<number[]>([])
  const [activeColors, setActiveColors] = useState<RibbonColor[]>([])
  const [onlyNew, setOnlyNew] = useState(false)
  const [sort, setSort] = useState<SortOption>('popular')

  useEffect(() => {
    getProductCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    getProducts()
      .then(res => setProducts(
        res.items.map(p => ({
          ...p,
          color: p.color as RibbonColor | undefined,
        }))
      ))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleCategory = (id: number) => {
    setActiveCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleColor = (color: RibbonColor) => {
    setActiveColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    )
  }

  const clearFilters = () => {
    setActiveCategoryIds([])
    setActiveColors([])
    setOnlyNew(false)
  }

  const hasFilters = activeCategoryIds.length > 0 || activeColors.length > 0 || onlyNew

  const filtered = useMemo(() => {
    let result = [...products]

    if (activeCategoryIds.length > 0) {
      result = result.filter(p => activeCategoryIds.includes(p.categoryId))
    }
    if (activeColors.length > 0) {
      result = result.filter(p => p.color && activeColors.includes(p.color))
    }
    if (onlyNew) {
      result = result.filter(p => p.isNew)
    }

    switch (sort) {
      case 'popular':    result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0)); break
      case 'price-asc':  result.sort((a, b) => a.price - b.price); break
      case 'price-desc': result.sort((a, b) => b.price - a.price); break
      case 'name-asc':   result.sort((a, b) => a.name.localeCompare(b.name, 'uk')); break
    }

    return result
  }, [products, activeCategoryIds, activeColors, onlyNew, sort])

  return (
    <div className="catalog-page">

      {/* ── Constructor promo ── */}
      <section className="constructor-promo">
        <div className="catalog-container">
          <div className="constructor-promo__inner">
            <div className="constructor-promo__text">
              <span className="constructor-promo__label">Новинка</span>
              <h1 className="constructor-promo__title">
                Конструктор стрічок
              </h1>
              <p className="constructor-promo__desc">
                Створіть стрічку мрії онлайн — оберіть колір, вкажіть ім'я, клас,
                школу та емблему. Побачте результат у реальному часі ще до замовлення.
              </p>
              <div className="constructor-promo__actions">
                <Link to="/constructor">
                  <Button className="constructor-promo__btn-primary">
                    Відкрити конструктор
                  </Button>
                </Link>
                <span className="constructor-promo__hint">
                  Безкоштовно, без реєстрації
                </span>
              </div>
            </div>
            <div className="constructor-promo__preview">
              <div className="constructor-promo__ribbon-demo">
                <div className="ribbon-demo__stripe ribbon-demo__stripe--1" />
                <div className="ribbon-demo__stripe ribbon-demo__stripe--2" />
                <div className="ribbon-demo__stripe ribbon-demo__stripe--3" />
                <div className="ribbon-demo__text-block">
                  <div className="ribbon-demo__name-wrap">
                    <CyclingName />
                  </div>
                  <span className="ribbon-demo__title">Випускник 2026</span>
                  <span className="ribbon-demo__sub">11-А клас · Ліцей №42</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Catalog body ── */}
      <div className="catalog-container catalog-body">

        {/* Filters sidebar */}
        <aside className="catalog-filters">
          <div className="catalog-filters__header">
            <span className="catalog-filters__title">Фільтри</span>
            {hasFilters && (
              <button className="catalog-filters__clear" onClick={clearFilters}>
                Скинути
              </button>
            )}
          </div>

          {/* Category */}
          <div className="filter-group">
            <p className="filter-group__label">Категорія</p>
            <div className="filter-group__options">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-chip ${activeCategoryIds.includes(cat.id) ? 'filter-chip--active' : ''}`}
                  onClick={() => toggleCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="filter-group">
            <p className="filter-group__label">Колір стрічки</p>
            <div className="filter-group__colors">
              {ALL_COLORS.map(color => (
                <button
                  key={color}
                  className={`color-chip ${activeColors.includes(color) ? 'color-chip--active' : ''}`}
                  style={{ background: COLOR_HEX[color] }}
                  title={COLOR_LABELS[color]}
                  onClick={() => toggleColor(color)}
                />
              ))}
            </div>
          </div>

          {/* New only */}
          <div className="filter-group">
            <p className="filter-group__label">Інше</p>
            <button
              className={`filter-chip ${onlyNew ? 'filter-chip--active' : ''}`}
              onClick={() => setOnlyNew(v => !v)}
            >
              Тільки новинки
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="catalog-main">

          {/* Toolbar */}
          <div className="catalog-toolbar">
            <span className="catalog-toolbar__count">
              {loading
                ? 'Завантаження...'
                : `${filtered.length} товар${filtered.length === 1 ? '' : filtered.length < 5 ? 'и' : 'ів'}`
              }
            </span>
            <Select
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
              className="catalog-toolbar__sort"
              popupMatchSelectWidth={false}
            />
          </div>

          {/* Active filter tags */}
          {hasFilters && (
            <div className="catalog-active-filters">
              {activeCategoryIds.map(id => {
                const cat = categories.find(c => c.id === id)
                return cat ? (
                  <Tag
                    key={id}
                    closable
                    onClose={() => toggleCategory(id)}
                    className="active-filter-tag"
                  >
                    {cat.name}
                  </Tag>
                ) : null
              })}
              {activeColors.map(color => (
                <Tag
                  key={color}
                  closable
                  onClose={() => toggleColor(color)}
                  className="active-filter-tag"
                >
                  {COLOR_LABELS[color]}
                </Tag>
              ))}
              {onlyNew && (
                <Tag closable onClose={() => setOnlyNew(false)} className="active-filter-tag">
                  Новинки
                </Tag>
              )}
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length === 0 ? (
            <div className="catalog-empty">
              <p className="catalog-empty__text">Нічого не знайдено</p>
              <button className="catalog-empty__reset" onClick={clearFilters}>
                Скинути фільтри
              </button>
            </div>
          ) : (
            <motion.div layout className="catalog-grid">
              <AnimatePresence mode="popLayout">
                {filtered.map(product => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="product-card"
                  >
                    <Link to={`/catalog/${product.id}`} className="product-card__link">
                      {/* Photo area */}
                      <div
                        className="product-card__photo"
                        style={
                          product.imageUrl
                            ? { backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                            : { background: product.color ? COLOR_HEX[product.color] : 'linear-gradient(135deg, #ec4899, #4f46e5)' }
                        }
                      >
                        <div className="product-card__badges">
                          {product.popular && (
                            <span className="product-badge product-badge--popular">Популярне</span>
                          )}
                          {product.isNew && (
                            <span className="product-badge product-badge--new">Нове</span>
                          )}
                        </div>
                      </div>

                      <div className="product-card__body">
                        <h3 className="product-card__name">{product.name}</h3>
                      </div>
                    </Link>

                    <div className="product-card__footer">
                      <span className="product-card__price">від {product.price} грн</span>
                      <Link to={`/catalog/${product.id}`}>
                        <Button className="product-card__btn">
                          Детальніше
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
