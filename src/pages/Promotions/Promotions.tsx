import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Button, Input, message } from 'antd'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/RootStore'
import {
  getPromotions, getMyPromoCards, activatePromoCode,
  type PublicPromotionResponse, type PromoCodeCardResponse,
} from '../../api/promotions'
import './Promotions.css'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconNoPromotions() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="18" width="44" height="26" rx="5" stroke="#d1d5db" strokeWidth="2" fill="#f9fafb"/>
      <path d="M6 26h44" stroke="#d1d5db" strokeWidth="2"/>
      <circle cx="40" cy="32" r="4" stroke="#e91e8c" strokeWidth="1.5" fill="none"/>
      <path d="M37.5 34.5l5-5" stroke="#e91e8c" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 31h14" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 36h8" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="44" cy="14" r="7" fill="#fdf2f8" stroke="#e91e8c" strokeWidth="1.5"/>
      <path d="M44 11v3.5l2 1.5" stroke="#e91e8c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconNoTickets() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 22a4 4 0 0 1 0-8h40a4 4 0 0 1 0 8v4a4 4 0 0 1 0 8H8a4 4 0 0 1 0-8v-4z" stroke="#d1d5db" strokeWidth="2" fill="#f9fafb"/>
      <line x1="22" y1="14" x2="22" y2="42" stroke="#d1d5db" strokeWidth="2" strokeDasharray="3 3"/>
      <path d="M28 24l2 2 4-4" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="42" cy="14" r="7" fill="#fdf2f8" stroke="#e91e8c" strokeWidth="1.5"/>
      <path d="M39.5 14h5M42 11.5v5" stroke="#e91e8c" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M39.8 16.2l4.4-4.4M44.2 16.2l-4.4-4.4" stroke="#e91e8c" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="22" width="28" height="20" rx="4" fill="#fdf2f8" stroke="#e91e8c" strokeWidth="2"/>
      <path d="M16 22v-6a8 8 0 1 1 16 0v6" stroke="#e91e8c" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="32" r="3" fill="#e91e8c"/>
      <path d="M24 35v4" stroke="#e91e8c" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDiscount(type: 'Percentage' | 'FixedAmount', value: number) {
  return type === 'Percentage' ? `−${value}%` : `−${value} ₴`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })
}

// ─── PromoTicket ──────────────────────────────────────────────────────────────

function PromoTicket({ card, index }: { card: PromoCodeCardResponse; index: number }) {
  const color = card.cardColor
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 400, damping: 30 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 400, damping: 30 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() {
    mx.set(0)
    my.set(0)
  }

  return (
    <div className="promo-ticket-wrap">
      <motion.div
        className="promo-ticket"
        style={{ '--ticket-color': color, rotateX, rotateY } as React.CSSProperties}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
      >
      <div className="promo-ticket__main">
        <div className="promo-ticket__brand">ВИПУСКНИК+</div>
        <div className="promo-ticket__circle promo-ticket__circle--tr" />
        <div className="promo-ticket__circle promo-ticket__circle--bl" />
        <div className="promo-ticket__name">{card.displayName}</div>
        <div className="promo-ticket__discount">
          {formatDiscount(card.discountType, card.discountValue)}
        </div>
        {card.description && (
          <div className="promo-ticket__desc">{card.description}</div>
        )}
      </div>
      <div className="promo-ticket__divider">
        <span className="promo-ticket__line" />
      </div>
      <div className="promo-ticket__footer">
        {card.minOrderAmount && (
          <span>від {card.minOrderAmount} ₴</span>
        )}
        {card.endsAt && (
          <span>до {formatDate(card.endsAt)}</span>
        )}
        {!card.minOrderAmount && !card.endsAt && (
          <span>Без обмежень</span>
        )}
      </div>
    </motion.div>
    </div>
  )
}

// ─── PromotionCard ────────────────────────────────────────────────────────────

