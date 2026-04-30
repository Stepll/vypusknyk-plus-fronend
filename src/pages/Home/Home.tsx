import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValueEvent,
} from 'framer-motion'
import { Button } from 'antd'
import RibbonPreview, { ColorVariant } from '../../components/ui/RibbonPreview'
import AnimatedSection from '../../components/ui/AnimatedSection'
import CountUp from '../../components/ui/CountUp'
import TiltCard from '../../components/ui/TiltCard'
import { getPageContent } from '../../api/page-content'
import './Home.css'

// ─── CMS Types ───────────────────────────────────────────────────────────────

interface HomeContent {
  hero: { title: string; titleAccent: string; subtitle: string; button1Text: string; button2Text: string }
  stats: { value: number; suffix: string; label: string }[]
  howItWorks: { sectionLabel: string; sectionTitle: string; steps: { step: string; title: string; desc: string }[] }
  gallery: { sectionLabel: string; sectionTitle: string; items: { label: string; imageUrl: string | null }[] }
  banner: { title: string; subtitle: string; buttonText: string }
  testimonials: { sectionLabel: string; sectionTitle: string; items: { name: string; role: string; text: string }[] }
}

const GALLERY_COLORS = ['#f5f5f5', '#1a56a0', '#ff6b5b', '#1e3a8a', '#c9a84c', '#e8e8e8']

const DEFAULT: HomeContent = {
  hero: {
    title: 'Стрічки та аксесуари',
    titleAccent: 'для шкільних свят',
    subtitle: 'Кастомні іменні стрічки, медалі та святковий декор для випускних, олімпіад та будь-яких шкільних заходів',
    button1Text: 'Переглянути каталог',
    button2Text: 'Конструктор стрічок',
  },
  stats: [
    { value: 500, suffix: '+', label: 'шкіл замовляли у нас' },
    { value: 10000, suffix: '+', label: 'стрічок виготовлено' },
    { value: 8, suffix: '', label: 'років на ринку' },
  ],
  howItWorks: {
    sectionLabel: 'Просто та зручно',
    sectionTitle: 'Як це працює',
    steps: [
      { step: '01', title: 'Оберіть товар', desc: 'Перегляньте каталог і знайдіть потрібну стрічку або аксесуар' },
      { step: '02', title: 'Налаштуйте дизайн', desc: 'Вкажіть текст, колір та стиль під ваш захід' },
      { step: '03', title: 'Оформіть замовлення', desc: 'Заповніть форму та оберіть зручний спосіб доставки' },
      { step: '04', title: 'Отримайте результат', desc: 'Доставимо готові вироби прямо до вашої школи' },
    ],
  },
  gallery: {
    sectionLabel: 'Наші роботи',
    sectionTitle: 'Приклади стрічок',
    items: [
      { label: 'Білий атлас, золото', imageUrl: null },
      { label: 'Синьо-жовтий, срібло', imageUrl: null },
      { label: 'Корал, білий текст', imageUrl: null },
      { label: 'Синій, золото', imageUrl: null },
      { label: 'Золотий атлас', imageUrl: null },
      { label: 'Білий, чорний текст', imageUrl: null },
    ],
  },
  banner: {
    title: 'Готуєтесь до випускного?',
    subtitle: 'Замовте іменні стрічки для всіх випускників — зробимо швидко та якісно',
    buttonText: 'Замовити стрічки',
  },
  testimonials: {
    sectionLabel: 'Відгуки',
    sectionTitle: 'Що кажуть вчителі',
    items: [
      { name: 'Олена Мельник', role: 'Класний керівник, ЗОШ №5', text: 'Замовляли стрічки на випускний — діти були в захваті! Якість чудова, доставили вчасно.' },
      { name: 'Наталія Коваль', role: 'Заступник директора', text: 'Дуже зручно замовляти онлайн. Менеджери швидко відповіли і допомогли з дизайном.' },
      { name: 'Ірина Шевченко', role: 'Організатор свят', text: 'Вже третій рік поспіль замовляємо тут. Якість стабільна, ціни доступні.' },
    ],
  },
}

