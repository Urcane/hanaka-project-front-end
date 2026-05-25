import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/useApp.js'

function AdminRoute({ children }) {
  const { currentUser, isAuthLoading } = useApp()
  const location = useLocation()

  if (isAuthLoading) {
    return (
      <section className="admin-loading">
        <p>Memuat...</p>
      </section>
    )
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ redirectTo: location.pathname }}
      />
    )
  }

  return children
}

export default AdminRoute
