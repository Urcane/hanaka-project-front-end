import { api, apiUpload } from './apiService.js'

export async function fetchDashboard() {
  const data = await api.get('/admin/dashboard')
  return data.dashboard
}

export async function fetchAdminOrders(params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.paymentStatus) query.set('paymentStatus', params.paymentStatus)
  if (params.limit) query.set('limit', String(params.limit))
  if (params.offset) query.set('offset', String(params.offset))
  const qs = query.toString()
  const data = await api.get(`/admin/orders${qs ? `?${qs}` : ''}`)
  return data
}

export async function fetchAdminOrderById(orderId) {
  const data = await api.get(`/admin/orders/${encodeURIComponent(orderId)}`)
  return data.order
}

export async function updateOrderStatus(orderId, status) {
  const data = await api.patch(
    `/admin/orders/${encodeURIComponent(orderId)}/status`,
    { status },
  )
  return data.order
}

export async function updateOrderPaymentStatus(orderId, paymentStatus) {
  const data = await api.patch(
    `/admin/orders/${encodeURIComponent(orderId)}/payment-status`,
    { paymentStatus },
  )
  return data.order
}

export async function fetchAdminCustomers() {
  const data = await api.get('/admin/customers')
  return data.customers
}

export async function createProduct(payload) {
  const data = await api.post('/admin/products', payload)
  return data.product
}

export async function updateProduct(productId, payload) {
  const data = await api.put(
    `/admin/products/${encodeURIComponent(productId)}`,
    payload,
  )
  return data.product
}

export async function deleteProduct(productId) {
  await api.delete(`/admin/products/${encodeURIComponent(productId)}`)
}

export async function addProductSize(productId, payload) {
  const data = await api.post(
    `/admin/products/${encodeURIComponent(productId)}/sizes`,
    payload,
  )
  return data.size
}

export async function updateProductSize(productId, sizeId, payload) {
  const data = await api.put(
    `/admin/products/${encodeURIComponent(productId)}/sizes/${encodeURIComponent(sizeId)}`,
    payload,
  )
  return data.size
}

export async function deleteProductSize(productId, sizeId) {
  await api.delete(
    `/admin/products/${encodeURIComponent(productId)}/sizes/${encodeURIComponent(sizeId)}`,
  )
}

export async function uploadProductImage(productId, file) {
  const formData = new FormData()
  formData.append('image', file)
  const data = await apiUpload(`/admin/products/${encodeURIComponent(productId)}/image`, formData)
  return data.product
}
