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

export async function apiMarkOrderPaid(orderId) {
  const data = await api.patch(
    `/orders/${encodeURIComponent(orderId)}/pay`,
  )
  return data
}
