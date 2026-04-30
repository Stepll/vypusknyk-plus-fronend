import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from 'antd'
import { getPageContent } from '../../api/page-content'
import './Events.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const DOT_SPACING = 170
const PADDING_TOP  = 80
const PADDING_BOT  = 320

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiscountInfo { label: string; description: string }

interface SchoolEvent {
  id: string; month: number; day: number; dateLabel: string
  title: string; desc: string; discount?: DiscountInfo
}

interface EventsContent {
  hero: { eyebrow: string; title: string; subtitle: string }
  events: { id: string; month: number; day: number; dateLabel: string; title: string; desc: string; discountLabel: string; discountDescription: string }[]
}

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_EVENTS: SchoolEvent[] = [
  { id: 'knowledge-day', month: 9, day: 1, dateLabel: '1 вересня', title: 'День знань', desc: 'Перший дзвоник, урочиста лінійка, першокласники зі стрічками. Один з найтепліших днів шкільного року.', discount: { label: '−10% на стрічки до першого вересня', description: 'Замовлення до 15 серпня.' } },
  { id: 'teachers-day', month: 10, day: 4, dateLabel: '4 жовтня', title: 'День вчителя', desc: 'Свято для тих, хто щодня вкладає серце в навчання. Учні готують виступи, вручають квіти й подарунки.', discount: { label: '−15% на подарункові набори від 3 шт', description: 'Від 3 подарункових наборів в одному замовленні.' } },
  { id: 'olympiads', month: 4, day: 15, dateLabel: 'Квітень', title: 'Олімпіади', desc: 'Фінальний всеукраїнський етап олімпіад з усіх предметів. Переможці заслуговують на гідну нагороду.', discount: { label: '−10% на комплект «медаль + грамота»', description: 'Медаль і грамота в одному замовленні.' } },
  { id: 'last-bell', month: 5, day: 25, dateLabel: '25 травня', title: 'Останній дзвоник', desc: "Урочиста лінійка для дев'ятикласників. Сльози, квіти, стрічки — момент, який запам'ятовується на все життя.", discount: { label: '−10% на стрічки «Випускник»', description: 'Замовлення до 15 вересня.' } },
  { id: 'graduation', month: 6, day: 20, dateLabel: 'Кінець червня', title: 'Випускний вечір', desc: 'Головне свято шкільного року. 11-й клас прощається зі школою — урочисто, зі стрічками, медалями й незабутніми емоціями.', discount: { label: '−10% на стрічки «Випускник»', description: 'Замовлення до 15 вересня.' } },
]

const DEFAULT_HERO = { eyebrow: 'Шкільний рік', title: 'Шкільні свята', subtitle: 'Плануйте свято заздалегідь. Ми підготуємо стрічки, медалі та грамоти вчасно — для будь-якого шкільного заходу.' }

// ─── School-year helpers ──────────────────────────────────────────────────────

type EventStatus = 'past' | 'urgent' | 'upcoming'

function schoolYearStartYear(now: Date): number {
  const m = now.getMonth() + 1
  return m <= 6 ? now.getFullYear() - 1 : now.getFullYear()
}

function eventDate(ev: SchoolEvent, now: Date): Date {
  const sy = schoolYearStartYear(now)
  return new Date(ev.month >= 9 ? sy : sy + 1, ev.month - 1, ev.day)
}

function getStatus(ev: SchoolEvent, now: Date): EventStatus {
  const today = new Date(now); today.setHours(0, 0, 0, 0)
  const ed    = eventDate(ev, now); ed.setHours(0, 0, 0, 0)
  const diff  = Math.round((ed.getTime() - today.getTime()) / 86400000)
  if (diff < 0)   return 'past'
  if (diff <= 14) return 'urgent'
  return 'upcoming'
}

function getDayLabel(ev: SchoolEvent, now: Date): string {
  const today = new Date(now); today.setHours(0, 0, 0, 0)
  const ed    = eventDate(ev, now); ed.setHours(0, 0, 0, 0)
  const diff  = Math.round((ed.getTime() - today.getTime()) / 86400000)
  if (diff < 0)   return 'Минуло'
  if (diff === 0) return 'Сьогодні'
  if (diff === 1) return 'Завтра'
  return `${diff} днів`
}

function computeMarker(events: SchoolEvent[], now: Date): { y: number; isRight: boolean } {
  const today   = new Date(now); today.setHours(0, 0, 0, 0)
  const statuses = events.map(ev => getStatus(ev, now))
  const nextIdx  = statuses.findIndex(s => s !== 'past')

  if (nextIdx === -1) {
    const lastIdx = events.length - 1
    return { y: PADDING_TOP + lastIdx * DOT_SPACING + 56, isRight: lastIdx % 2 === 0 }
  }

  if (nextIdx === 0) return { y: PADDING_TOP - 56, isRight: true }

  const prevIdx = nextIdx - 1
  const prev    = eventDate(events[prevIdx], now); prev.setHours(0, 0, 0, 0)
  const next    = eventDate(events[nextIdx], now); next.setHours(0, 0, 0, 0)
  const total   = (next.getTime() - prev.getTime()) / 86400000
  const elapsed = (today.getTime() - prev.getTime()) / 86400000
  const fraction = Math.max(0.05, Math.min(0.95, elapsed / total))

  const y = PADDING_TOP + prevIdx * DOT_SPACING + fraction * DOT_SPACING
  const sectorIdx  = fraction < 0.5 ? prevIdx : nextIdx
  const cardIsRight = sectorIdx % 2 !== 0
  return { y, isRight: !cardIsRight }
}

