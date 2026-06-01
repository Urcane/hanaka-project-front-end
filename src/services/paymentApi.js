import { api } from './apiService.js'

export async function apiCreateQrisPayment(orderId) {
  const data = await api.post('/payments/qris', { orderId })
  return data.payment
}

export async function apiCheckQrisStatus(orderId) {
  const data = await api.get(
    `/payments/qris/status?orderId=${encodeURIComponent(orderId)}`,
  )
  return data
}
