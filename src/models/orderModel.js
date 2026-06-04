import { computeCartSubtotal } from './cartModel.js'
import { createId, createOrderNumber } from '../utils/id.js'

export function createOrder({ user, items, checkout }) {
  const totalPrice = computeCartSubtotal(items)
  const createdAt = new Date().toISOString()

  return {
    id: createId('ord'),
    orderNumber: createOrderNumber(),
    userId: user?.id ?? null,
    customerName: checkout.customerName,
    customerPhone: checkout.phone,
    fulfillmentMethod: checkout.pickupMethod,
    deliveryAddress: checkout.address,
    paymentMethod: checkout.paymentMethod,
    paymentStatus: checkout.paymentMethod === 'qris' ? 'pending' : 'cod',
    status: 'menunggu konfirmasi',
    notes: checkout.notes,
    items,
    totalPrice,
    createdAt,
  }
}

export function markOrderAsPaid(order) {
  return {
    ...order,
    paymentStatus: 'paid',
    status: 'diproses',
  }
}
