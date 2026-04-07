import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/RootStore'
import './CartToast.css'

const CartToast = observer(function CartToast() {
  const { toast } = useRootStore()

  if (toast.messages.length === 0) return null

  return (
    <div className="cart-toast-container">
      {toast.messages.map(msg => (
        <div key={msg.id} className="cart-toast">
          <span className="cart-toast__icon">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 10.5 L8.5 13 L14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="cart-toast__text">{msg.text}</span>
          <button className="cart-toast__close" onClick={() => toast.dismiss(msg.id)} aria-label="Закрити">
            ×
          </button>
        </div>
      ))}
    </div>
  )
})

export default CartToast
