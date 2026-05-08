import { useState, useEffect, useRef } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button, Input } from 'antd'
import PeakSeasonBanner from '../../components/ui/PeakSeasonBanner'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/RootStore'
import { cartItemTotal } from '../../stores/CartStore'
import { createOrder } from '../../api/orders'
import { getGuestToken } from '../../api/guest'
import { getDeliveryMethods } from '../../api/delivery-methods'
import { getPaymentMethods } from '../../api/payment-methods'
import { getMyPromoCards, calculateDiscount } from '../../api/promotions'
import type { PromoCodeCardResponse, CalculateDiscountResponse } from '../../api/promotions'
import type { DeliveryMethodResponse, DeliveryCheckoutField, PaymentMethodResponse } from '../../api/types'
import './Checkout.css'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CheckoutForm {
  fullName:       string
  phone:          string
  email:          string
  deliverySlug:   string
  deliveryFields: Record<string, string>
  payment:        string
  comment:        string
}

type FormErrors = Partial<Record<string, string>>

const BASE_FORM: Omit<CheckoutForm, 'fullName' | 'phone' | 'email'> = {
  deliverySlug:   '',
  deliveryFields: {},
  payment:        '',
  comment:        '',
}

// ─── Phone mask ──────────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 12)
  if (digits.length <= 3) return '+' + digits
  if (digits.length <= 5) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3)
  if (digits.length <= 8) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5)
  if (digits.length <= 10) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8)
  return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 10) + ' ' + digits.slice(10, 12)
}

