import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Input, Button } from 'antd'
import { motion, AnimatePresence } from 'framer-motion'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/RootStore'
import './Auth.css'

type Mode = 'login' | 'register'

interface FormState {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

const Auth = observer(function Auth() {
  const { auth, toast } = useRootStore()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState<FormState>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})

  function set(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  function switchMode(next: Mode) {
    setMode(next)
    setForm({ email: '', password: '' })
    setErrors({})
  }

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!validateEmail(form.email)) e.email = 'Введіть коректний email'
    if (form.password.length < 6) e.password = 'Пароль — мінімум 6 символів'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    if (mode === 'login') {
      await auth.login(form.email, form.password)
      toast.show('Ви увійшли до акаунту')
    } else {
      await auth.register(form.email, form.password)
      toast.show('Акаунт створено')
    }
    navigate('/')
  }

  function handleGoogle() {
    toast.show('Google авторизація — незабаром')
  }

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/" className="auth-logo">Випускник +</Link>

        {/* Mode toggle */}
        <div className="auth-toggle">
          <button
            className={`auth-toggle__btn ${mode === 'login' ? 'auth-toggle__btn--active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Вхід
          </button>
          <button
            className={`auth-toggle__btn ${mode === 'register' ? 'auth-toggle__btn--active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Реєстрація
          </button>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            className="auth-form"
            initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 16 : -16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <Input
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="email@example.com"
                size="large"
                status={errors.email ? 'error' : undefined}
                onPressEnter={handleSubmit}
              />
              {errors.email && <span className="auth-error">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Пароль</label>
                {mode === 'login' && (
                  <Link to="/forgot-password" className="auth-forgot">Забули пароль?</Link>
                )}
              </div>
              <Input.Password
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Мінімум 6 символів"
                size="large"
                status={errors.password ? 'error' : undefined}
                onPressEnter={handleSubmit}
              />
              {errors.password && <span className="auth-error">{errors.password}</span>}
            </div>

            <Button
              type="primary"
              className="auth-submit-btn"
              onClick={handleSubmit}
              loading={auth.loading}
            >
              {mode === 'login' ? 'Увійти' : 'Зареєструватись'}
            </Button>

            <div className="auth-divider">
              <span className="auth-divider__line" />
              <span className="auth-divider__text">або</span>
              <span className="auth-divider__line" />
            </div>

            <button className="auth-google-btn" onClick={handleGoogle}>
              <GoogleIcon />
              Продовжити з Google
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
})

export default Auth
