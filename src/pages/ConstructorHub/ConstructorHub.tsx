import { Link } from 'react-router-dom'
import { Button } from 'antd'
import RibbonPreview from '../../components/ui/RibbonPreview'
import './ConstructorHub.css'

const CONSTRUCTORS = [
  {
    key: 'ribbon',
    href: '/constructor/ribbon',
    title: 'Стрічка',
    description: 'Оберіть колір, введіть імена, додайте емблему — і побачте результат у реальному часі.',
    available: true,
  },
  {
    key: 'medal',
    href: '/constructor/medal',
    title: 'Медаль',
    description: 'Налаштуйте покриття, текст гравіювання та персональні дані для кожного учня.',
    available: false,
  },
  {
    key: 'cert',
    href: '/constructor/cert',
    title: 'Грамота',
    description: 'Оберіть вид паперу, введіть назву нагороди та дані — отримайте готовий макет.',
    available: false,
  },
]

function RibbonIllustration() {
  return (
    <div className="hub-card__ribbon-preview">
      <RibbonPreview name="Іваненко Марія" variant="coral" emblemKey={0} />
    </div>
  )
}

function MedalIllustration() {
  return (
    <div className="hub-card__illustration hub-card__illustration--medal">
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="72" r="36" fill="#f0d060" opacity="0.9" />
        <circle cx="60" cy="72" r="28" fill="none" stroke="#c9a84c" strokeWidth="3" />
        <text x="60" y="68" textAnchor="middle" fontSize="10" fill="#7a5c10" fontWeight="700">Випускник</text>
        <text x="60" y="82" textAnchor="middle" fontSize="9" fill="#7a5c10">2026</text>
        <rect x="52" y="20" width="16" height="24" rx="3" fill="#c9a84c" />
        <rect x="48" y="16" width="24" height="8" rx="2" fill="#b8922a" />
      </svg>
    </div>
  )
}

function CertIllustration() {
  return (
    <div className="hub-card__illustration hub-card__illustration--cert">
      <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="84" height="114" rx="6" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2" />
        <rect x="16" y="20" width="68" height="6" rx="3" fill="#fce7f3" />
        <rect x="24" y="34" width="52" height="4" rx="2" fill="#f3f4f6" />
        <rect x="28" y="44" width="44" height="4" rx="2" fill="#f3f4f6" />
        <rect x="20" y="58" width="60" height="3" rx="1.5" fill="#e5e7eb" />
        <rect x="20" y="66" width="60" height="3" rx="1.5" fill="#e5e7eb" />
        <rect x="20" y="74" width="40" height="3" rx="1.5" fill="#e5e7eb" />
        <circle cx="50" cy="98" r="10" fill="#fce7f3" />
        <path d="M44 98 L48 102 L56 94" stroke="#e91e8c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function ConstructorHub() {
  return (
    <div className="hub-page">
      <div className="hub-top-band">
        <div className="hub-container">
          <nav className="hub-breadcrumbs">
            <Link to="/" className="hub-breadcrumbs__link">Головна</Link>
            <span className="hub-breadcrumbs__sep">/</span>
            <span className="hub-breadcrumbs__current">Конструктори</span>
          </nav>
          <div className="hub-hero">
            <h1 className="hub-hero__title">Конструктори</h1>
            <p className="hub-hero__sub">
              Налаштуйте продукт під себе — побачте результат ще до замовлення
            </p>
          </div>
        </div>
      </div>

      <div className="hub-container">
        {/* Ribbon — full row */}
        <div className="hub-card hub-card--wide">
          <div className="hub-card--wide__inner">
            <RibbonIllustration />
            <div className="hub-card__body">
              <div className="hub-card__header">
                <h2 className="hub-card__title">Стрічка</h2>
              </div>
              <p className="hub-card__desc">
                Оберіть колір, введіть імена, додайте емблему — і побачте результат у реальному часі.
              </p>
              <Link to="/constructor/ribbon">
                <Button type="primary" className="hub-card__btn">
                  Відкрити конструктор
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Medal + Cert — two columns */}
        <div className="hub-grid-two">
          {[CONSTRUCTORS[1], CONSTRUCTORS[2]].map(c => (
            <div key={c.key} className="hub-card hub-card--soon">
              {c.key === 'medal' && <MedalIllustration />}
              {c.key === 'cert' && <CertIllustration />}
              <div className="hub-card__body">
                <div className="hub-card__header">
                  <h2 className="hub-card__title">{c.title}</h2>
                  <span className="hub-card__soon-badge">Незабаром</span>
                </div>
                <p className="hub-card__desc">{c.description}</p>
                <Button className="hub-card__btn" disabled>
                  Відкрити конструктор
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
