import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button, Input } from 'antd'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/RootStore'
import { cartItemTotal } from '../../stores/CartStore'
import { createOrder } from '../../api/orders'
import { getGuestToken } from '../../api/guest'
import './Checkout.css'

// ─── Types ───────────────────────────────────────────────────────────────────

type Delivery = 'nova-poshta' | 'ukrposhta'
type Payment  = 'cod' | 'online'

interface CheckoutForm {
  fullName:   string
  phone:      string
  email:      string
  delivery:   Delivery
  city:       string
  warehouse:  string
  postalCode: string
  payment:    Payment
  comment:    string
}

type FormErrors = Partial<Record<keyof CheckoutForm, string>>

const INITIAL: CheckoutForm = {
  fullName:   '',
  phone:      '+380',
  email:      '',
  delivery:   'nova-poshta',
  city:       '',
  warehouse:  '',
  postalCode: '',
  payment:    'cod',
  comment:    '',
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

function validate(f: CheckoutForm): FormErrors {
  const e: FormErrors = {}
  if (!f.fullName.trim()) e.fullName = "Вкажіть ПІБ"
  const digits = phoneDigits(f.phone)
  if (digits.length < 12) e.phone = "Вкажіть повний номер телефону"
  if (f.delivery === 'nova-poshta') {
    if (!f.city.trim()) e.city = "Вкажіть місто"
    if (!f.warehouse.trim()) e.warehouse = "Вкажіть відділення або поштомат"
  }
  if (f.delivery === 'ukrposhta') {
    if (!/^\d{5}$/.test(f.postalCode.trim())) e.postalCode = "Вкажіть 5-значний індекс"
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

const Checkout = observer(function Checkout() {
  const { cart, auth, toast } = useRootStore()
  const navigate = useNavigate()

  const [form, setForm] = useState<CheckoutForm>(() => ({
    ...INITIAL,
    fullName: auth.user?.fullName ?? '',
    phone: auth.user?.phone ?? '+380',
    email: auth.user?.email ?? '',
  }))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (cart.items.length === 0 && !submitted) {
    return <Navigate to="/cart" replace />
  }

  function set<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  async function handleSubmit() {
    const e = validate(form)
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
        })),
        delivery: {
          method: form.delivery,
          city: form.delivery === 'nova-poshta' ? form.city : undefined,
          warehouse: form.delivery === 'nova-poshta' ? form.warehouse : undefined,
          postalCode: form.delivery === 'ukrposhta' ? form.postalCode : undefined,
        },
        recipient: {
          fullName: form.fullName,
          phone: '+' + phoneDigits(form.phone),
        },
        payment: form.payment,
        email: form.email || undefined,
        comment: form.comment || undefined,
        guestToken: auth.isLoggedIn ? undefined : getGuestToken(),
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
                <button
                  className={`co-delivery-card ${form.delivery === 'nova-poshta' ? 'co-delivery-card--active' : ''}`}
                  onClick={() => set('delivery', 'nova-poshta')}
                >
                  <span className="co-delivery-card__radio" />
                  <span className="co-delivery-card__label">Нова Пошта</span>
                </button>
                <button
                  className={`co-delivery-card ${form.delivery === 'ukrposhta' ? 'co-delivery-card--active' : ''}`}
                  onClick={() => set('delivery', 'ukrposhta')}
                >
                  <span className="co-delivery-card__radio" />
                  <span className="co-delivery-card__label">Укрпошта</span>
                </button>
              </div>

              {form.delivery === 'nova-poshta' && (
                <>
                  <div className="co-field">
                    <label className="co-label">Місто *</label>
                    <Input
                      value={form.city}
                      onChange={e => set('city', e.target.value)}
                      placeholder="Введіть назву міста"
                      size="large"
                      status={errors.city ? 'error' : undefined}
                    />
                    {errors.city && <span className="co-error">{errors.city}</span>}
                  </div>
                  <div className="co-field">
                    <label className="co-label">Відділення або поштомат *</label>
                    <Input
                      value={form.warehouse}
                      onChange={e => set('warehouse', e.target.value)}
                      placeholder="Номер відділення або поштомату"
                      size="large"
                      status={errors.warehouse ? 'error' : undefined}
                    />
                    {errors.warehouse && <span className="co-error">{errors.warehouse}</span>}
                  </div>
                </>
              )}

              {form.delivery === 'ukrposhta' && (
                <div className="co-field">
                  <label className="co-label">Поштовий індекс *</label>
                  <Input
                    value={form.postalCode}
                    onChange={e => set('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="01001"
                    size="large"
                    status={errors.postalCode ? 'error' : undefined}
                  />
                  {errors.postalCode && <span className="co-error">{errors.postalCode}</span>}
                </div>
              )}
            </div>

            {/* Section 3: Payment */}
            <div className="co-section">
              <h2 className="co-section__title">Оплата</h2>
              <div className="co-delivery-options">
                <button
                  className={`co-delivery-card ${form.payment === 'cod' ? 'co-delivery-card--active' : ''}`}
                  onClick={() => set('payment', 'cod')}
                >
                  <span className="co-delivery-card__radio" />
                  <span className="co-delivery-card__label">Оплата при отриманні</span>
                </button>
                <button
                  className="co-delivery-card co-delivery-card--disabled"
                  disabled
                >
                  <span className="co-delivery-card__radio" />
                  <div>
                    <span className="co-delivery-card__label">Онлайн оплата</span>
                    <span className="co-delivery-card__badge">Незабаром</span>
                  </div>
                </button>
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

            <div className="co-sidebar__divider" />

            <div className="co-sidebar__total">
              <span>До сплати</span>
              <span className="co-sidebar__total-value">{cart.totalPrice} грн</span>
            </div>

            <Button
              type="primary"
              className="co-sidebar__submit-btn"
              onClick={handleSubmit}
              loading={submitting}
            >
              Підтвердити замовлення
            </Button>

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
