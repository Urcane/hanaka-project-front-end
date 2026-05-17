import { cakeCatalog } from '../data/products.js'

export function getAllProducts() {
  return cakeCatalog
}

export function getFeaturedProducts() {
  return cakeCatalog.filter((product) => product.featured)
}

export function findProductById(productId) {
  return cakeCatalog.find((product) => product.id === productId) ?? null
}

export function findSizeOption(product, sizeId) {
  return product.sizes.find((size) => size.id === sizeId) ?? null
}

export function getProductStartingPrice(product) {
  const prices = product.sizes.map((size) => size.price)
  return Math.min(...prices)
}

export function calculateUnitPrice(product, sizeId) {
  const sizeOption = findSizeOption(product, sizeId)
  return sizeOption ? sizeOption.price : 0
}
