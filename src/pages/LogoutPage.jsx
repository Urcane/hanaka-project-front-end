import { useEffect } from 'react'
import { useApp } from '../context/useApp.js'

// Dedicated logout route. The backend admin panel redirects here on logout so
// the JWT kept in localStorage gets cleared too — clearing only the backend
// cookie would leave the still-valid token here, letting the admin get handed
// straight back into the panel. A full-page redirect to /login (instead of a
// client-side navigate) restarts AppContext with no token, avoiding any race
// with the in-flight apiGetMe() from the initial mount.
function LogoutPage() {
  const { logoutAccount } = useApp()

  useEffect(() => {
    logoutAccount().finally(() => {
      window.location.replace('/login')
    })
  }, [logoutAccount])

  return (
    <section className="panel stack-gap-md" style={{ textAlign: 'center' }}>
      <p>Keluar dari akun...</p>
    </section>
  )
}

export default LogoutPage
