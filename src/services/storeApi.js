import { api } from './apiService.js'

export async function fetchStoreProfile() {
  const data = await api.get('/store/profile')
  return data.store
}
