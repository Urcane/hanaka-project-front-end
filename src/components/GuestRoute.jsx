import { Navigate } from 'react-router-dom'
import { useApp } from '../context/useApp.js'

function GuestRoute({ children }) {
  const { currentUser } = useApp()

  if (currentUser) {
    return <Navigate to="/" replace />
  }

  return children
}

export default GuestRoute
