import { Link, useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/RootStore'
import { cartItemTotal, CartItem } from '../../stores/CartStore'
import { countNames } from '../../components/ui/NamesDrawer'
import './Cart.css'

const NAMED_PRICE_EXTRA = 20

const COLOR_LABELS: Record<string, string> = {
  'blue-yellow': 'Синьо-жовтий', blue: 'Синій', red: 'Червоний', white: 'Білий',
  burgundy: 'Бордовий', ivory: 'Айворі', gold: 'Золотий', silver: 'Срібний',
}
const MATERIAL_LABELS: Record<string, string> = { atlas: 'Атлас', silk: 'Шовк', satin: 'Сатин' }
const PRINT_LABELS: Record<string, string> = { foil: 'Фольга', film: 'Плівка', '3d': '3Д' }

function ItemPriceBreakdown({ item }: { item: CartItem }) {
  if (!item.namesData) {
    return (
      <p className="cart-item__breakdown">
        {item.qty} шт × {item.basePrice} грн
      </p>
    )
  }

  const namedCount = countNames(item.namesData.groups)
  const named = Math.min(namedCount, item.qty)
  const regular = item.qty - named

  return (
    <div className="cart-item__breakdown">
      {named > 0 && (
        <span>
          {named} іменних × {item.basePrice + NAMED_PRICE_EXTRA} грн
        </span>
      )}
      {regular > 0 && (
        <span>{regular} × {item.basePrice} грн</span>
      )}
    </div>
  )
}

function NamesDetails({ item }: { item: CartItem }) {
  if (!item.namesData) return null
  const { school, groups } = item.namesData
  const hasContent = school.trim() !== '' || groups.some(g => g.names.trim() !== '')
  if (!hasContent) return null

  return (
    <div className="cart-item__names">
      {school.trim() !== '' && (
        <p className="cart-item__names-school">{school}</p>
      )}
      {groups.map((g, i) => {
        const lines = g.names.split('\n').filter(l => l.trim() !== '')
        if (lines.length === 0) return null
        return (
          <div key={i} className="cart-item__names-group">
            {g.className.trim() !== '' && (
              <span className="cart-item__names-class">{g.className}</span>
            )}
            <ul className="cart-item__names-list">
              {lines.map((name, j) => (
                <li key={j}>{name}</li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

const Cart = observer(function Cart() {
  const { cart } = useRootStore()
  const navigate = useNavigate()

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-top-band">
          <div className="cart-page__container">
            <nav className="cart-breadcrumbs">
              <Link to="/" className="cart-breadcrumbs__link">Головна</Link>
              <span className="cart-breadcrumbs__sep">/</span>
              <span className="cart-breadcrumbs__current">Корзина</span>
            </nav>
          </div>
        </div>
        <div className="cart-page__container">
          <div className="cart-empty">
            <div className="cart-empty__illustration">
              <svg viewBox="0 0 240 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Bag body */}
                <rect x="40" y="80" width="160" height="110" rx="18" fill="#f3f4f6" />
                <rect x="40" y="80" width="160" height="110" rx="18" stroke="#e5e7eb" strokeWidth="2" />
                {/* Bag handle */}
                <path d="M85 80 C85 50 155 50 155 80" stroke="#d1d5db" strokeWidth="6" strokeLinecap="round" fill="none" />
                {/* Ribbon on bag */}
                <rect x="100" y="118" width="40" height="12" rx="4" fill="#fce7f3" />
                <rect x="116" y="108" width="8" height="32" rx="4" fill="#fce7f3" />
                {/* Little star decorations */}
                <path d="M30 55 L32 49 L34 55 L40 55 L35 59 L37 65 L32 61 L27 65 L29 59 L24 55 Z" fill="#ede9fe" />
                <path d="M195 42 L196.5 38 L198 42 L202 42 L199 44.5 L200 48.5 L196.5 46 L193 48.5 L194 44.5 L191 42 Z" fill="#fce7f3" />
                <circle cx="208" cy="72" r="5" fill="#ede9fe" opacity="0.7" />
                <circle cx="28" cy="100" r="4" fill="#fce7f3" opacity="0.6" />
                {/* Dashed lines suggesting empty */}
                <line x1="72" y1="130" x2="100" y2="130" stroke="#e5e7eb" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 5" />
                <line x1="140" y1="130" x2="168" y2="130" stroke="#e5e7eb" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 5" />
                <line x1="72" y1="152" x2="168" y2="152" stroke="#e5e7eb" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 5" />
                <line x1="90" y1="170" x2="150" y2="170" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 5" />
              </svg>
            </div>
            <h2 className="cart-empty__title">Корзина порожня</h2>
            <p className="cart-empty__text">Додайте товари зі каталогу, щоб оформити замовлення</p>
            <Link to="/catalog">
              <Button type="primary" className="cart-empty__btn">Перейти до каталогу</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-top-band">
        <div className="cart-page__container">
          <nav className="cart-breadcrumbs">
            <Link to="/" className="cart-breadcrumbs__link">Головна</Link>
            <span className="cart-breadcrumbs__sep">/</span>
            <span className="cart-breadcrumbs__current">Корзина</span>
          </nav>
        </div>
      </div>

      <div className="cart-page__container">
        <div className="cart-layout">

          {/* Items */}
          <div className="cart-items">
            <h1 className="cart-title">
              Корзина
              <span className="cart-title__count">{cart.totalQty} шт</span>
            </h1>

            {cart.items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item__color-bar" />

                <div className="cart-item__body">
                  <div className="cart-item__header">
                    <div>
                      <h3 className="cart-item__name">{item.productName}</h3>
                      <ItemPriceBreakdown item={item} />
                    </div>
                    <button
                      className="cart-item__remove"
                      onClick={() => cart.removeItem(item.id)}
                      aria-label="Видалити"
                    >
                      ×
                    </button>
                  </div>

                  {item.ribbonCustomization && (
                    <div className="cart-item__ribbon-params">
                      <div className="cart-item__ribbon-params-row">
                        <span className="cart-item__ribbon-params-label">Колір:</span>
                        <span>{COLOR_LABELS[item.ribbonCustomization.color] ?? item.ribbonCustomization.color}</span>
                      </div>
                      <div className="cart-item__ribbon-params-row">
                        <span className="cart-item__ribbon-params-label">Матеріал:</span>
                        <span>{MATERIAL_LABELS[item.ribbonCustomization.material] ?? item.ribbonCustomization.material}</span>
                      </div>
                      <div className="cart-item__ribbon-params-row">
                        <span className="cart-item__ribbon-params-label">Напис:</span>
                        <span>{PRINT_LABELS[item.ribbonCustomization.printType] ?? item.ribbonCustomization.printType}</span>
                      </div>
                      <div className="cart-item__ribbon-params-row">
                        <span className="cart-item__ribbon-params-label">Текст:</span>
                        <span>{item.ribbonCustomization.mainText}</span>
                      </div>
                      {item.ribbonCustomization.school && (
                        <div className="cart-item__ribbon-params-row">
                          <span className="cart-item__ribbon-params-label">Школа:</span>
                          <span>{item.ribbonCustomization.school}</span>
                        </div>
                      )}
                      {item.ribbonCustomization.comment && (
                        <div className="cart-item__ribbon-params-row">
                          <span className="cart-item__ribbon-params-label">Коментар:</span>
                          <span>{item.ribbonCustomization.comment}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <NamesDetails item={item} />

                  <div className="cart-item__footer">
                    <div className="cart-item__qty">
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => cart.updateQty(item.id, item.qty - 1)}
                        disabled={item.qty <= 1}
                      >
                        −
                      </button>
                      <span className="cart-item__qty-val">{item.qty}</span>
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => cart.updateQty(item.id, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="cart-item__total">{cartItemTotal(item)} грн</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h2 className="cart-summary__title">Разом</h2>

            <div className="cart-summary__rows">
              {cart.items.map(item => (
                <div key={item.id} className="cart-summary__item">
                  <div className="cart-summary__row">
                    <span className="cart-summary__row-name">{item.productName}</span>
                    <span className="cart-summary__row-price">{cartItemTotal(item)} грн</span>
                  </div>
                  <span className="cart-summary__row-qty">{item.qty} шт × {item.basePrice} грн</span>
                  {item.ribbonCustomization && (
                    <div className="cart-summary__ribbon-params">
                      <span>{COLOR_LABELS[item.ribbonCustomization.color] ?? item.ribbonCustomization.color}</span>
                      <span>{MATERIAL_LABELS[item.ribbonCustomization.material] ?? item.ribbonCustomization.material}</span>
                      <span>{PRINT_LABELS[item.ribbonCustomization.printType] ?? item.ribbonCustomization.printType}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="cart-summary__divider" />

            <div className="cart-summary__total">
              <span>До сплати</span>
              <span className="cart-summary__total-value">{cart.totalPrice} грн</span>
            </div>

            <Button
              type="primary"
              className="cart-summary__order-btn"
              onClick={() => navigate('/checkout')}
            >
              Оформити замовлення
            </Button>

            <Link to="/catalog" className="cart-summary__continue">
              Продовжити покупки
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
})

export default Cart
