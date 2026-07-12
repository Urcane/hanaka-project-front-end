import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import GuestRoute from './components/GuestRoute.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import CustomizeCakePage from './pages/CustomizeCakePage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import LogoutPage from './pages/LogoutPage.jsx'
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
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:productId" element={<CustomizeCakePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/:orderId" element={<PaymentQrisPage />} />
        <Route path="/lacak" element={<TrackOrderPage />} />
        <Route path="/menu-khusus" element={<MenuKhususPage />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      <Route path="/logout" element={<LogoutPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
