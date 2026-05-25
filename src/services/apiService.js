const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

let authToken = null
let sessionToken = localStorage.getItem('hanaka_session_token') || null

export function setAuthToken(token) {
  authToken = token
}

export function clearAuthToken() {
  authToken = null
}

export function getSessionToken() {
  return sessionToken
}

export function setSessionToken(token) {
  sessionToken = token
  localStorage.setItem('hanaka_session_token', token)
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  if (sessionToken) {
    headers['X-Session-Token'] = sessionToken
  }

  const options = { method, headers }
  if (body) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE}${path}`, options)
  const data = await res.json()

  if (!res.ok) {
    const error = new Error(data.error || 'Terjadi kesalahan.')
    error.status = res.status
    error.errors = data.errors || {}
    throw error
  }

  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
}