function phoneDigits(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validate(
  form: CheckoutForm,
  activeFields: DeliveryCheckoutField[],
): FormErrors {
  const e: FormErrors = {}
  if (!form.fullName.trim()) e.fullName = 'Вкажіть ПІБ'
  if (phoneDigits(form.phone).length < 12) e.phone = 'Вкажіть повний номер телефону'
  for (const field of activeFields) {
    if (field.required && !form.deliveryFields[field.key]?.trim()) {
      e[field.key] = `Вкажіть: ${field.label}`
    }
  }
  return e
}

// ─── Ribbon params label helper ──────────────────────────────────────────────

const COLOR_LABELS: Record<string, string> = {
  'blue-yellow': 'Синьо-жовтий', blue: 'Синій', red: 'Червоний', white: 'Білий',
  burgundy: 'Бордовий', ivory: 'Айворі', gold: 'Золотий', silver: 'Срібний',
}
const MATERIAL_LABELS: Record<string, string> = { atlas: 'Атлас', silk: 'Шовк', satin: 'Сатин' }
const PRINT_LABELS: Record<string, string> = { foil: 'Фольга', film: 'Плівка', '3d': '3Д' }

// ─── Component ───────────────────────────────────────────────────────────────

// ─── PromoCardSelect ─────────────────────────────────────────────────────────

function PromoCardSelect({
  cards, selectedId, onChange,
}: {
  cards: PromoCodeCardResponse[]
  selectedId: number | null
  onChange: (id: number | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = cards.find(c => c.id === selectedId) ?? null

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function discountLabel(card: PromoCodeCardResponse) {
    return card.discountType === 'Percentage' ? `−${card.discountValue}%` : `−${card.discountValue} ₴`
  }

  return (
    <div className="co-promo-select" ref={ref}>
      <label className="co-promo-select__label">Промокод</label>

      {/* Trigger */}
      <div className="co-promo-trigger" onClick={() => setOpen(v => !v)}>
        {selected ? (
          <div
            className="co-promo-trigger__card"
            style={{ '--ticket-color': selected.cardColor } as React.CSSProperties}
          >
            <span className="co-promo-trigger__name">{selected.displayName}</span>
            <span className="co-promo-trigger__discount">{discountLabel(selected)}</span>
          </div>
        ) : (
          <span className="co-promo-trigger__placeholder">Використати промокод</span>
        )}
        <svg
          className={`co-promo-trigger__arrow ${open ? 'co-promo-trigger__arrow--open' : ''}`}
          width="16" height="16" viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="co-promo-dropdown">
          {selected && (
            <button
              className="co-promo-dropdown__clear"
              onClick={() => { onChange(null); setOpen(false) }}
              type="button"
            >
              Не використовувати промокод
            </button>
          )}
          {cards.map(card => (
            <button
              key={card.id}
              className={`co-promo-ticket ${card.id === selectedId ? 'co-promo-ticket--selected' : ''}`}
              style={{ '--ticket-color': card.cardColor } as React.CSSProperties}
              onClick={() => { onChange(card.id); setOpen(false) }}
              type="button"
            >
              <div className="co-promo-ticket__left">
                <div className="co-promo-ticket__name">{card.displayName}</div>
                {card.minOrderAmount && (
                  <div className="co-promo-ticket__meta">від {card.minOrderAmount} ₴</div>
                )}
              </div>
              <div className="co-promo-ticket__discount">{discountLabel(card)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

const Checkout = observer(function Checkout() {
  const { cart, auth, toast, settings } = useRootStore()
  const navigate = useNavigate()

  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodResponse[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([])
  const [form, setForm] = useState<CheckoutForm>({
    ...BASE_FORM,
    fullName: auth.user?.fullName ?? '',
    phone:    auth.user?.phone ?? '+380',
    email:    auth.user?.email ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [myCards, setMyCards] = useState<PromoCodeCardResponse[]>([])
  const [selectedPromoCardId, setSelectedPromoCardId] = useState<number | null>(null)
  const [discountInfo, setDiscountInfo] = useState<CalculateDiscountResponse | null>(null)

  useEffect(() => {
    getDeliveryMethods().then(methods => {
      setDeliveryMethods(methods)
      if (methods.length > 0) {
        setForm(prev => ({ ...prev, deliverySlug: methods[0].slug, deliveryFields: {} }))
      }
    }).catch(() => {})

    getPaymentMethods().then(methods => {
      setPaymentMethods(methods)
      const first = methods.find(m => m.isEnabled)
      if (first) setForm(prev => ({ ...prev, payment: first.slug }))
    }).catch(() => {})

    if (auth.isLoggedIn) {
      getMyPromoCards().then(setMyCards).catch(() => {})
    }
  }, [auth.isLoggedIn])

  useEffect(() => {
    const cartItems = cart.items.map(i => ({
      productId: i.productId ?? null,
      qty: i.qty,
      unitPrice: cartItemTotal(i) / i.qty,
    }))
    calculateDiscount(cart.totalPrice, selectedPromoCardId ?? undefined, cartItems)
      .then(setDiscountInfo)
      .catch(() => setDiscountInfo(null))
  }, [cart.totalPrice, selectedPromoCardId])

  if (cart.items.length === 0 && !submitted) {
    return <Navigate to="/cart" replace />
  }

  const selectedMethod = deliveryMethods.find(m => m.slug === form.deliverySlug)
  const activeFields = selectedMethod?.checkoutFields.filter(f => f.isEnabled) ?? []

  function set<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key as string]) setErrors(prev => { const n = { ...prev }; delete n[key as string]; return n })
  }

  function setDelivery(slug: string) {
    setForm(prev => ({ ...prev, deliverySlug: slug, deliveryFields: {} }))
    setErrors({})
  }

  function setFieldValue(key: string, value: string) {
    setForm(prev => ({ ...prev, deliveryFields: { ...prev.deliveryFields, [key]: value } }))
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  async function handleSubmit() {
    const e = validate(form, activeFields)
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSubmitting(true)
    try {
      const order = await createOrder({
        items: cart.items.map(item => ({
          productId: item.productId,
          name: item.productName,
          qty: item.qty,
          price: cartItemTotal(item) / item.qty,
          namesData: item.namesData ?? undefined,
          ribbonCustomization: item.ribbonCustomization,
        })),
        delivery: {
          method:     form.deliverySlug,
          city:       form.deliveryFields['city'],
          warehouse:  form.deliveryFields['warehouse'],
          postalCode: form.deliveryFields['postalCode'],
        },
        recipient: {
          fullName: form.fullName,
          phone: '+' + phoneDigits(form.phone),
        },
        payment: form.payment,
        email:   form.email || undefined,
        comment: form.comment || undefined,
        guestToken: auth.isLoggedIn ? undefined : getGuestToken(),
        userPromoCardId: selectedPromoCardId ?? undefined,
      })
      setSubmitted(true)
      cart.clear()
      navigate('/order-success', { state: { orderNumber: order.orderNumber } })
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Помилка при оформленні замовлення')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="co-page">
      <PeakSeasonBanner />
      <div className="co-top-band">
        <div className="co-container">
          <nav className="co-breadcrumbs">
            <Link to="/" className="co-breadcrumbs__link">Головна</Link>
            <span className="co-breadcrumbs__sep">/</span>
            <Link to="/cart" className="co-breadcrumbs__link">Корзина</Link>
            <span className="co-breadcrumbs__sep">/</span>
            <span className="co-breadcrumbs__current">Оформлення</span>
          </nav>
        </div>
      </div>

      <div className="co-container">
        <div className="co-layout">

          {/* ── Form ── */}
          <div className="co-form">
            <h1 className="co-title">Оформлення замовлення</h1>

            {/* Section 1: Contact */}
            <div className="co-section">
              <h2 className="co-section__title">Контактні дані</h2>

              <div className="co-field">
                <label className="co-label">ПІБ *</label>
                <Input
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  placeholder="Прізвище Ім'я По батькові"
                  size="large"
                  status={errors.fullName ? 'error' : undefined}
                />
                {errors.fullName && <span className="co-error">{errors.fullName}</span>}
              </div>

              <div className="co-field">
                <label className="co-label">Телефон *</label>
                <Input
                  value={form.phone}
                  onChange={e => set('phone', formatPhone(e.target.value))}
                  placeholder="+380 XX XXX XX XX"
                  size="large"
                  status={errors.phone ? 'error' : undefined}
                />
                {errors.phone && <span className="co-error">{errors.phone}</span>}
              </div>

              <div className="co-field">
                <label className="co-label">Email</label>
                <Input
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="email@example.com"
                  size="large"
                />
              </div>
            </div>

            {/* Section 2: Delivery */}
            <div className="co-section">
              <h2 className="co-section__title">Доставка</h2>

              <div className="co-delivery-options">
                {deliveryMethods.map(m => (
                  <button
                    key={m.slug}
                    className={`co-delivery-card ${form.deliverySlug === m.slug ? 'co-delivery-card--active' : ''}`}
                    onClick={() => setDelivery(m.slug)}
                  >
                    <span className="co-delivery-card__radio" />
                    <span className="co-delivery-card__label">{m.name}</span>
                  </button>
                ))}
              </div>

              {activeFields.map(field => (
                <div key={field.key} className="co-field">
                  <label className="co-label">
                    {field.label}{field.required ? ' *' : ''}
                  </label>
                  <Input
                    value={form.deliveryFields[field.key] ?? ''}
                    onChange={e => setFieldValue(field.key, e.target.value)}
                    size="large"
                    status={errors[field.key] ? 'error' : undefined}
                  />
                  {errors[field.key] && <span className="co-error">{errors[field.key]}</span>}
                </div>
              ))}
            </div>

            {/* Section 3: Payment */}
            <div className="co-section">
              <h2 className="co-section__title">Оплата</h2>
              <div className="co-delivery-options">
                {paymentMethods.map(m => (
                  m.isEnabled ? (
                    <button
                      key={m.slug}
                      className={`co-delivery-card ${form.payment === m.slug ? 'co-delivery-card--active' : ''}`}
                      onClick={() => set('payment', m.slug)}
                    >
                      <span className="co-delivery-card__radio" />
                      <span className="co-delivery-card__label">{m.name}</span>
                    </button>
                  ) : (
                    <button key={m.slug} className="co-delivery-card co-delivery-card--disabled" disabled>
                      <span className="co-delivery-card__radio" />
                      <div>
                        <span className="co-delivery-card__label">{m.name}</span>
                        <span className="co-delivery-card__badge">Незабаром</span>
                      </div>
                    </button>
                  )
                ))}
              </div>
            </div>

            {/* Section 4: Comment */}
            <div className="co-section">
              <h2 className="co-section__title">Коментар</h2>
              <Input.TextArea
                value={form.comment}
                onChange={e => set('comment', e.target.value)}
                placeholder="Побажання до замовлення"
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="co-sidebar">
            <h2 className="co-sidebar__title">Ваше замовлення</h2>

            <div className="co-sidebar__items">
              {cart.items.map(item => (
                <div key={item.id} className="co-sidebar__item">
                  <div className="co-sidebar__item-header">
                    <span className="co-sidebar__item-name">{item.productName}</span>
                    <span className="co-sidebar__item-price">{cartItemTotal(item)} грн</span>
                  </div>
                  <span className="co-sidebar__item-qty">{item.qty} шт × {item.basePrice} грн</span>
                  {item.badgeCustomization && (
                    <div className="co-sidebar__ribbon-params">
                      <span>{item.badgeCustomization.sizeLabel}</span>
                      {item.badgeCustomization.topText && <span>{item.badgeCustomization.topText}</span>}
                      {item.badgeCustomization.bottomText && <span>{item.badgeCustomization.bottomText}</span>}
                    </div>
                  )}
                  {item.ribbonCustomization && (
                    <div className="co-sidebar__ribbon-params">
                      <span>{COLOR_LABELS[item.ribbonCustomization.color] ?? item.ribbonCustomization.color}</span>
                      <span>{MATERIAL_LABELS[item.ribbonCustomization.material] ?? item.ribbonCustomization.material}</span>
                      <span>{PRINT_LABELS[item.ribbonCustomization.printType] ?? item.ribbonCustomization.printType}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Promo card selector */}
            {auth.isLoggedIn && myCards.length > 0 && (
              <PromoCardSelect
                cards={myCards}
                selectedId={selectedPromoCardId}
                onChange={setSelectedPromoCardId}
              />
            )}

            <div className="co-sidebar__divider" />

            {/* Price breakdown */}
            <div className="co-sidebar__breakdown">
              <div className="co-sidebar__row">
                <span>Сума</span>
                <span>{cart.totalPrice} грн</span>
              </div>
              {discountInfo && discountInfo.promotionDiscount > 0 && (
                <div className="co-sidebar__row co-sidebar__row--discount">
                  <span>
                    Акція{discountInfo.appliedPromotion ? ` «${discountInfo.appliedPromotion.name}»` : ''}
                  </span>
                  <span>−{discountInfo.promotionDiscount} грн</span>
                </div>
              )}
              {discountInfo && discountInfo.promoCodeDiscount > 0 && (
                <div className="co-sidebar__row co-sidebar__row--discount">
                  <span>
                    {discountInfo.appliedPromoCode?.displayName ?? 'Промокод'}
                  </span>
                  <span>−{discountInfo.promoCodeDiscount} грн</span>
                </div>
              )}
            </div>

            <div className="co-sidebar__divider" />

            <div className="co-sidebar__total">
              <span>До сплати</span>
              <span className="co-sidebar__total-value">
                {discountInfo ? discountInfo.finalTotal : cart.totalPrice} грн
              </span>
            </div>

            {(() => {
              const minAmount = settings.getNumber('min_order_amount', 0)
              const finalTotal = discountInfo ? discountInfo.finalTotal : cart.totalPrice
              const belowMin = minAmount > 0 && finalTotal < minAmount
              return (
                <>
                  <Button
                    type="primary"
                    className="co-sidebar__submit-btn"
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={belowMin}
                  >
                    Підтвердити замовлення
                  </Button>
                  {belowMin && (
                    <p style={{ margin: '8px 0 0', fontSize: 13, color: '#ef4444', textAlign: 'center' }}>
                      Мінімальна сума замовлення — {minAmount} грн
                    </p>
                  )}
                </>
              )
            })()}

            {(() => {
              const isPeak = settings.getBool('peak_season_mode', false)
              const days = settings.getNumber(isPeak ? 'production_days_peak' : 'production_days', 7)
              return (
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                  Орієнтовний термін виготовлення: {days} робочих днів
                </p>
              )
            })()}

            <p className="co-sidebar__terms">
              Натискаючи, ви погоджуєтесь з <Link to="/terms">умовами використання</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
})

export default Checkout
