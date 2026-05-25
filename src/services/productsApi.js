import { api } from './apiService.js'

export async function fetchProducts(featured) {
  const query = featured ? '?featured=true' : ''
  const data = await api.get(`/products${query}`)
  return data.products
}

export async function fetchProductById(productId) {
  const data = await api.get(`/products/${encodeURIComponent(productId)}`)
  return data.product
}