// ─── EventCard ────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: SchoolEvent; index: number; isRight: boolean; status: EventStatus
  dayLabel: string; isOpen: boolean; onMouseEnter: () => void; onMouseLeave: () => void
}

function EventCard({ event, index, isRight, status, dayLabel, isOpen, onMouseEnter, onMouseLeave }: EventCardProps) {
  const top    = PADDING_TOP + index * DOT_SPACING - 20
  const isPast = status === 'past'

  return (
    <div
      className={`ev-card ${isRight ? 'ev-card--right' : ''} ev-card--${status} ${isOpen ? 'ev-card--open' : ''}`}
      style={{ top }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="ev-header">
        <h2 className="ev-title">{event.title}</h2>
        <span className={`ev-day-label ev-day-label--${status}`}>{dayLabel}</span>
        <span className={`ev-chevron ${isOpen ? 'ev-chevron--open' : ''}`}>›</span>
      </div>

      <motion.div
        className="ev-body"
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        <div className="ev-body-date">
          <span className={`ev-date ev-date--${status}`}>{event.dateLabel}</span>
        </div>

        <p className="ev-desc">{event.desc}</p>

        {event.discount && (
          <div className="ev-discount">
            <span className="ev-discount__badge">{event.discount.label}</span>
            <p className="ev-discount__text">{event.discount.description}</p>
          </div>
        )}

        {!isPast && (
          <div className="ev-actions">
            <Link to="/catalog">
              <Button className="ev-btn-primary">
                {status === 'urgent' ? 'Замовити терміново' : 'Переглянути товари'}
              </Button>
            </Link>
            <Link to="/constructor">
              <Button className="ev-btn-secondary">Конструктор</Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Events() {
  const [events, setEvents] = useState<SchoolEvent[]>(DEFAULT_EVENTS)
  const [hero, setHero] = useState(DEFAULT_HERO)
  const [mockDateStr, setMockDateStr] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    getPageContent<EventsContent>('events').then(data => {
      setHero(data.hero)
      setEvents(data.events.map(ev => ({
        id: ev.id, month: ev.month, day: ev.day, dateLabel: ev.dateLabel,
        title: ev.title, desc: ev.desc,
        discount: ev.discountLabel ? { label: ev.discountLabel, description: ev.discountDescription } : undefined,
      })))
    }).catch(() => {})
  }, [])

  const now        = useMemo(() => new Date(mockDateStr + 'T12:00:00'), [mockDateStr])
  const marker     = useMemo(() => computeMarker(events, now), [events, mockDateStr])
  const containerH = PADDING_TOP + (events.length - 1) * DOT_SPACING + PADDING_BOT

  return (
    <div className="events-page">

      {/* ── Hero ── */}
      <section className="events-hero">
        <div className="events-hero__content">
          <motion.p className="events-hero__label" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {hero.eyebrow}
          </motion.p>
          <motion.h1 className="events-hero__title" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
            {hero.title}
          </motion.h1>
          <motion.p className="events-hero__subtitle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.16 }}>
            {hero.subtitle}
          </motion.p>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="timeline-section">

        <div className="date-debug">
          <span className="date-debug__label">Тест: поточна дата</span>
          <input className="date-debug__input" type="date" value={mockDateStr} onChange={e => setMockDateStr(e.target.value)} />
        </div>

        <div className="timeline-container" style={{ height: containerH }}>

          <div className="timeline-line" />

          {events.map((ev, i) => {
            const dotY  = PADDING_TOP + i * DOT_SPACING
            const status = getStatus(ev, now)
            return (
              <div key={ev.id + '-dot'} className={`tl-dot tl-dot--${status}`} style={{ top: dotY }} />
            )
          })}

          {events.map((ev, i) => (
            <EventCard
              key={ev.id}
              event={ev}
              index={i}
              isRight={i % 2 !== 0}
              status={getStatus(ev, now)}
              dayLabel={getDayLabel(ev, now)}
              isOpen={hoveredId === ev.id}
              onMouseEnter={() => setHoveredId(ev.id)}
              onMouseLeave={() => setHoveredId(null)}
            />
          ))}

          <div className={`today-marker ${!marker.isRight ? 'today-marker--left' : ''}`} style={{ top: marker.y }}>
            <div className="today-marker__arrow" />
            <span className="today-marker__label">Ви тут</span>
          </div>

        </div>
      </section>

    </div>
  )
}
