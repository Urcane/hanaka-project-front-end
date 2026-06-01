const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

let authToken = localStorage.getItem('hanaka_auth_token') || null
let sessionToken = localStorage.getItem('hanaka_session_token') || null

export function setAuthToken(token) {
  authToken = token
  localStorage.setItem('hanaka_auth_token', token)
}

export function clearAuthToken() {
  authToken = null
  localStorage.removeItem('hanaka_auth_token')
}

export function getSessionToken() {
  return sessionToken
}

export function setSessionToken(token) {
  sessionToken = token
  localStorage.setItem('hanaka_session_token', token)
}

async function request(method, path, body = null) {
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  }

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

export async function apiUpload(path, formData) {
  const headers = { 'ngrok-skip-browser-warning': 'true' }
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`
  if (sessionToken) headers['X-Session-Token'] = sessionToken

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })
  const data = await res.json()

  if (!res.ok) {
    const error = new Error(data.error || 'Terjadi kesalahan.')
    error.status = res.status
    error.errors = data.errors || {}
    throw error
  }

  return data
}
