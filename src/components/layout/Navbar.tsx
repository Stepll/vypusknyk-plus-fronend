import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/RootStore'
import { NAV_LINKS } from '../../constants/nav'
import './Navbar.css'

const Navbar = observer(function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastScrollY = useRef(0)
  const location = useLocation()
  const navigate = useNavigate()
  const { cart, auth } = useRootStore()

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY
      setScrolled(currentY > 20)
      setHidden(currentY > lastScrollY.current && currentY > 80)
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const isLight = !scrolled

  return (
    <motion.header
      className={`navbar ${scrolled ? 'navbar--scrolled' : 'navbar--transparent'}`}
      animate={{ y: hidden ? -80 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      initial={{ y: -80 }}
    >
      <div className="navbar__inner">
        <Link
          to="/"
          className={`navbar__logo ${isLight ? 'navbar__logo--light' : 'navbar__logo--dark'}`}
        >
          Випускник +
        </Link>

        <nav className="navbar__nav">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={`navbar__link ${
                location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href + '/'))
                  ? isLight ? 'navbar__link--active-light' : 'navbar__link--active-dark'
                  : isLight ? 'navbar__link--light' : 'navbar__link--dark'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="navbar__actions">
          <Link to="/cart" className={`navbar__icon-btn ${isLight ? 'navbar__icon-btn--light' : 'navbar__icon-btn--dark'}`} aria-label="Корзина">
            <ShoppingCartOutlined />
            {cart.totalQty > 0 && (
              <span className="navbar__cart-badge">{cart.totalQty}</span>
            )}
          </Link>
          {auth.isLoggedIn ? (
            <button
              className={`navbar__user-btn ${isLight ? 'navbar__icon-btn--light' : 'navbar__icon-btn--dark'}`}
              onClick={() => navigate('/account')}
              aria-label="Особистий кабінет"
            >
              <UserOutlined />
              <span className="navbar__user-name">{auth.user!.name}</span>
            </button>
          ) : (
            <>
              <button
                className={`navbar__icon-btn ${isLight ? 'navbar__icon-btn--light' : 'navbar__icon-btn--dark'}`}
                onClick={() => navigate('/orders/guest')}
                aria-label="Мої замовлення"
                style={{ fontSize: 13, gap: 4 }}
              >
                Замовлення
              </button>
              <button
                className={`navbar__icon-btn ${isLight ? 'navbar__icon-btn--light' : 'navbar__icon-btn--dark'}`}
                onClick={() => navigate('/auth')}
                aria-label="Увійти"
              >
                <UserOutlined />
              </button>
            </>
          )}
        </div>

        <button
          className="navbar__burger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Відкрити меню"
        >
          <span
            className="navbar__burger-line"
            style={{
              background: isLight ? '#fff' : '#374151',
              transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
            }}
          />
          <span
            className="navbar__burger-line"
            style={{
              background: isLight ? '#fff' : '#374151',
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="navbar__burger-line"
            style={{
              background: isLight ? '#fff' : '#374151',
              transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
            }}
          />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="navbar__mobile-nav">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`navbar__mobile-link ${
                    location.pathname === link.href ? 'navbar__mobile-link--active' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/cart" className="navbar__mobile-link">
                Корзина {cart.totalQty > 0 && `(${cart.totalQty})`}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
})

export default Navbar
