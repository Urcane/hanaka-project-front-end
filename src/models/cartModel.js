import { createId } from '../utils/id.js'
import { validateSchema, validators } from '../validation/customValidation.js'

export function validateCustomizationInput(product, values) {
  if (!product) {
    return { product: 'Produk tidak ditemukan.' }
  }

  const schema = {
    sizeId: [
      validators.required('Pilih ukuran cake.'),
      validators.oneOf(
        product.sizes.map((size) => size.id),
        'Ukuran cake tidak valid.',
      ),
    ],
    colorText: [
      validators.required('Warna kue wajib diisi.'),
      validators.maxLength(40, 'Warna kue maksimal 40 karakter.'),
    ],
    theme: [
      validators.maxLength(40, 'Tema kue maksimal 40 karakter.'),
    ],
    quantity: [
      validators.required('Jumlah wajib diisi.'),
      validators.numeric('Jumlah harus berupa angka.'),
      validators.minNumber(1, 'Jumlah minimal 1.'),
      validators.maxNumber(5, 'Jumlah maksimal 5.'),
    ],
    message: [
      validators.maxLength(
        product.maxMessageLength,
        `Catatan maksimal ${product.maxMessageLength} karakter.`,
      ),
    ],
  }

  return validateSchema(schema, values)
}

export function buildCartItem({
  product,
  sizeOption,
  colorText,
  theme,
  message,
  quantity,
}) {
  const safeQuantity = Math.max(1, Math.min(5, Number(quantity) || 1))

  return {
    id: createId('cart'),
    productId: product.id,
    productName: product.name,
    productDescription: product.shortDescription,
    productGradient: product.coverGradient,
    size: {
      id: sizeOption.id,
      label: sizeOption.label,
      price: sizeOption.price,
    },
    colorText: colorText.trim(),
    theme: (theme ?? '').trim(),
    message: message.trim(),
    quantity: safeQuantity,
    unitPrice: sizeOption.price,
    totalPrice: sizeOption.price * safeQuantity,
  }
}

export function rebuildCartItem(existingItem, { sizeOption, colorText, theme, message, quantity }) {
  const safeQuantity = Math.max(1, Math.min(5, Number(quantity) || 1))

  return {
    ...existingItem,
    size: {
      id: sizeOption.id,
      label: sizeOption.label,
      price: sizeOption.price,
    },
    colorText: colorText.trim(),
    theme: (theme ?? '').trim(),
    message: message.trim(),
    quantity: safeQuantity,
    unitPrice: sizeOption.price,
    totalPrice: sizeOption.price * safeQuantity,
  }
}

export function updateCartItemQuantity(item, quantity) {
  const safeQuantity = Math.max(1, Math.min(5, Number(quantity) || 1))

  return {
    ...item,
    quantity: safeQuantity,
    totalPrice: item.unitPrice * safeQuantity,
  }
}

export function computeCartSubtotal(items) {
  return items.reduce((total, item) => total + item.totalPrice, 0)
}
