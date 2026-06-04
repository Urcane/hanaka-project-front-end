import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/useApp.js'

function ProtectedRoute({ children }) {
  const { currentUser } = useApp()
  const location = useLocation()

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ redirectTo: location.pathname + location.search }}
      />
    )
  }

  return children
}

export default ProtectedRoute
