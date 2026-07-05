import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import GuestRoute from './components/GuestRoute.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import CustomizeCakePage from './pages/CustomizeCakePage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MenuPage from './pages/MenuPage.jsx'
import OrderHistoryPage from './pages/OrderHistoryPage.jsx'
import PaymentQrisPage from './pages/PaymentQrisPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import TrackOrderPage from './pages/TrackOrderPage.jsx'
import MenuKhususPage from './pages/MenuKhususPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  )
}

export default App
