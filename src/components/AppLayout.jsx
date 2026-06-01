import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import SiteFooter from './SiteFooter.jsx'
import logoImg from '../assets/logo.png'

const centerNavItems = [
  { to: '/menu', label: 'MENU' },
  { to: '/cart', label: 'KERANJANG' },
  { to: '/checkout', label: 'CHECKOUT' },
]

function AppLayout() {
  const { currentUser, cartItemCount, logoutAccount } = useApp()
  const navigate = useNavigate()

  const firstName = currentUser?.fullName.split(' ')[0] ?? 'Customer'

  const handleLogout = () => {
    logoutAccount()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="header-logo">
          <img src={logoImg} alt="Hanaka Cake" className="logo-img" />
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          {centerNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link${isActive ? ' is-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {currentUser && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `nav-link${isActive ? ' is-active' : ''}`
              }
            >
              ORDERS
            </NavLink>
          )}
        </nav>

        <div className="header-tools">
          {currentUser?.role === 'admin' && (
            <Link to="/admin/dashboard" className="ghost-button">
              Admin Panel
            </Link>
          )}
          <Link to="/cart" className="cart-icon-link" aria-label="Keranjang">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </Link>

          {currentUser ? (
            <>
              <p className="user-chip">Hi, {firstName}</p>
              <button
                type="button"
                className="ghost-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-pill-button">
              Login
            </Link>
          )}
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}

export default AppLayout
