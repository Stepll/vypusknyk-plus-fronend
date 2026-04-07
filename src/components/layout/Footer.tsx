import { Link } from 'react-router-dom'
import './Footer.css'

const PHONE = '+380 (67) 671-45-10'
const PHONE_HREF = 'tel:+380676714510'
const EMAIL = 'vypusk.org@gmail.com'
const VIBER_HREF = 'viber://chat?number=%2B380676714510'
const TELEGRAM_HREF = 'https://t.me/+380676714510'
const INSTAGRAM_HREF = 'https://www.instagram.com/vypusk_org/'

function ViberIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.994 2C7.277 2 3.5 5.453 3.5 9.726c0 2.34 1.14 4.432 2.94 5.855v2.97a.5.5 0 0 0 .823.38l2.395-2.007c.767.15 1.56.226 2.36.226 4.716 0 8.482-3.453 8.482-7.724C20.5 5.453 16.71 2 11.994 2zm3.658 10.016l-.902.906a.74.74 0 0 1-.607.21c-1.758-.186-3.348-.963-4.585-2.2-1.238-1.238-2.015-2.828-2.2-4.586a.74.74 0 0 1 .21-.607l.906-.902a.75.75 0 0 1 1.04.02l1.29 1.594a.75.75 0 0 1-.03 1.01l-.553.555a5.37 5.37 0 0 0 2.43 2.432l.553-.553a.75.75 0 0 1 1.01-.03l1.594 1.29a.75.75 0 0 1 .02 1.04l.824-.18z" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__container">

        <div className="footer__grid">

          {/* Brand */}
          <div className="footer__brand">
            <span className="footer__logo">Випускник +</span>
            <p className="footer__tagline">
              Кастомні стрічки, медалі та аксесуари для шкільних свят. Виготовляємо з любов'ю з 2016 року.
            </p>
            <div className="footer__socials">
              <a href={INSTAGRAM_HREF} target="_blank" rel="noreferrer" className="footer__social-link" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href={VIBER_HREF} className="footer__social-link" aria-label="Viber">
                <ViberIcon />
              </a>
              <a href={TELEGRAM_HREF} target="_blank" rel="noreferrer" className="footer__social-link" aria-label="Telegram">
                <TelegramIcon />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="footer__col">
            <p className="footer__col-title">Навігація</p>
            <nav className="footer__nav">
              <Link to="/" className="footer__nav-link">Головна</Link>
              <Link to="/catalog" className="footer__nav-link">Каталог</Link>
              <Link to="/constructor" className="footer__nav-link">Конструктор стрічок</Link>
              <Link to="/about" className="footer__nav-link">Про нас</Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="footer__col">
            <p className="footer__col-title">Інформація</p>
            <nav className="footer__nav">
              <Link to="/privacy" className="footer__nav-link">Політика конфіденційності</Link>
              <Link to="/terms" className="footer__nav-link">Умови використання</Link>
              <Link to="/delivery" className="footer__nav-link">Доставка та оплата</Link>
            </nav>
          </div>

          {/* Contacts */}
          <div className="footer__col">
            <p className="footer__col-title">Контакти</p>
            <div className="footer__contacts">
              <a href={PHONE_HREF} className="footer__contact-link">
                {PHONE}
              </a>
              <a href={`mailto:${EMAIL}`} className="footer__contact-link">
                {EMAIL}
              </a>
              <p className="footer__working-hours">
                Пн–Пт, 9:00–18:00
              </p>
              <div className="footer__messengers">
                <a href={VIBER_HREF} className="footer__messenger-btn">Viber</a>
                <a href={TELEGRAM_HREF} target="_blank" rel="noreferrer" className="footer__messenger-btn">Telegram</a>
              </div>
            </div>
          </div>

        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {year} ФОП Кобрій Андрій Васильович. Усі права захищені.
          </p>
        </div>

      </div>
    </footer>
  )
}
