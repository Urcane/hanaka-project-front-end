import { validateSchema, validators } from '../validation/customValidation.js'

// Nomor pesanan dibuat di utils/id.js: HNK-YYYYMMDD-HHMMSS-NNN
const ORDER_NUMBER_REGEX = /^HNK-\d{8}-\d{6}-\d{3}$/

export function normalizeOrderNumber(value) {
  return String(value).trim().toUpperCase() // rapikan: buang spasi, huruf besar
}

// Validator custom inline: (value) => string | null.
// Skip kalau kosong → biar `required` yang menangani (pola sama dgn validator bawaan).
function orderNumberFormat(message) {
  return (value) => {
    if (!value) return null
    return ORDER_NUMBER_REGEX.test(normalizeOrderNumber(value)) ? null : message
  }
}

const trackSchema = {
  orderNumber: [
    validators.required('Nomor pesanan wajib diisi.'),
    orderNumberFormat(
      'Format nomor pesanan tidak sesuai (contoh: HNK-20260624-103000-123).',
    ),
  ],
}

export function validateTrackInput(values) {
  return validateSchema(trackSchema, values)
}
