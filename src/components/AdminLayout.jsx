import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import logoImg from '../assets/logo.png'

const sidebarItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/products', label: 'Products', icon: '🎂' },
  { to: '/admin/customers', label: 'Customers', icon: '👥' },
]

function AdminLayout() {
  const { currentUser, logoutAccount } = useApp()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutAccount()
    navigate('/login')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img src={logoImg} alt="Hanaka Cake" className="admin-logo" />
          <span className="admin-brand-text">Hanaka Admin</span>
        </div>

        <nav className="admin-nav">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? ' is-active' : ''}`
              }
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <p className="admin-user-name">{currentUser?.fullName}</p>
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
