import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { getGuestOrders } from '../../api/guest'
import { useRootStore } from '../../stores/RootStore'
import { OrderResponse } from '../../api/types'
import { STATUS_LABEL, STATUS_COLOR } from '../../constants/mockOrders'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })
}

const GuestOrders = observer(function GuestOrders() {
  const { auth } = useRootStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (auth.isLoggedIn) {
      navigate('/account', { replace: true })
      return
    }
    getGuestOrders()
      .then(res => setOrders(res.items))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [auth.isLoggedIn, navigate])

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <section style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 60%, #1a1a2e 100%)',
        padding: '96px 24px 64px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#e91e8c', marginBottom: 16 }}>
            Замовлення
          </p>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: '#ffffff', letterSpacing: -1.5, margin: '0 0 16px', lineHeight: 1.1 }}>
            Мої замовлення
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>
            Замовлення з цього пристрою.{' '}
            <Link to="/auth" style={{ color: '#e91e8c' }}>Увійдіть</Link>, щоб бачити всі замовлення та зберегти їх в акаунті.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 16px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '60px 0' }}>
            Завантаження...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '60px 0' }}>
            <p style={{ fontSize: 18, marginBottom: 16 }}>Замовлень поки немає</p>
            <Link to="/catalog" style={{ color: '#e91e8c' }}>Перейти до каталогу</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div
                key={order.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '20px 24px',
                  background: '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{order.orderNumber}</span>
                    <span style={{ color: '#6b7280', fontSize: 14, marginLeft: 12 }}>{formatDate(order.date)}</span>
                  </div>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    background: `${STATUS_COLOR[order.status as keyof typeof STATUS_COLOR]}18`,
                    color: STATUS_COLOR[order.status as keyof typeof STATUS_COLOR] ?? '#6b7280',
                  }}>
                    {STATUS_LABEL[order.status as keyof typeof STATUS_LABEL] ?? order.status}
                  </span>
                </div>

                <div style={{ marginTop: 12, fontSize: 14, color: '#374151' }}>
                  {order.items.map((item, i) => (
                    <div key={i}>{item.name} × {item.qty}</div>
                  ))}
                </div>

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{order.total} грн</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
})

export default GuestOrders
