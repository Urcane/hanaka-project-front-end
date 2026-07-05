import { api } from './apiService.js'

export async function apiPlaceOrder(payload) {
  const data = await api.post('/orders', payload)
  return data
}

export async function apiFetchOrders() {
  const data = await api.get('/orders')
  return data.orders
}

export async function apiFetchOrderById(orderId) {
  const data = await api.get(`/orders/${encodeURIComponent(orderId)}`)
  return data.order
}

export async function apiTrackOrder(orderNumber) {
  const data = await api.get(
    `/orders/track?number=${encodeURIComponent(orderNumber)}`, // Misalnya: HNK-20260624-103000-123
  )
  return data.order
}

export async function apiMarkOrderPaid(orderId) {
  const data = await api.patch(
    `/orders/${encodeURIComponent(orderId)}/pay`,
  )
  return data
}
