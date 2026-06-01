import { Navigate } from 'react-router-dom'
import { useApp } from '../context/useApp.js'

function GuestRoute({ children }) {
  const { currentUser, isAuthLoading } = useApp()

  if (isAuthLoading) {
    return (
      <section className="panel stack-gap-md" style={{ textAlign: 'center' }}>
        <p>Memuat...</p>
      </section>
    )
  }

  if (currentUser) {
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}

export default GuestRoute
