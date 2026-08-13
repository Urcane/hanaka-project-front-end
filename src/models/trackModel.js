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

// ── Progress pesanan ──
// Status di backend: menunggu konfirmasi → diproses → siap diambil|diantar →
// selesai, dengan "dibatalkan" sebagai jalur terhenti.

export const CANCELLED_STATUS = 'dibatalkan'

const PICKUP_FLOW = [
  { status: 'menunggu konfirmasi', label: 'Menunggu konfirmasi' },
  { status: 'diproses', label: 'Diproses' },
  { status: 'siap diambil', label: 'Siap diambil' },
  { status: 'selesai', label: 'Selesai' },
]

const DELIVERY_FLOW = [
  { status: 'menunggu konfirmasi', label: 'Menunggu konfirmasi' },
  { status: 'diproses', label: 'Diproses' },
  { status: 'diantar', label: 'Diantar' },
  { status: 'selesai', label: 'Selesai' },
]

export function isCancelled(order) {
  return order?.status === CANCELLED_STATUS
}

export function getOrderFlow(order) {
  return order?.fulfillmentMethod === 'delivery' ? DELIVERY_FLOW : PICKUP_FLOW
}

/**
 * Ubah status order jadi daftar langkah dengan state 'done' | 'current' | 'todo'.
 * Order yang dibatalkan tidak punya langkah aktif.
 */
export function getTrackingSteps(order) {
  const flow = getOrderFlow(order)
  const cancelled = isCancelled(order)
  const currentIndex = flow.findIndex((step) => step.status === order?.status)

  return flow.map((step, index) => {
    if (cancelled) {
      return { ...step, state: 'todo' }
    }
    if (index < currentIndex) return { ...step, state: 'done' }
    if (index === currentIndex) return { ...step, state: 'current' }
    return { ...step, state: 'todo' }
  })
}

/**
 * Perkiraan posisi kurir sebagai rasio 0–1 pada garis toko → alamat.
 *
 * CATATAN: ini estimasi dari status pesanan, bukan GPS kurir sungguhan —
 * sistem belum melacak posisi kurir secara real-time.
 */
export function getCourierProgress(order) {
  switch (order?.status) {
    case 'diproses':
      return 0.12
    case 'siap diambil':
      return 0.2
    case 'diantar':
      return 0.6
    case 'selesai':
      return 1
    default:
      return 0
  }
}

export function hasDeliveryPoint(order) {
  return (
    order?.fulfillmentMethod === 'delivery' &&
    typeof order?.deliveryLat === 'number' &&
    typeof order?.deliveryLng === 'number'
  )
}
