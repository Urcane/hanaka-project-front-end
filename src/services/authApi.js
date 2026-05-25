import { api, setAuthToken, clearAuthToken } from './apiService.js'

export async function apiRegister(data) {
  const result = await api.post('/auth/register', data)
  setAuthToken(result.token)
  return result
}

export async function apiLogin(data) {
  const result = await api.post('/auth/login', data)
  setAuthToken(result.token)
  return result
}

export async function apiLogout() {
  try {
    await api.post('/auth/logout')
  } finally {
    clearAuthToken()
  }
}

export async function apiGetMe() {
  const result = await api.get('/auth/me')
  return result.user
}