function PromotionCard({ promo, index }: { promo: PublicPromotionResponse; index: number }) {
  const isUpcoming = promo.status === 'upcoming'

  return (
    <motion.div
      className={`promo-card ${isUpcoming ? 'promo-card--upcoming' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="promo-card__badge">
        {isUpcoming ? 'Запланована' : 'Активна'}
      </div>

      <div className="promo-card__discount">
        {formatDiscount(promo.discountType, promo.discountValue)}
      </div>

      <div className="promo-card__name">{promo.name}</div>

      {promo.description && (
        <div className="promo-card__desc">{promo.description}</div>
      )}

      <div className="promo-card__meta">
        {promo.minOrderAmount && (
          <span>від {promo.minOrderAmount} ₴</span>
        )}
        {promo.startsAt && promo.endsAt && (
          <span>{formatDate(promo.startsAt)} — {formatDate(promo.endsAt)}</span>
        )}
        {!promo.startsAt && promo.endsAt && (
          <span>до {formatDate(promo.endsAt)}</span>
        )}
        {promo.startsAt && !promo.endsAt && (
          <span>з {formatDate(promo.startsAt)}</span>
        )}
        {!promo.startsAt && !promo.endsAt && (
          <span>Постійна акція</span>
        )}
      </div>

      {!isUpcoming && (
        <Link to="/catalog" className="promo-card__cta">
          <Button type="primary" block>Замовити зі знижкою</Button>
        </Link>
      )}
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Promotions = observer(function Promotions() {
  const { auth } = useRootStore()
  const [promotions, setPromotions] = useState<PublicPromotionResponse[]>([])
  const [cards, setCards] = useState<PromoCodeCardResponse[]>([])
  const [code, setCode] = useState('')
  const [activating, setActivating] = useState(false)
  const [loadingCards, setLoadingCards] = useState(false)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getPromotions().then(setPromotions).catch(() => {})
  }, [])

  useEffect(() => {
    if (!auth.isLoggedIn) return
    setLoadingCards(true)
    getMyPromoCards().then(setCards).catch(() => {}).finally(() => setLoadingCards(false))
  }, [auth.isLoggedIn])

  const handleActivate = async () => {
    if (!code.trim()) return
    if (!auth.isLoggedIn) {
      message.info('Увійдіть в акаунт, щоб активувати промокод')
      return
    }
    setActivating(true)
    try {
      const card = await activatePromoCode(code.trim())
      setCards(prev => {
        if (prev.find(c => c.id === card.id)) return prev
        return [card, ...prev]
      })
      setCode('')
      message.success(`Промокод активовано! Картка «${card.displayName}» додана.`)
      cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Промокод не знайдено або недійсний'
      message.error(msg)
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="promotions-page">

      {/* ── Hero ── */}
      <section className="promo-hero">
        <div className="promo-hero__bg" aria-hidden>
          <span className="promo-hero__float promo-hero__float--1">−15%</span>
          <span className="promo-hero__float promo-hero__float--2">−20%</span>
          <span className="promo-hero__float promo-hero__float--3">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 24a5 5 0 0 1 0-10h44a5 5 0 0 1 0 10v4a5 5 0 0 1 0 10H8a5 5 0 0 1 0-10v-4z" fill="white"/>
              <line x1="24" y1="14" x2="24" y2="46" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4 3"/>
            </svg>
          </span>
          <span className="promo-hero__float promo-hero__float--4">−10%</span>
        </div>
        <div className="promo-hero__content">
          <motion.p className="promo-hero__eyebrow"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            Вигідно з Випускник+
          </motion.p>
          <motion.h1 className="promo-hero__title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
            Акції та знижки
          </motion.h1>
          <motion.p className="promo-hero__subtitle"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.16 }}>
            Автоматичні акції на замовлення та особисті промокоди — все в одному місці
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.24 }}>
            <Link to="/catalog">
              <Button size="large" className="promo-hero__btn">
                Перейти до каталогу
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Active promotions ── */}
      <section className="promo-section">
        <div className="promo-section__inner">
          <div className="promo-section__header">
            <h2 className="promo-section__title">Поточні акції</h2>
            <p className="promo-section__subtitle">
              Застосовуються автоматично при оформленні замовлення
            </p>
          </div>

          {promotions.length === 0 ? (
            <div className="promo-empty">
              <span className="promo-empty__icon"><IconNoPromotions /></span>
              <p>Зараз немає активних акцій</p>
              <p className="promo-empty__sub">Стежте за оновленнями — незабаром!</p>
            </div>
          ) : (
            <div className="promo-cards-grid">
              {promotions.map((p, i) => (
                <PromotionCard key={p.id} promo={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Activate code + My cards ── */}
      <section className="promo-section promo-section--dark" ref={cardsRef}>
        <div className="promo-section__inner">
          <div className="promo-section__header">
            <h2 className="promo-section__title">Мої промокоди</h2>
            <p className="promo-section__subtitle">
              Введи код — отримай картку знижки та застосуй при замовленні
            </p>
          </div>

          {/* Activation input */}
          <div className="promo-activate">
            <div className="promo-activate__row">
              <Input
                placeholder="Введи промокод"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onPressEnter={handleActivate}
                size="large"
                className="promo-activate__input"
                style={{ fontFamily: 'monospace', letterSpacing: 2, textTransform: 'uppercase' }}
              />
              <Button
                type="primary"
                size="large"
                loading={activating}
                onClick={handleActivate}
                className="promo-activate__btn"
              >
                Активувати
              </Button>
            </div>
          </div>

          {/* Cards */}
          {!auth.isLoggedIn ? (
            <div className="promo-login-cta">
              <span className="promo-login-cta__icon"><IconLock /></span>
              <p>Увійдіть в акаунт, щоб бачити і зберігати свої промокоди</p>
              <Link to="/auth">
                <Button type="primary" size="large">Увійти</Button>
              </Link>
            </div>
          ) : loadingCards ? (
            <div className="promo-empty">
              <p>Завантаження...</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="promo-empty">
              <span className="promo-empty__icon"><IconNoTickets /></span>
              <p>У тебе ще немає промокодів</p>
              <p className="promo-empty__sub">Введи код вище, щоб отримати картку знижки</p>
            </div>
          ) : (
            <div className="promo-tickets-grid">
              {cards.map((card, i) => (
                <PromoTicket key={card.id} card={card} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  )
})

export default Promotions
