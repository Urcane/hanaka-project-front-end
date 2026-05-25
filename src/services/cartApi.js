import { api, setSessionToken } from './apiService.js'

export async function apiFetchCart() {
  const data = await api.get('/cart')
  return data
}

export async function apiAddCartItem(payload) {
  const data = await api.post('/cart/items', payload)
  if (data.sessionToken) {
    setSessionToken(data.sessionToken)
  }
  return data
}

export async function apiUpdateCartItem(itemId, payload) {
  const data = await api.put(`/cart/items/${encodeURIComponent(itemId)}`, payload)
  return data
}

export async function apiUpdateCartItemQuantity(itemId, quantity) {
  const data = await api.patch(
    `/cart/items/${encodeURIComponent(itemId)}/quantity`,
    { quantity },
  )
  return data
}

export async function apiRemoveCartItem(itemId) {
  await api.delete(`/cart/items/${encodeURIComponent(itemId)}`)
}

export async function apiClearCart() {
  await api.delete('/cart')
}
