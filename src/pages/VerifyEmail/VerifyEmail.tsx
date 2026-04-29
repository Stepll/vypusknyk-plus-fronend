import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { motion } from 'framer-motion'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

type Status = 'loading' | 'success' | 'error'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) { setStatus('error'); return }

    fetch(`${BASE_URL}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(res => {
        if (res.ok) setStatus('success')
        else setStatus('error')
      })
      .catch(() => setStatus('error'))
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <p style={{ fontSize: 16 }}>Перевіряємо посилання...</p>
        </div>
      </div>
    )
  }

  const isSuccess = status === 'success'

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '48px 40px',
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
        }}
      >
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 24 }}
        >
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 72, height: 72, margin: '0 auto' }}>
            {isSuccess ? (
              <>
                <circle cx="32" cy="32" r="30" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
                <path d="M20 33 L28 41 L44 23" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </>
            ) : (
              <>
                <circle cx="32" cy="32" r="30" fill="#fff1f0" stroke="#ef4444" strokeWidth="2" />
                <path d="M22 22 L42 42 M42 22 L22 42" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.3 }}
          style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}
        >
          {isSuccess ? 'Email підтверджено!' : 'Посилання недійсне'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.3 }}
          style={{ color: '#8c8c8c', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}
        >
          {isSuccess
            ? 'Ваш акаунт успішно активовано. Тепер ви можете користуватись усіма функціями.'
            : 'Посилання для підтвердження застаріло або вже було використано. Зверніться до підтримки або спробуйте отримати новий лист.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {isSuccess ? (
            <>
              <Button type="primary" size="large" onClick={() => navigate('/account')} block>
                Мій акаунт
              </Button>
              <Button size="large" onClick={() => navigate('/')} block>
                На головну
              </Button>
            </>
          ) : (
            <Button type="primary" size="large" onClick={() => navigate('/')} block>
              На головну
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
