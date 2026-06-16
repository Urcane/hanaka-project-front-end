import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { goToAdminPanel } from '../utils/adminHandoff.js'

function GuestRoute({ children }) {
  const { currentUser, isAuthLoading } = useApp()
  const isAdmin = currentUser?.role === 'admin'

  // An already-authenticated admin landing on /login or /register is handed off
  // to the server-rendered backend admin panel.
  useEffect(() => {
    if (isAdmin) {
      goToAdminPanel()
    }
  }, [isAdmin])

  if (isAuthLoading) {
    return (
      <section className="panel stack-gap-md" style={{ textAlign: 'center' }}>
        <p>Memuat...</p>
      </section>
    )
  }

  if (currentUser) {
    if (isAdmin) {
      return (
        <section className="panel stack-gap-md" style={{ textAlign: 'center' }}>
          <p>Mengarahkan ke Admin Panel...</p>
        </section>
      )
    }
    return <Navigate to="/" replace />
  }

  return children
}

export default GuestRoute
