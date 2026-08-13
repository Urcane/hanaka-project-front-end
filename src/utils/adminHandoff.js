// Admin panel lives in the PHP backend (server-rendered). The customer auth
// flow stays here on the React frontend; once a user authenticates as admin we
// hand the SAME JWT off to the backend via a one-time redirect. The backend
// verifies it and stores it in an HttpOnly cookie, so the session is shared
// across the two projects.

const ADMIN_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '')

// Roles that belong in a backend panel instead of the storefront. Both go
// through the same handoff route — the backend reads the role from the JWT and
// sends admins to /admin/dashboard and owners to /owner/dashboard.
export const STAFF_ROLES = ['admin', 'owner']

export function isStaffRole(role) {
  return STAFF_ROLES.includes(role)
}

// Build the backend handoff URL carrying the current JWT (from localStorage).
export function getAdminHandoffUrl() {
  const token = localStorage.getItem('hanaka_auth_token') || ''
  return `${ADMIN_BASE}/admin/login?token=${encodeURIComponent(token)}`
}

// Full-page navigation to the backend panel that matches the user's role.
export function goToAdminPanel() {
  window.location.href = getAdminHandoffUrl()
}