// ─── Scroll ribbon scene ──────────────────────────────────────────────────────

const SCROLL_NAMES = [
  'Олена Петренко', 'Максим Коваленко', 'Вікторія Шевченко', 'Андрій Мельник',
  'Софія Бондаренко', 'Дмитро Ткаченко', 'Юлія Василенко', 'Богдан Гончаренко',
]
const SCROLL_VARIANTS: ColorVariant[] = ['coral', 'blue-yellow', 'white', 'gold']

interface Step { at: number; nameIdx?: number; colorIdx?: number; emblemIdx?: number }
const STEPS: Step[] = [
  { at: 0.22, nameIdx: 0 }, { at: 0.30, colorIdx: 1 }, { at: 0.37, nameIdx: 1 },
  { at: 0.43, emblemIdx: 1 }, { at: 0.49, nameIdx: 2 }, { at: 0.55, colorIdx: 2 },
  { at: 0.60, nameIdx: 3 }, { at: 0.66, emblemIdx: 2 }, { at: 0.71, colorIdx: 3 },
  { at: 0.76, nameIdx: 4 }, { at: 0.81, emblemIdx: 3 }, { at: 0.86, nameIdx: 5 },
]

const SHAPE_H = 4800
const SHAPE_W = 420

function buildLeftPath(): string {
  const BASE = 260
  const segs: string[] = []
  for (let y = 0; y <= SHAPE_H; y += 8) {
    const grow = BASE * (1 - Math.exp(-y / 230))
    const wave = 90 * Math.sin(y / 190) + 55 * Math.sin(y / 120 + 1.4) + 35 * Math.sin(y / 76 + 2.9) + 20 * Math.sin(y / 44 + 0.8)
    const x = Math.max(0, grow + wave)
    segs.push(`L ${x.toFixed(1)},${y}`)
  }
  const rightEdge = [...segs].reverse().join(' ')
  return `M 0,0 L 0,${SHAPE_H} ${segs[segs.length - 1]} ${rightEdge} Z`
}

function buildRightPath(): string {
  const BASE = 250
  const segs: string[] = []
  for (let y = 0; y <= SHAPE_H; y += 8) {
    const grow = BASE * (1 - Math.exp(-y / 270))
    const wave = 80 * Math.sin(y / 205 + 0.7) + 50 * Math.sin(y / 126 + 2.2) + 38 * Math.sin(y / 70 + 1.6) + 22 * Math.sin(y / 50 + 3.5)
    const x = SHAPE_W - Math.max(0, grow + wave)
    segs.push(`L ${x.toFixed(1)},${y}`)
  }
  const rightEdge = [...segs].reverse().join(' ')
  return `M ${SHAPE_W},0 L ${SHAPE_W},${SHAPE_H} ${segs[segs.length - 1]} ${rightEdge} Z`
}

const LEFT_PATH  = buildLeftPath()
const RIGHT_PATH = buildRightPath()

function StepsProgressLine() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end center'] })
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  return (
    <div ref={ref} className="steps-line-wrap">
      <div className="steps-line-track">
        <motion.div className="steps-line-fill" style={{ scaleX }} />
      </div>
    </div>
  )
}

interface SceneProps { hero: HomeContent['hero'] }

