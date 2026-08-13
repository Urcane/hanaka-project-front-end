export function getAllProducts(products) {
  return products
}

export function getFeaturedProducts(products) {
  return products.filter((product) => product.featured)
}

export function findProductById(products, productId) {
  return products.find((product) => product.id === productId) ?? null
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

// ── Stok ──
// Backend mengirim `stock` per ukuran (product_sizes.stock). Helper di bawah
// dipakai bersama oleh MenuPage dan CustomizeCakePage.

export function getSizeStock(sizeOption) {
  return Math.max(0, Number(sizeOption?.stock ?? 0))
}

export function isSizeAvailable(sizeOption) {
  return getSizeStock(sizeOption) > 0
}

export function getProductTotalStock(product) {
  return (product?.sizes ?? []).reduce(
    (total, size) => total + getSizeStock(size),
    0,
  )
}

export function isProductAvailable(product) {
  return getProductTotalStock(product) > 0
}

export function findFirstAvailableSize(product) {
  return (product?.sizes ?? []).find(isSizeAvailable) ?? null
}

// Batas kuantitas yang boleh dipilih: aturan toko (maks 5) dibatasi lagi oleh
// stok nyata yang tersisa.
export function getMaxOrderableQuantity(sizeOption, maxPerOrder = 5) {
  return Math.min(maxPerOrder, getSizeStock(sizeOption))
}
