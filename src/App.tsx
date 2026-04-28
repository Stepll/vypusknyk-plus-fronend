import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { RootStoreContext } from './stores/RootStore'
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
import Checkout from './pages/Checkout/Checkout'
import OrderSuccess from './pages/OrderSuccess/OrderSuccess'
import Auth from './pages/Auth/Auth'
import Account from './pages/Account/Account'
import NotFound from './pages/NotFound/NotFound'
import OrderDetail from './pages/OrderDetail/OrderDetail'
import GuestOrders from './pages/GuestOrders/GuestOrders'
import InfoPage from './pages/InfoPage/InfoPage'

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

function App() {
  return (
    <RootStoreContext.Provider value={rootStore}>
      <ConfigProvider theme={antdTheme}>
        <BrowserRouter>
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
              <Route path="/about" element={<About />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/constructor" element={<ConstructorHub />} />
              <Route path="/constructor/ribbon" element={<RibbonConstructor />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/orders/guest" element={<GuestOrders />} />
              <Route path="/forgot-password" element={<Placeholder title="Відновлення паролю" />} />
              <Route path="/privacy" element={<InfoPage />} />
              <Route path="/terms" element={<InfoPage />} />
              <Route path="/delivery" element={<InfoPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
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
