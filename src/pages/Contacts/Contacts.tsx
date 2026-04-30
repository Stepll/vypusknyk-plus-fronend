import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from 'antd'
import AnimatedSection from '../../components/ui/AnimatedSection'
import { getPageContent } from '../../api/page-content'
import './Contacts.css'

// ─── CMS Types ────────────────────────────────────────────────────────────────

interface ContactsContent {
  hero: { label: string; title: string; subtitle: string }
  contactInfo: { phone: string; phoneHref: string; email: string; instagramHandle: string; instagramHref: string; businessHours: string }
  wholesale: { eyebrow: string; title: string; desc: string; listItems: string[]; viberHref: string; telegramHref: string }
}

const DEFAULT_CONTENT: ContactsContent = {
  hero: { label: 'Контакти', title: 'Маєте питання?', subtitle: 'Напишіть нам — відповімо в найближчий робочий час.' },
  contactInfo: {
    phone: '+380 (67) 671-45-10', phoneHref: 'tel:+380676714510',
    email: 'vypusk.org@gmail.com',
    instagramHandle: '@vypusknyk.plus', instagramHref: 'https://instagram.com/vypusknyk.plus',
    businessHours: 'Пн–Пт, 9:00–18:00',
  },
  wholesale: {
    eyebrow: 'Для шкіл та організацій', title: 'Оптові замовлення',
    desc: 'Якщо ви організовуєте свято для всієї школи або замовляєте для кількох класів одночасно — зв\'яжіться з нами напряму. Обговоримо умови, терміни та знижку для великого замовлення.',
    listItems: ['Від 50 стрічок — індивідуальна ціна', 'Пріоритетне виробництво в пік сезону', 'Один менеджер веде замовлення від початку до доставки'],
    viberHref: 'viber://chat?number=+380676714510', telegramHref: 'https://t.me/+380676714510',
  },
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Topic = 'order' | 'design' | 'question' | 'wholesale' | 'other'

interface FormState { name: string; contact: string; topic: Topic; message: string }

const TOPICS: { value: Topic; label: string }[] = [
  { value: 'order',     label: 'Замовлення' },
  { value: 'design',    label: 'Власний дизайн' },
  { value: 'wholesale', label: 'Оптове замовлення' },
  { value: 'question',  label: 'Питання' },
  { value: 'other',     label: 'Інше' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Contacts() {
  const [cms, setCms] = useState<ContactsContent>(DEFAULT_CONTENT)
  const [form, setForm] = useState<FormState>({ name: '', contact: '', topic: 'order', message: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getPageContent<ContactsContent>('contacts').then(setCms).catch(() => {})
  }, [])

  const { hero, contactInfo, wholesale } = cms

  // Build phone messengers from phoneHref
  const phoneNumber = contactInfo.phoneHref.replace('tel:', '')
  const contactItems = [
    {
      label: 'Телефон', value: contactInfo.phone, href: contactInfo.phoneHref, sub: null,
      messengers: [
        { label: 'Viber',    href: `viber://chat?number=${phoneNumber}` },
        { label: 'Telegram', href: `https://t.me/${phoneNumber}` },
      ],
    },
    { label: 'Email', value: contactInfo.email, href: `mailto:${contactInfo.email}`, sub: 'Відповідаємо протягом дня', messengers: [] },
    { label: 'Instagram', value: contactInfo.instagramHandle, href: contactInfo.instagramHref, sub: null, messengers: [] },
    { label: 'Години роботи', value: contactInfo.businessHours, href: null, sub: 'Лише онлайн', messengers: [] },
  ]

  function handleChange(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="contacts-page">

      {/* ── Hero ── */}
      <section className="contacts-hero">
        <div className="contacts-hero__content">
          <motion.p className="contacts-hero__label" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {hero.label}
          </motion.p>
          <motion.h1 className="contacts-hero__title" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
            {hero.title}
          </motion.h1>
          <motion.p className="contacts-hero__subtitle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.16 }}>
            {hero.subtitle}
          </motion.p>
        </div>
      </section>

      {/* ── Main block: form + contacts ── */}
      <section className="contacts-main">
        <div className="contacts-container">
          <div className="contacts-main__grid">

            {/* Form */}
            <AnimatedSection direction="left">
              <div className="contacts-form-wrap">
                <h2 className="contacts-form-wrap__title">Написати нам</h2>

                {submitted ? (
                  <div className="contacts-form-success">
                    <p className="contacts-form-success__icon">✓</p>
                    <p className="contacts-form-success__title">Повідомлення надіслано</p>
                    <p className="contacts-form-success__desc">Ми зв'яжемося з вами найближчим часом.</p>
                    <button className="contacts-form-success__reset" onClick={() => { setSubmitted(false); setForm({ name: '', contact: '', topic: 'order', message: '' }) }}>
                      Надіслати ще одне
                    </button>
                  </div>
                ) : (
                  <form className="contacts-form" onSubmit={handleSubmit}>
                    <div className="contacts-form__row">
                      <label className="contacts-form__label">
                        Ваше ім'я
                        <input className="contacts-form__input" type="text" placeholder="Олена Петренко" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
                      </label>
                    </div>
                    <div className="contacts-form__row">
                      <label className="contacts-form__label">
                        Телефон або email
                        <input className="contacts-form__input" type="text" placeholder="+380 67 671 45 10" value={form.contact} onChange={e => handleChange('contact', e.target.value)} required />
                      </label>
                    </div>
                    <div className="contacts-form__row">
                      <label className="contacts-form__label">
                        Тема
                        <select className="contacts-form__select" value={form.topic} onChange={e => handleChange('topic', e.target.value)}>
                          {TOPICS.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
                        </select>
                      </label>
                    </div>
                    <div className="contacts-form__row">
                      <label className="contacts-form__label">
                        Повідомлення
                        <textarea className="contacts-form__textarea" placeholder="Опишіть ваш запит..." rows={5} value={form.message} onChange={e => handleChange('message', e.target.value)} required />
                      </label>
                    </div>
                    <Button htmlType="submit" className="contacts-form__submit">Надіслати</Button>
                  </form>
                )}
              </div>
            </AnimatedSection>

            {/* Contact info */}
            <AnimatedSection direction="right">
              <div className="contacts-info">
                <h2 className="contacts-info__title">Зв'язатися напряму</h2>
                <div className="contacts-info__list">
                  {contactItems.map(item => (
                    <div key={item.label} className="contacts-info-item">
                      <p className="contacts-info-item__label">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="contacts-info-item__value contacts-info-item__value--link" target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                          {item.value}
                        </a>
                      ) : (
                        <span className="contacts-info-item__value">{item.value}</span>
                      )}
                      {item.sub && <p className="contacts-info-item__sub">{item.sub}</p>}
                      {item.messengers.length > 0 && (
                        <div className="contacts-info-item__messengers">
                          {item.messengers.map(m => (
                            <a key={m.label} href={m.href} className="contacts-info-item__msg-btn">{m.label}</a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </section>

      {/* ── Wholesale / schools block ── */}
      <section className="contacts-wholesale">
        <div className="contacts-container">
          <AnimatedSection direction="up">
            <div className="contacts-wholesale__card">
              <div className="contacts-wholesale__text">
                <p className="contacts-wholesale__label">{wholesale.eyebrow}</p>
                <h2 className="contacts-wholesale__title">{wholesale.title}</h2>
                <p className="contacts-wholesale__desc">{wholesale.desc}</p>
                <ul className="contacts-wholesale__list">
                  {wholesale.listItems.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="contacts-wholesale__actions">
                <a href={wholesale.viberHref} className="contacts-wholesale__btn">Написати у Viber</a>
                <a href={wholesale.telegramHref} className="contacts-wholesale__btn contacts-wholesale__btn--secondary">Написати у Telegram</a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  )
}
