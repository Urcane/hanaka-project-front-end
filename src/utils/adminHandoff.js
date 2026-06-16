// Admin panel lives in the PHP backend (server-rendered). The customer auth
// flow stays here on the React frontend; once a user authenticates as admin we
// hand the SAME JWT off to the backend via a one-time redirect. The backend
// verifies it and stores it in an HttpOnly cookie, so the session is shared
// across the two projects.

const ADMIN_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '')

// Build the backend handoff URL carrying the current JWT (from localStorage).
export function getAdminHandoffUrl() {
  const token = localStorage.getItem('hanaka_auth_token') || ''
  return `${ADMIN_BASE}/admin/login?token=${encodeURIComponent(token)}`
}

// Full-page navigation to the backend admin panel.
export function goToAdminPanel() {
  window.location.href = getAdminHandoffUrl()
}
