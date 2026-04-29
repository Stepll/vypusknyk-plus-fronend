import { useState, useEffect } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Input, Button, Tag } from 'antd'
import { api } from '../../api/client'
import RibbonEditorPreview from '../../components/ui/RibbonEditorPreview'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/RootStore'
import { getUserOrders } from '../../api/orders'
import { OrderResponse } from '../../api/types'
import { STATUS_LABEL, STATUS_COLOR, STATUS_STEPS, OrderStatus } from '../../constants/mockOrders'
import './Account.css'

type Tab = 'profile' | 'orders' | 'designs'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 12)
  if (digits.length <= 3) return '+' + digits
  if (digits.length <= 5) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3)
  if (digits.length <= 8) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5)
  if (digits.length <= 10) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8)
  return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 10) + ' ' + digits.slice(10, 12)
}

function OrderProgress({ status }: { status: string }) {
  const s = status as OrderStatus
  const activeIdx = STATUS_STEPS.indexOf(s)
  return (
    <div className="ac-order-progress">
      {STATUS_STEPS.map((step, i) => {
        const isActive = i <= activeIdx
        const color = isActive ? STATUS_COLOR[s] : '#e5e7eb'
        return (
          <div key={step} className="ac-order-progress__step">
            {i > 0 && (
              <div
                className="ac-order-progress__line"
                style={{ background: i <= activeIdx ? STATUS_COLOR[s] : '#e5e7eb' }}
              />
            )}
            <div className="ac-order-progress__dot-wrap">
              <div
                className={`ac-order-progress__dot ${isActive ? 'ac-order-progress__dot--active' : ''}`}
                style={isActive ? { background: color, boxShadow: `0 0 0 3px ${color}33` } : {}}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="ac-empty">
      <div className="ac-empty__icon">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="16" width="40" height="34" rx="6" stroke="#e5e7eb" strokeWidth="2.5" />
          <path d="M22 28h20M22 36h12" stroke="#e5e7eb" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="ac-empty__text">{text}</p>
    </div>
  )
}

const Account = observer(function Account() {
  const { auth, cart, toast } = useRootStore()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('profile')

  const [fullName, setFullName] = useState(auth.user?.fullName ?? '')
  const [phone, setPhone]       = useState(auth.user?.phone ?? '')
  const [profileErrors, setProfileErrors] = useState<{ fullName?: string }>({})

  const [sendingActivation, setSendingActivation] = useState(false)

  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors]   = useState<{ newPassword?: string; confirmPassword?: string }>({})

  const [orders, setOrders]           = useState<OrderResponse[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    setOrdersLoading(true)
    getUserOrders()
      .then(res => setOrders(res.items))
      .catch(() => {})
      .finally(() => setOrdersLoading(false))
  }, [])

  if (!auth.isLoggedIn) {
    return <Navigate to="/auth" replace />
  }

  async function handleSaveProfile() {
    await auth.updateProfile(fullName, phone)
    toast.show('Профіль оновлено')
  }

  async function handleChangePassword() {
    const e: typeof passwordErrors = {}
    if (!newPassword) e.newPassword = 'Введіть новий пароль'
    else if (newPassword.length < 6) e.newPassword = 'Мінімум 6 символів'
    if (!confirmPassword) e.confirmPassword = 'Підтвердіть пароль'
    else if (newPassword && confirmPassword !== newPassword) e.confirmPassword = 'Паролі не збігаються'
    if (Object.keys(e).length > 0) { setPasswordErrors(e); return }
    await auth.updatePassword(newPassword)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordErrors({})
    toast.show('Пароль змінено')
  }

  async function handleSendActivation() {
    setSendingActivation(true)
    try {
      await api.post('/api/v1/auth/resend-activation', {})
      toast.show('Лист активації надіслано на ' + auth.user!.email)
    } catch {
      toast.show('Не вдалося надіслати лист')
    } finally {
      setSendingActivation(false)
    }
  }

  function handleLogout() {
    auth.logout()
    navigate('/')
  }

  return (
    <div className="ac-page">
      <div className="ac-top-band">
        <div className="ac-container">
          <nav className="ac-breadcrumbs">
            <Link to="/" className="ac-breadcrumbs__link">Головна</Link>
            <span className="ac-breadcrumbs__sep">/</span>
            <span className="ac-breadcrumbs__current">Особистий кабінет</span>
          </nav>
        </div>
      </div>

      <div className="ac-container">
        <div className="ac-inner">

          <div className="ac-header">
            <div className="ac-avatar">
              {(auth.user!.fullName || auth.user!.name).slice(0, 1).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p className="ac-header__name">{auth.user!.fullName || auth.user!.name}</p>
              <p className="ac-header__email">{auth.user!.email}</p>
            </div>
            <div style={{ flexShrink: 0 }}>
              {auth.user!.isEmailVerified ? (
                <Tag color="success" style={{ fontSize: 13, padding: '3px 10px' }}>Активовано</Tag>
              ) : (
                <Button
                  size="small"
                  loading={sendingActivation}
                  onClick={handleSendActivation}
                  style={{ fontSize: 13 }}
                >
                  Надіслати лист активації
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="ac-tabs">
            <button
              className={`ac-tabs__btn ${tab === 'profile' ? 'ac-tabs__btn--active' : ''}`}
              onClick={() => setTab('profile')}
            >
              Профіль
            </button>
            <button
              className={`ac-tabs__btn ${tab === 'orders' ? 'ac-tabs__btn--active' : ''}`}
              onClick={() => setTab('orders')}
            >
              Замовлення
            </button>
            <button
              className={`ac-tabs__btn ${tab === 'designs' ? 'ac-tabs__btn--active' : ''}`}
              onClick={() => setTab('designs')}
            >
              Збережені дизайни
            </button>
          </div>

          {/* Profile tab */}
          {tab === 'profile' && (
            <div className="ac-profile">

              <div className="ac-section">
                <h2 className="ac-section__title">Основні дані</h2>

                <div className="ac-field">
                  <label className="ac-label">ПІБ</label>
                  <Input
                    value={fullName}
                    onChange={e => { setFullName(e.target.value); setProfileErrors({}) }}
                    placeholder="Прізвище Ім'я По батькові"
                    size="large"
                    status={profileErrors.fullName ? 'error' : undefined}
                  />
                  {profileErrors.fullName && <span className="ac-error">{profileErrors.fullName}</span>}
                </div>

                <div className="ac-field">
                  <label className="ac-label">Телефон</label>
                  <Input
                    value={phone}
                    onChange={e => setPhone(formatPhone(e.target.value))}
                    placeholder="+380 XX XXX XX XX"
                    size="large"
                  />
                </div>

                <div className="ac-field">
                  <label className="ac-label">Email</label>
                  <Input value={auth.user!.email} disabled size="large" />
                </div>

                <Button
                  type="primary"
                  className="ac-save-btn"
                  onClick={handleSaveProfile}
                  loading={auth.loading}
                >
                  Зберегти зміни
                </Button>
              </div>

              <div className="ac-section ac-section--password">
                <h2 className="ac-section__title">Зміна паролю</h2>

                <div className="ac-field">
                  <label className="ac-label">Новий пароль</label>
                  <Input.Password
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setPasswordErrors(prev => { const n = { ...prev }; delete n.newPassword; return n }) }}
                    placeholder="Мінімум 6 символів"
                    size="large"
                    status={passwordErrors.newPassword ? 'error' : undefined}
                  />
                  {passwordErrors.newPassword && <span className="ac-error">{passwordErrors.newPassword}</span>}
                </div>

                <div className="ac-field">
                  <label className="ac-label">Підтвердження паролю</label>
                  <Input.Password
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setPasswordErrors(prev => { const n = { ...prev }; delete n.confirmPassword; return n }) }}
                    placeholder="Повторіть новий пароль"
                    size="large"
                    status={passwordErrors.confirmPassword ? 'error' : undefined}
                  />
                  {passwordErrors.confirmPassword && <span className="ac-error">{passwordErrors.confirmPassword}</span>}
                </div>

                <Button
                  className="ac-password-btn"
                  onClick={handleChangePassword}
                  loading={auth.loading}
                >
                  Змінити пароль
                </Button>
              </div>

              <Button className="ac-logout-btn" onClick={handleLogout} danger>
                Вийти з акаунту
              </Button>
            </div>
          )}

          {tab === 'orders' && (
            <div className="ac-orders">
              {ordersLoading ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Завантаження...</p>
              ) : orders.length === 0 ? (
                <EmptyState text="Поки що тут немає замовлень" />
              ) : (
                orders.map(order => (
                  <div key={order.id} className="ac-order-card">
                    <div
                      className="ac-order-card__bar"
                      style={{ background: STATUS_COLOR[order.status as OrderStatus] ?? '#9ca3af' }}
                    />
                    <div className="ac-order-card__body">
                      <div className="ac-order-card__header">
                        <div className="ac-order-card__meta">
                          <span className="ac-order-card__number">{order.orderNumber}</span>
                          <span className="ac-order-card__date">{formatDate(order.date)}</span>
                        </div>
                        <OrderProgress status={order.status} />
                        <span
                          className="ac-order-card__status-text"
                          style={{ color: STATUS_COLOR[order.status as OrderStatus] ?? '#9ca3af' }}
                        >
                          {STATUS_LABEL[order.status as OrderStatus] ?? order.status}
                        </span>
                      </div>

                      <div className="ac-order-card__items">
                        {order.items.map((item, i) => (
                          <div key={i} className="ac-order-card__item">
                            <span className="ac-order-card__item-name">{item.name}</span>
                            <span className="ac-order-card__item-qty">{item.qty} шт × {item.price} грн</span>
                          </div>
                        ))}
                      </div>

                      <div className="ac-order-card__footer">
                        <span className="ac-order-card__total">{order.total} грн</span>
                        <button
                          className="ac-order-card__details-btn"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          Деталі
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'designs' && (
            auth.savedDesigns.length === 0
              ? <EmptyState text="Поки що тут немає збережених дизайнів" />
              : (
                <div className="ac-designs">
                  {auth.savedDesigns.map(design => (
                    <div key={design.id} className="ac-design-card">
                      <div className="ac-design-card__preview">
                        <RibbonEditorPreview
                          mainText={design.state.mainText}
                          school={design.state.school || undefined}
                          color={design.state.color}
                          textColor={design.state.textColor}
                          extraTextColor={design.state.extraTextColor}
                          font={design.state.font}
                          emblemKey={design.state.emblemKey}
                        />
                      </div>
                      <div className="ac-design-card__body">
                        <div className="ac-design-card__header">
                          <span className="ac-design-card__name">{design.designName}</span>
                          <span className="ac-design-card__date">{design.savedAt}</span>
                        </div>
                        <div className="ac-design-card__tags">
                          <span className="ac-design-card__tag">{design.state.color}</span>
                          <span className="ac-design-card__tag">{design.state.material}</span>
                          <span className="ac-design-card__tag">{design.state.printType}</span>
                        </div>
                        <div className="ac-design-card__actions">
                          <Button
                            type="primary"
                            className="ac-design-card__open-btn"
                            onClick={() => {
                              auth.loadDesign(design)
                              navigate('/constructor/ribbon')
                            }}
                          >
                            Відкрити
                          </Button>
                          <Button
                            className="ac-design-card__cart-btn"
                            onClick={() => {
                              cart.addItem({
                                productId: null,
                                productName: `Стрічка: ${design.designName}`,
                                productCategory: 'ribbon',
                                basePrice: 50,
                                qty: 1,
                                namesData: null,
                                ribbonCustomization: {
                                  mainText: design.state.mainText,
                                  school: design.state.school,
                                  comment: design.state.comment,
                                  printType: design.state.printType,
                                  color: design.state.color,
                                  material: design.state.material,
                                  textColor: design.state.textColor,
                                  extraTextColor: design.state.extraTextColor,
                                  font: design.state.font,
                                  emblemKey: design.state.emblemKey,
                                  designName: design.designName,
                                },
                              })
                              toast.show(`"${design.designName}" додано до кошика`)
                            }}
                          >
                            В кошик
                          </Button>
                          <button
                            className="ac-design-card__remove-btn"
                            onClick={() => auth.removeDesign(design.id)}
                            aria-label="Видалити дизайн"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
          )}

        </div>
      </div>
    </div>
  )
})

export default Account
