import browniesImg from '../assets/brownies.jpg'
import strawberryImg from '../assets/strawberry-cake.jpg'

const imageMap = {
  'brownies.jpg': browniesImg,
  'strawberry-cake.jpg': strawberryImg,
}

export function resolveProductImage(coverImage) {
  if (!coverImage) return null
  return imageMap[coverImage] || null
}
