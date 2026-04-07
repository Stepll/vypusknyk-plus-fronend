import { useState } from 'react'
import { Link, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { motion, AnimatePresence } from 'framer-motion'
import './OrderSuccess.css'

export default function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const orderNumber = (location.state as { orderNumber?: string })?.orderNumber

  const [exiting, setExiting] = useState(false)

  if (!orderNumber) {
    return <Navigate to="/" replace />
  }

  function handleNavigate(to: string) {
    setExiting(true)
    setTimeout(() => navigate(to), 320)
  }

  return (
    <div className="os-page">
      <AnimatePresence>
        {!exiting && (
          <motion.div
            className="os-card"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="os-icon"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
                <path
                  d="M20 33 L28 41 L44 23"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </motion.div>

            <motion.h1
              className="os-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              Замовлення прийнято!
            </motion.h1>

            <motion.p
              className="os-order-number"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32, duration: 0.3 }}
            >
              {orderNumber}
            </motion.p>

            <motion.p
              className="os-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38, duration: 0.3 }}
            >
              Ми зв'яжемось з вами найближчим часом для підтвердження
            </motion.p>

            <motion.div
              className="os-actions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.3 }}
            >
              <Button type="primary" className="os-btn os-btn--primary" onClick={() => handleNavigate('/')}>
                На головну
              </Button>
              <Button className="os-btn os-btn--secondary" onClick={() => handleNavigate('/catalog')}>
                Повернутись до каталогу
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
