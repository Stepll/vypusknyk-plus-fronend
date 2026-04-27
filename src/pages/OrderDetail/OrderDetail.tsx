import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getOrder } from '../../api/orders'
import { getOrderStatuses } from '../../api/order-statuses'
import type { OrderResponse, OrderStatusResponse } from '../../api/types'
import './OrderDetail.css'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })
}

function OrderProgress({ status, statuses }: { status: string; statuses: OrderStatusResponse[] }) {
  const current = statuses.find(s => s.name === status)
  const activeStep = current?.sortOrder ?? 0
  const color = current?.color ?? '#e5e7eb'

  return (
    <div className="od-progress">
      {statuses.map((s, i) => {
        const isActive = s.sortOrder <= activeStep
        const dotColor = isActive ? color : '#e5e7eb'
        return (
          <div key={s.id} className="od-progress__step">
            {i > 0 && (
              <div className="od-progress__line" style={{ background: dotColor }} />
            )}
            <div className="od-progress__dot-wrap">
              <div
                className="od-progress__dot"
                style={isActive
                  ? { background: dotColor, boxShadow: `0 0 0 3px ${dotColor}33` }
                  : { background: '#e5e7eb' }
                }
              />
              <span className="od-progress__label" style={{ color: isActive ? color : '#9ca3af' }}>
                {s.name}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [statuses, setStatuses] = useState<OrderStatusResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { navigate('/account', { replace: true }); return }
    Promise.all([getOrder(id), getOrderStatuses()])
      .then(([o, s]) => { setOrder(o); setStatuses(s) })
      .catch(() => navigate('/account', { replace: true }))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading || !order) return null

  const DELIVERY_LABEL = order.delivery.method === 'nova-poshta' ? 'Нова Пошта' : 'Укрпошта'
  const deliveryAddress = order.delivery.method === 'nova-poshta'
    ? `${order.delivery.city}, ${order.delivery.warehouse}`
    : `Індекс ${order.delivery.postalCode}`

  return (
    <div className="od-page">
      <div className="od-top-band">
        <div className="od-container">
          <nav className="od-breadcrumbs">
            <Link to="/" className="od-breadcrumbs__link">Головна</Link>
            <span className="od-breadcrumbs__sep">/</span>
            <Link to="/account" className="od-breadcrumbs__link">Кабінет</Link>
            <span className="od-breadcrumbs__sep">/</span>
            <span className="od-breadcrumbs__current">{order.orderNumber}</span>
          </nav>
        </div>
      </div>

      <div className="od-container">
        <div className="od-inner">

          {/* Header */}
          <div className="od-header">
            <div>
              <h1 className="od-title">{order.orderNumber}</h1>
              <span className="od-date">{formatDate(order.date)}</span>
            </div>
            <span className="od-status" style={{ color: statuses.find(s => s.name === order.status)?.color ?? '#9ca3af' }}>
              {order.status}
            </span>
          </div>

          {/* Progress */}
          <div className="od-section">
            <h2 className="od-section__title">Статус замовлення</h2>
            <OrderProgress status={order.status} statuses={statuses} />
          </div>

          {/* Items */}
          <div className="od-section">
            <h2 className="od-section__title">Склад замовлення</h2>
            <div className="od-items">
              {order.items.map((item, i) => (
                <div key={i} className="od-item">
                  <div className="od-item__color-bar" />
                  <div className="od-item__body">
                    <span className="od-item__name">{item.name}</span>
                    <div className="od-item__row">
                      <span className="od-item__qty">{item.qty} шт × {item.price} грн</span>
                      <span className="od-item__total">{(item.qty * item.price).toFixed(2)} грн</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="od-total-row">
              <span>Загальна сума</span>
              <span className="od-total-value">{order.total} грн</span>
            </div>
          </div>

          {/* Delivery + recipient */}
          <div className="od-section od-section--grid">
            <div>
              <h2 className="od-section__title">Доставка</h2>
              <div className="od-info-rows">
                <div className="od-info-row">
                  <span className="od-info-label">Служба</span>
                  <span>{DELIVERY_LABEL}</span>
                </div>
                <div className="od-info-row">
                  <span className="od-info-label">Адреса</span>
                  <span>{deliveryAddress}</span>
                </div>
                <div className="od-info-row">
                  <span className="od-info-label">Оплата</span>
                  <span>{order.payment === 'cod' ? 'При отриманні' : 'Онлайн'}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="od-section__title">Отримувач</h2>
              <div className="od-info-rows">
                <div className="od-info-row">
                  <span className="od-info-label">ПІБ</span>
                  <span>{order.recipient.fullName}</span>
                </div>
                <div className="od-info-row">
                  <span className="od-info-label">Телефон</span>
                  <span>{order.recipient.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          {order.comment && (
            <div className="od-section">
              <h2 className="od-section__title">Коментар</h2>
              <p className="od-comment">{order.comment}</p>
            </div>
          )}

          <Link to="/account" className="od-back-link">
            ← Назад до замовлень
          </Link>

        </div>
      </div>
    </div>
  )
}
