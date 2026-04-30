import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import AnimatedSection from '../../components/ui/AnimatedSection'
import CountUp from '../../components/ui/CountUp'
import { getPageContent } from '../../api/page-content'
import './About.css'

// ─── CMS Types ────────────────────────────────────────────────────────────────

interface AboutContent {
  hero: { label: string; title: string }
  stats: { value: number; suffix: string; label: string }[]
  whoWeAre: { sectionLabel: string; title: string; paragraph1: string; paragraph2: string; photoUrl: string | null }
  howWeWork: { sectionLabel: string; title: string; steps: { num: string; title: string; desc: string; note: string | null }[] }
  whyUs: { sectionLabel: string; title: string; items: { title: string; desc: string }[] }
  faq: { sectionLabel: string; title: string; items: { q: string; a: string }[] }
  contacts: { phone: string; phoneHref: string; email: string; instagramHandle: string; instagramHref: string; businessHours: string }
}

const DEFAULT: AboutContent = {
  hero: { label: 'Про нас', title: 'Ми робимо так, щоб кожен учень отримав свою стрічку — з власним іменем, кольором і характером' },
  stats: [
    { value: 8, suffix: '', label: 'років на ринку' },
    { value: 500, suffix: '+', label: 'шкіл замовляли у нас' },
    { value: 10000, suffix: '+', label: 'стрічок виготовлено' },
  ],
  whoWeAre: {
    sectionLabel: 'Хто ми', title: 'Випускник+',
    paragraph1: 'Виготовляємо іменні стрічки, медалі та аксесуари для шкільних свят вже 8 років. Працюємо зі школами, ліцеями та гімназіями по всій Україні — від невеликих сільських класів до великих міських шкіл на 200+ випускників.',
    paragraph2: 'Приймаємо замовлення онлайн і відправляємо в будь-яку точку країни. Кожне замовлення — іменне, кожна стрічка — перевірена перед відправкою.',
    photoUrl: null,
  },
  howWeWork: {
    sectionLabel: 'Як ми працюємо', title: 'Від замовлення до дверей',
    steps: [
      { num: '01', title: 'Оформіть замовлення', desc: 'Оберіть товари з каталогу або скористайтеся конструктором. Вкажіть імена, кількість та побажання щодо дизайну.', note: null },
      { num: '02', title: 'Виробництво', desc: 'Виготовляємо кожну стрічку вручну з перевіркою якості. Стандартне замовлення — 5 робочих днів, термінове — 2 дні.', note: 'Термінове виконання доступне при замовленні до 14:00' },
      { num: '03', title: 'Доставка', desc: 'Відправляємо Новою Поштою або Укрпоштою по всій Україні. Надсилаємо трек-номер одразу після відправки.', note: null },
    ],
  },
  whyUs: {
    sectionLabel: 'Наші переваги', title: 'Чому обирають нас',
    items: [
      { title: 'Якісні матеріали', desc: 'Використовуємо атласні та сатинові стрічки з чіткою якісною вишивкою або друком — не вицвітають і не мнуться.' },
      { title: 'Іменне виготовлення', desc: "Кожна стрічка з власним іменем учня. Дівчата отримують «Випускниця», хлопці — «Випускник». Без помилок — перевіряємо кожне ім'я." },
      { title: 'Швидкі терміни', desc: 'Стандарт — 5 днів, термінове замовлення — 2 дні. Беремо термінові замовлення навіть у пік сезону.' },
      { title: 'Доставка по всій Україні', desc: 'Нова Пошта або Укрпошта в будь-яке місто та село. Відстежуйте посилку за трек-номером.' },
    ],
  },
  faq: {
    sectionLabel: 'Питання та відповіді', title: 'Часті запитання',
    items: [
      { q: 'Чи пишете ви "Випускниця" для дівчат?', a: 'Так. При оформленні замовлення ви вказуєте список імен — ми автоматично визначаємо рід або ви можете вказати вручну для кожного учня. Дівчата отримують «Випускниця», хлопці — «Випускник». Жодних додаткових доплат.' },
      { q: 'Чи можна запропонувати власний дизайн?', a: "Так. Зв'яжіться з нами через Viber, Telegram або email — надішліть ескіз або опис ідеї. Обговоримо деталі та зробимо макет для погодження перед виробництвом." },
      { q: 'Чи є у вас сатинові стрічки?', a: 'Так. Пропонуємо сатинові стрічки з повною кастомізацією: колір тканини, колір та шрифт тексту, розташування напису, додаткові елементи. Сатин виглядає особливо елегантно на випускних вечорах.' },
    ],
  },
  contacts: {
    phone: '+380 (67) 671-45-10', phoneHref: 'tel:+380676714510',
    email: 'vypusk.org@gmail.com',
    instagramHandle: '@vypusknyk.plus', instagramHref: 'https://instagram.com/vypusknyk.plus',
    businessHours: 'Пн–Пт, 9:00–18:00',
  },
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="faq-item">
      <p className="faq-item__q">{q}</p>
      <p className="faq-item__a">{a}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function About() {
  const [cms, setCms] = useState<AboutContent>(DEFAULT)

  useEffect(() => {
    getPageContent<AboutContent>('about').then(setCms).catch(() => {})
  }, [])

  const { hero, stats, whoWeAre, howWeWork, whyUs, faq, contacts } = cms

  const phoneNumber = contacts.phoneHref.replace('tel:', '')

  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero__content">
          <motion.p className="about-hero__label" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {hero.label}
          </motion.p>
          <motion.h1 className="about-hero__title" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
            {hero.title}
          </motion.h1>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="about-stats">
        <div className="about-container">
          <div className="about-stats__grid">
            {stats.map((s, i) => (
              <AnimatedSection key={s.label} delay={i * 0.12} direction="up">
                <div className="about-stat">
                  <div className="about-stat__value"><CountUp to={s.value} suffix={s.suffix} /></div>
                  <div className="about-stat__label">{s.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who we are ── */}
      <section className="about-who">
        <div className="about-container about-who__inner">
          <AnimatedSection direction="left">
            <div className="about-who__text">
              <p className="section-label">{whoWeAre.sectionLabel}</p>
              <h2 className="about-section-title">{whoWeAre.title}</h2>
              <p className="about-who__desc">{whoWeAre.paragraph1}</p>
              <p className="about-who__desc">{whoWeAre.paragraph2}</p>
            </div>
          </AnimatedSection>
          <AnimatedSection direction="right">
            <div className="about-who__photo-wrap">
              {whoWeAre.photoUrl ? (
                <img src={whoWeAre.photoUrl} alt="Фото виробництва" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
              ) : (
                <div className="about-who__photo-placeholder">
                  <span className="about-who__photo-hint">Фото виробництва</span>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── How we work ── */}
      <section className="about-steps">
        <div className="about-container">
          <AnimatedSection className="text-center">
            <p className="section-label">{howWeWork.sectionLabel}</p>
            <h2 className="about-section-title about-section-title--center">{howWeWork.title}</h2>
          </AnimatedSection>

          <div className="about-steps__grid">
            {howWeWork.steps.map((step, i) => (
              <AnimatedSection key={step.num} delay={i * 0.12} direction="up">
                <div className="about-step">
                  <div className="about-step__num">{step.num}</div>
                  <h3 className="about-step__title">{step.title}</h3>
                  <p className="about-step__desc">{step.desc}</p>
                  {step.note && <p className="about-step__note">{step.note}</p>}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why us ── */}
      <section className="about-why">
        <div className="about-container">
          <AnimatedSection className="text-center">
            <p className="section-label">{whyUs.sectionLabel}</p>
            <h2 className="about-section-title about-section-title--center">{whyUs.title}</h2>
          </AnimatedSection>

          <div className="about-why__grid">
            {whyUs.items.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1} direction="up">
                <div className="about-why-card">
                  <div className="about-why-card__num">{String(i + 1).padStart(2, '0')}</div>
                  <h3 className="about-why-card__title">{item.title}</h3>
                  <p className="about-why-card__desc">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="about-faq">
        <div className="about-container about-faq__inner">
          <AnimatedSection direction="left">
            <p className="section-label">{faq.sectionLabel}</p>
            <h2 className="about-section-title">{faq.title}</h2>
          </AnimatedSection>
          <div className="about-faq__list">
            {faq.items.map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.1} direction="up">
                <FaqItem q={item.q} a={item.a} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacts ── */}
      <section className="about-contacts">
        <div className="about-container">
          <AnimatedSection className="text-center">
            <p className="section-label">Зв'язок</p>
            <h2 className="about-section-title about-section-title--center">Контакти</h2>
          </AnimatedSection>

          <div className="about-contacts__grid">
            <AnimatedSection delay={0} direction="up">
              <div className="about-contact-card">
                <p className="about-contact-card__label">Телефон</p>
                <a href={contacts.phoneHref} className="about-contact-card__value">{contacts.phone}</a>
                <div className="about-contact-card__messengers">
                  <a href={`viber://chat?number=${phoneNumber}`} className="about-contact-card__msg-btn">Viber</a>
                  <a href={`https://t.me/${phoneNumber}`} className="about-contact-card__msg-btn">Telegram</a>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1} direction="up">
              <div className="about-contact-card">
                <p className="about-contact-card__label">Email</p>
                <a href={`mailto:${contacts.email}`} className="about-contact-card__value">{contacts.email}</a>
                <p className="about-contact-card__hours">{contacts.businessHours}</p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} direction="up">
              <div className="about-contact-card">
                <p className="about-contact-card__label">Instagram</p>
                <a href={contacts.instagramHref} target="_blank" rel="noopener noreferrer" className="about-contact-card__value">
                  {contacts.instagramHandle}
                </a>
                <p className="about-contact-card__hours">Працюємо лише онлайн</p>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection className="text-center" delay={0.3} direction="up">
            <div className="about-contacts__cta">
              <Link to="/catalog"><Button className="about-cta-btn">Переглянути каталог</Button></Link>
              <Link to="/constructor"><Button className="about-cta-btn-secondary">Конструктор стрічок</Button></Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  )
}
