import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import AnimatedSection from '../../components/ui/AnimatedSection'
import CountUp from '../../components/ui/CountUp'
import './About.css'

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 8,     suffix: '',  label: 'років на ринку' },
  { value: 500,   suffix: '+', label: 'шкіл замовляли у нас' },
  { value: 10000, suffix: '+', label: 'стрічок виготовлено' },
]

const STEPS = [
  {
    num: '01',
    title: 'Оформіть замовлення',
    desc: 'Оберіть товари з каталогу або скористайтеся конструктором. Вкажіть імена, кількість та побажання щодо дизайну.',
    note: null,
  },
  {
    num: '02',
    title: 'Виробництво',
    desc: 'Виготовляємо кожну стрічку вручну з перевіркою якості. Стандартне замовлення — 5 робочих днів, термінове — 2 дні.',
    note: 'Термінове виконання доступне при замовленні до 14:00',
  },
  {
    num: '03',
    title: 'Доставка',
    desc: 'Відправляємо Новою Поштою або Укрпоштою по всій Україні. Надсилаємо трек-номер одразу після відправки.',
    note: null,
  },
]

const WHY_US = [
  {
    title: 'Якісні матеріали',
    desc: 'Використовуємо атласні та сатинові стрічки з чіткою якісною вишивкою або друком — не вицвітають і не мнуться.',
  },
  {
    title: 'Іменне виготовлення',
    desc: "Кожна стрічка з власним іменем учня. Дівчата отримують «Випускниця», хлопці — «Випускник». Без помилок — перевіряємо кожне ім'я.",
  },
  {
    title: 'Швидкі терміни',
    desc: 'Стандарт — 5 днів, термінове замовлення — 2 дні. Беремо термінові замовлення навіть у пік сезону.',
  },
  {
    title: 'Доставка по всій Україні',
    desc: 'Нова Пошта або Укрпошта в будь-яке місто та село. Відстежуйте посилку за трек-номером.',
  },
]

const FAQ = [
  {
    q: 'Чи пишете ви "Випускниця" для дівчат?',
    a: 'Так. При оформленні замовлення ви вказуєте список імен — ми автоматично визначаємо рід або ви можете вказати вручну для кожного учня. Дівчата отримують «Випускниця», хлопці — «Випускник». Жодних додаткових доплат.',
  },
  {
    q: 'Чи можна запропонувати власний дизайн?',
    a: "Так. Зв'яжіться з нами через Viber, Telegram або email — надішліть ескіз або опис ідеї. Обговоримо деталі та зробимо макет для погодження перед виробництвом.",
  },
  {
    q: 'Чи є у вас сатинові стрічки?',
    a: 'Так. Пропонуємо сатинові стрічки з повною кастомізацією: колір тканини, колір та шрифт тексту, розташування напису, додаткові елементи. Сатин виглядає особливо елегантно на випускних вечорах.',
  },
]

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
  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero__content">
          <motion.p
            className="about-hero__label"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            Про нас
          </motion.p>
          <motion.h1
            className="about-hero__title"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
          >
            Ми робимо так, щоб кожен учень отримав свою стрічку — з власним іменем, кольором і характером
          </motion.h1>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="about-stats">
        <div className="about-container">
          <div className="about-stats__grid">
            {STATS.map((s, i) => (
              <AnimatedSection key={s.label} delay={i * 0.12} direction="up">
                <div className="about-stat">
                  <div className="about-stat__value">
                    <CountUp to={s.value} suffix={s.suffix} />
                  </div>
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
              <p className="section-label">Хто ми</p>
              <h2 className="about-section-title">Випускник+</h2>
              <p className="about-who__desc">
                Виготовляємо іменні стрічки, медалі та аксесуари для шкільних свят вже 8 років.
                Працюємо зі школами, ліцеями та гімназіями по всій Україні — від невеликих
                сільських класів до великих міських шкіл на 200+ випускників.
              </p>
              <p className="about-who__desc">
                Приймаємо замовлення онлайн і відправляємо в будь-яку точку країни.
                Кожне замовлення — іменне, кожна стрічка — перевірена перед відправкою.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection direction="right">
            <div className="about-who__photo-wrap">
              <div className="about-who__photo-placeholder">
                <span className="about-who__photo-hint">Фото виробництва</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── How we work ── */}
      <section className="about-steps">
        <div className="about-container">
          <AnimatedSection className="text-center">
            <p className="section-label">Як ми працюємо</p>
            <h2 className="about-section-title about-section-title--center">
              Від замовлення до дверей
            </h2>
          </AnimatedSection>

          <div className="about-steps__grid">
            {STEPS.map((step, i) => (
              <AnimatedSection key={step.num} delay={i * 0.12} direction="up">
                <div className="about-step">
                  <div className="about-step__num">{step.num}</div>
                  <h3 className="about-step__title">{step.title}</h3>
                  <p className="about-step__desc">{step.desc}</p>
                  {step.note && (
                    <p className="about-step__note">{step.note}</p>
                  )}
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
            <p className="section-label">Наші переваги</p>
            <h2 className="about-section-title about-section-title--center">
              Чому обирають нас
            </h2>
          </AnimatedSection>

          <div className="about-why__grid">
            {WHY_US.map((item, i) => (
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
            <p className="section-label">Питання та відповіді</p>
            <h2 className="about-section-title">Часті запитання</h2>
          </AnimatedSection>
          <div className="about-faq__list">
            {FAQ.map((item, i) => (
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
                <a href="tel:+380676714510" className="about-contact-card__value">
                  +380 (67) 671-45-10
                </a>
                <div className="about-contact-card__messengers">
                  <a href="viber://chat?number=+380676714510" className="about-contact-card__msg-btn">Viber</a>
                  <a href="https://t.me/+380676714510" className="about-contact-card__msg-btn">Telegram</a>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1} direction="up">
              <div className="about-contact-card">
                <p className="about-contact-card__label">Email</p>
                <a href="mailto:vypusk.org@gmail.com" className="about-contact-card__value">
                  vypusk.org@gmail.com
                </a>
                <p className="about-contact-card__hours">Пн–Пт, 9:00–18:00</p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} direction="up">
              <div className="about-contact-card">
                <p className="about-contact-card__label">Instagram</p>
                <a
                  href="https://instagram.com/vypusknyk.plus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-contact-card__value"
                >
                  @vypusknyk.plus
                </a>
                <p className="about-contact-card__hours">Працюємо лише онлайн</p>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection className="text-center" delay={0.3} direction="up">
            <div className="about-contacts__cta">
              <Link to="/catalog">
                <Button className="about-cta-btn">Переглянути каталог</Button>
              </Link>
              <Link to="/constructor">
                <Button className="about-cta-btn-secondary">Конструктор стрічок</Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  )
}
