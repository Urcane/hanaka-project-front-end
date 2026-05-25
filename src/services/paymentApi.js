import { api } from './apiService.js'

export async function apiCreateQrisPayment(orderId) {
  const data = await api.post('/payments/qris', { orderId })
  return data.payment
}
