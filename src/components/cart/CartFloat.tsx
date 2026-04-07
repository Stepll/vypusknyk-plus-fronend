import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react-lite'
import { motion, AnimatePresence } from 'framer-motion'
import { useRootStore } from '../../stores/RootStore'
import { cartItemTotal } from '../../stores/CartStore'
import './CartFloat.css'

const CartFloat = observer(function CartFloat() {
  const { cart } = useRootStore()
  const location = useLocation()
  const [popupOpen, setPopupOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const onCartPage = location.pathname === '/cart'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPopupOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (onCartPage || cart.totalQty === 0) return null

  const qtyLabel = cart.totalQty === 1
    ? '1 товар'
    : cart.totalQty < 5
      ? `${cart.totalQty} товари`
      : `${cart.totalQty} товарів`

  return (
    <div className="cart-float" ref={ref}>
      <motion.button
        className="cart-float__btn"
        onClick={() => setPopupOpen(v => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Відкрити корзину"
        animate={{ width: hovered ? 156 : 52 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <ShoppingCartOutlined className="cart-float__icon" />
        <AnimatePresence>
          {hovered && (
            <motion.span
              className="cart-float__label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
            >
              {qtyLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {popupOpen && (
          <motion.div
            className="cart-float__popup"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <p className="cart-float__popup-title">Корзина</p>
            <ul className="cart-float__list">
              {cart.items.map(item => (
                <li key={item.id} className="cart-float__item">
                  <span className="cart-float__item-name">{item.productName}</span>
                  <span className="cart-float__item-qty">{item.qty} шт</span>
                  <span className="cart-float__item-price">{cartItemTotal(item)} грн</span>
                </li>
              ))}
            </ul>
            <div className="cart-float__total">
              <span>Разом</span>
              <span className="cart-float__total-value">{cart.totalPrice} грн</span>
            </div>
            <Link to="/cart" className="cart-float__go-btn" onClick={() => setPopupOpen(false)}>
              Перейти до корзини
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default CartFloat
