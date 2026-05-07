import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { observer } from 'mobx-react-lite'
import { RootStoreContext, useRootStore } from './stores/RootStore'
import rootStore from './stores/RootStore'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home/Home'
import Catalog from './pages/Catalog/Catalog'
import Events from './pages/Events/Events'
import About from './pages/About/About'
import Contacts from './pages/Contacts/Contacts'
import ProductPage from './pages/ProductPage/ProductPage'
import Cart from './pages/Cart/Cart'
import CartFloat from './components/cart/CartFloat'
import CartToast from './components/ui/CartToast'
import ChatWidget from './components/chat/ChatWidget'
import ConstructorHub from './pages/ConstructorHub/ConstructorHub'
import RibbonConstructor from './pages/RibbonConstructor/RibbonConstructor'
import BadgeConstructor from './pages/BadgeConstructor/BadgeConstructor'
import CertificateConstructor from './pages/CertificateConstructor/CertificateConstructor'
import Checkout from './pages/Checkout/Checkout'
import OrderSuccess from './pages/OrderSuccess/OrderSuccess'
import Auth from './pages/Auth/Auth'
import Account from './pages/Account/Account'
import NotFound from './pages/NotFound/NotFound'
import OrderDetail from './pages/OrderDetail/OrderDetail'
import GuestOrders from './pages/GuestOrders/GuestOrders'
import InfoPage from './pages/InfoPage/InfoPage'
import VerifyEmail from './pages/VerifyEmail/VerifyEmail'
import Promotions from './pages/Promotions/Promotions'

const antdTheme = {
  token: {
    colorPrimary: '#e91e8c',
    colorLink: '#4f46e5',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    borderRadius: 8,
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
  },
}

function AppInner() {
  const { settings } = useRootStore()

  useEffect(() => { settings.load() }, [])

  if (settings.loaded && !settings.getBool('maintenance_mode', false)) {
    // maintenance_mode=true → render below is skipped, full-page message shown
  }

  if (settings.loaded && settings.getBool('maintenance_mode', false)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 24, textAlign: 'center' }}>
        <span style={{ fontSize: 48 }}>🔧</span>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Технічні роботи</h1>
        <p style={{ margin: 0, color: '#6b7280', maxWidth: 480 }}>
          {settings.get('maintenance_text', 'Сайт тимчасово недоступний. Спробуйте пізніше.')}
        </p>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <CartFloat />
      <CartToast />
      <ChatWidget />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/events" element={<Events />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/constructor" element={<ConstructorHub />} />
          <Route path="/constructor/ribbon" element={<RibbonConstructor />} />
          <Route path="/constructor/badge" element={<BadgeConstructor />} />
          <Route path="/constructor/certificate" element={<CertificateConstructor />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders/guest" element={<GuestOrders />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<Placeholder title="Відновлення паролю" />} />
          <Route path="/privacy" element={<InfoPage />} />
          <Route path="/terms" element={<InfoPage />} />
          <Route path="/delivery" element={<InfoPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

const AppInnerObserver = observer(AppInner)

function App() {
  return (
    <RootStoreContext.Provider value={rootStore}>
      <ConfigProvider theme={antdTheme}>
        <BrowserRouter>
          <AppInnerObserver />
        </BrowserRouter>
      </ConfigProvider>
    </RootStoreContext.Provider>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-xl">
      {title} — незабаром
    </div>
  )
}

export default App