function ScrollRibbonScene({ hero }: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })

  const ribbonY = useTransform(scrollYProgress, [0, 0.18], [200, -60])
  const ribbonScale = useTransform(scrollYProgress, [0.04, 0.18], [1, 1.55])
  const circleY1 = useTransform(scrollYProgress, [0, 1], ['0vh', '-65vh'])
  const circleY2 = useTransform(scrollYProgress, [0, 1], ['0vh', '-90vh'])
  const circleY3 = useTransform(scrollYProgress, [0, 1], ['0vh', '-55vh'])
  const circleY4 = useTransform(scrollYProgress, [0, 1], ['0vh', '-75vh'])
  const shapeY       = useTransform(scrollYProgress, [0, 1], ['50vh', '-310vh'])
  const shapeOpacity = useTransform(scrollYProgress, [0, 0.05, 0.88, 1.0], [0, 1, 1, 0])
  const phaseLabelOpacity = useTransform(scrollYProgress, [0.20, 0.25], [0, 1])

  const [currentName, setCurrentName] = useState("Ваше ім'я")
  const [currentVariant, setCurrentVariant] = useState<ColorVariant>('coral')
  const [emblemKey, setEmblemKey] = useState(0)
  const [phaseLabel, setPhaseLabel] = useState('')

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const tOpacity = Math.max(0, 1 - v / 0.06)
    const tY = -80 * Math.min(v / 0.06, 1)
    if (textRef.current) {
      textRef.current.style.opacity = String(tOpacity)
      textRef.current.style.transform = `translateY(${tY}px)`
    }
    if (scrollHintRef.current) {
      scrollHintRef.current.style.opacity = String(Math.max(0, 1 - v / 0.04))
    }

    let name = "Ваше ім'я"
    let colorIdx = 0
    let emblem = 0
    let label = ''

    for (const step of STEPS) {
      if (v >= step.at) {
        if (step.nameIdx  !== undefined) name     = SCROLL_NAMES[step.nameIdx]
        if (step.colorIdx !== undefined) colorIdx = step.colorIdx
        if (step.emblemIdx !== undefined) emblem  = step.emblemIdx
      }
    }

    const lastStep = [...STEPS].reverse().find((s) => v >= s.at)
    if (lastStep) {
      if (lastStep.nameIdx !== undefined) label = "Будь-яке ім'я"
      else if (lastStep.colorIdx !== undefined) label = 'Будь-який колір'
      else if (lastStep.emblemIdx !== undefined) label = 'Будь-яка емблема'
    }

    setCurrentName(name)
    setCurrentVariant(SCROLL_VARIANTS[colorIdx])
    setEmblemKey(emblem)
    setPhaseLabel(label)
  })

  return (
    <div className="scroll-scene" ref={containerRef}>
      <div className="scroll-scene__sticky">
        <div className="scroll-scene__bg">
          <div className="scroll-scene__blob scroll-scene__blob--pink" />
          <div className="scroll-scene__blob scroll-scene__blob--indigo" />
          <div className="scroll-scene__blob scroll-scene__blob--center" />
        </div>

        <motion.div className="scroll-scene__circle scroll-scene__circle--1" style={{ y: circleY1 }} />
        <motion.div className="scroll-scene__circle scroll-scene__circle--2" style={{ y: circleY2 }} />
        <motion.div className="scroll-scene__circle scroll-scene__circle--3" style={{ y: circleY3 }} />
        <motion.div className="scroll-scene__circle scroll-scene__circle--4" style={{ y: circleY4 }} />

        <motion.div className="scroll-scene__shapes" style={{ y: shapeY, opacity: shapeOpacity }}>
          <svg className="scroll-scene__shape-svg scroll-scene__shape-svg--left" viewBox={`0 0 ${SHAPE_W} ${SHAPE_H}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d={LEFT_PATH} />
          </svg>
          <svg className="scroll-scene__shape-svg scroll-scene__shape-svg--right" viewBox={`0 0 ${SHAPE_W} ${SHAPE_H}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d={RIGHT_PATH} />
          </svg>
        </motion.div>

        <div ref={textRef} className="scroll-scene__text">
          <motion.h1 className="scroll-scene__title" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            {hero.title}
            <span className="scroll-scene__title-accent">{hero.titleAccent}</span>
          </motion.h1>

          <motion.p className="scroll-scene__subtitle" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
            {hero.subtitle}
          </motion.p>

          <motion.div className="scroll-scene__actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }}>
            <Link to="/catalog">
              <Button className="scroll-scene__btn-primary">{hero.button1Text}</Button>
            </Link>
            <Link to="/constructor">
              <Button className="scroll-scene__btn-secondary">{hero.button2Text}</Button>
            </Link>
          </motion.div>
        </div>

        <motion.div className="scroll-scene__ribbon-outer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <motion.div className="scroll-scene__ribbon-inner" style={{ y: ribbonY, scale: ribbonScale }}>
            <RibbonPreview name={currentName} variant={currentVariant} emblemKey={emblemKey} />
          </motion.div>
        </motion.div>

        <motion.div className="scroll-scene__phase-label" style={{ opacity: phaseLabelOpacity }}>
          <AnimatePresence mode="wait">
            {phaseLabel && (
              <motion.span key={phaseLabel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                {phaseLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <div ref={scrollHintRef} className="scroll-scene__scroll-hint">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <div className="scroll-hint__mouse"><div className="scroll-hint__dot" /></div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

const TESTIMONIAL_DIRECTIONS = ['left', 'up', 'right'] as const

// ─── Home ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [content, setContent] = useState<HomeContent>(DEFAULT)

  useEffect(() => {
    getPageContent<HomeContent>('home').then(setContent).catch(() => {})
  }, [])

  const { hero, stats, howItWorks, gallery, banner, testimonials } = content

  return (
    <div className="home">

      <ScrollRibbonScene hero={hero} />

      {/* ── Stats ── */}
      <section className="stats">
        <div className="container">
          <div className="stats__grid">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 0.15} direction="up">
                <div className="stat-card">
                  <div className="stat-card__value">
                    <CountUp to={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="stat-card__label">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-it-works">
        <div className="container">
          <AnimatedSection className="text-center">
            <p className="section-label">{howItWorks.sectionLabel}</p>
            <h2 className="section-title">{howItWorks.sectionTitle}</h2>
          </AnimatedSection>

          <div className="steps__grid">
            {howItWorks.steps.map((item, i) => {
              const direction = i === 0 ? 'left' : i === 3 ? 'right' : 'up'
              return (
                <AnimatedSection key={item.step} delay={i * 0.15} direction={direction}>
                  <div className="step">
                    <div className="step__number">{item.step}</div>
                    <h3 className="step__title">{item.title}</h3>
                    <p className="step__desc">{item.desc}</p>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>

          <StepsProgressLine />
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="gallery">
        <div className="container">
          <AnimatedSection className="text-center">
            <p className="section-label">{gallery.sectionLabel}</p>
            <h2 className="section-title">{gallery.sectionTitle}</h2>
          </AnimatedSection>

          <div className="gallery__grid">
            {gallery.items.map((item, i) => {
              const isEvenRow = Math.floor(i / 3) % 2 === 0
              return (
                <AnimatedSection key={i} delay={i * 0.08} direction={isEvenRow ? 'up' : 'down'}>
                  <TiltCard>
                    {item.imageUrl ? (
                      <div className="gallery-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <img src={item.imageUrl} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span className="gallery-card__label">{item.label}</span>
                      </div>
                    ) : (
                      <div className="gallery-card" style={{ background: GALLERY_COLORS[i] ?? '#f0f0f0' }}>
                        <div className="gallery-card__ribbon-line" />
                        <span className="gallery-card__label">{item.label}</span>
                      </div>
                    )}
                  </TiltCard>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Banner ── */}
      <section className="banner">
        <div className="container">
          <AnimatedSection direction="fade">
            <h2 className="banner__title">{banner.title}</h2>
            <p className="banner__subtitle">{banner.subtitle}</p>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }} whileTap={{ scale: 0.97 }}>
              <Link to="/catalog">
                <Button className="banner__btn">{banner.buttonText}</Button>
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials">
        <div className="container">
          <AnimatedSection className="text-center">
            <p className="section-label">{testimonials.sectionLabel}</p>
            <h2 className="section-title">{testimonials.sectionTitle}</h2>
          </AnimatedSection>

          <div className="testimonials__grid">
            {testimonials.items.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.1} direction={TESTIMONIAL_DIRECTIONS[i % 3]}>
                <div className="testimonial-card">
                  <div className="testimonial-card__quote">"</div>
                  <p className="testimonial-card__text">{t.text}</p>
                  <p className="testimonial-card__name">{t.name}</p>
                  <p className="testimonial-card__role">{t.role}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
