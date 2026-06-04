import {
  validateSchema,
  validators,
  when,
} from '../validation/customValidation.js'

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'CASH' },
  { id: 'qris', label: 'QRIS' },
]

export const PICKUP_METHODS = [
  { id: 'pickup', label: 'Pickup' },
  { id: 'delivery', label: 'Delivery' },
]

const checkoutSchema = {
  customerName: [
    validators.required('Nama pelanggan wajib diisi.'),
    validators.minLength(3, 'Nama pelanggan minimal 3 karakter.'),
  ],
  phone: [
    validators.required('Nomor pelanggan wajib diisi.'),
    validators.phoneId('Format nomor telepon tidak valid.'),
  ],
  pickupDate: [
    when(
      (values) => values.pickupMethod === 'pickup',
      validators.required('Tanggal pengambilan wajib diisi.'),
    ),
  ],
  pickupTime: [
    when(
      (values) => values.pickupMethod === 'pickup',
      validators.required('Jam pengambilan wajib diisi.'),
    ),
  ],
  address: [
    when(
      (values) => values.pickupMethod === 'delivery',
      validators.required('Alamat detail wajib diisi.'),
    ),
    validators.maxLength(220, 'Alamat maksimal 220 karakter.'),
  ],
  addressNote: [
    validators.maxLength(120, 'Catatan alamat maksimal 120 karakter.'),
  ],
  paymentMethod: [
    validators.required('Pilih metode pembayaran.'),
    validators.oneOf(
      PAYMENT_METHODS.map((method) => method.id),
      'Metode pembayaran tidak valid.',
    ),
  ],
}

export function validateCheckoutInput(values) {
  return validateSchema(checkoutSchema, values)
}

export function buildCheckoutPayload(values) {
  return {
    customerName: values.customerName.trim(),
    phone: String(values.phone).replace(/[\s-]/g, ''),
    pickupMethod: values.pickupMethod,
    pickupDate: values.pickupMethod === 'pickup' ? values.pickupDate : '',
    pickupTime: values.pickupMethod === 'pickup' ? values.pickupTime : '',
    address:
      values.pickupMethod === 'delivery' ? values.address.trim() : 'Ambil di toko',
    addressNote: values.addressNote?.trim() ?? '',
    paymentMethod: values.paymentMethod,
  }
}
