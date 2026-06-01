import browniesImg from '../assets/brownies.jpg'
import strawberryImg from '../assets/strawberry-cake.jpg'

const localImageMap = {
  'brownies.jpg': browniesImg,
  'strawberry-cake.jpg': strawberryImg,
}

const BACKEND_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '')

export function resolveProductImage(coverImage) {
  if (!coverImage) return null
  if (coverImage.startsWith('uploads/')) {
    return `${BACKEND_BASE}/${coverImage}`
  }
  return localImageMap[coverImage] || null
}
