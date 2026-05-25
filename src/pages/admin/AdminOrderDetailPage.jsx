import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  fetchAdminOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
} from '../../services/adminApi.js'
import { formatRupiah } from '../../utils/currency.js'

const ORDER_STATUSES = [
  'menunggu konfirmasi',
  'diproses',
  'siap diambil',
  'diantar',
  'selesai',
  'dibatalkan',
]

const PAYMENT_STATUSES = ['pending', 'paid', 'cod']

function AdminOrderDetailPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    fetchAdminOrderById(orderId)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [orderId])

  const handleStatusChange = async (newStatus) => {
    setActionError('')
    try {
      const updated = await updateOrderStatus(orderId, newStatus)
      setOrder(updated)
    } catch (err) {
      setActionError(err.message)
    }
  }

  const handlePaymentStatusChange = async (newStatus) => {
    setActionError('')
    try {
      const updated = await updateOrderPaymentStatus(orderId, newStatus)
      setOrder(updated)
    } catch (err) {
      setActionError(err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-page">
        <p>Memuat order...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <h1>Order tidak ditemukan</h1>
        <p className="submit-error">{error}</p>
        <Link to="/admin/orders" className="admin-link">← Kembali</Link>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <Link to="/admin/orders" className="admin-back-link">← Kembali ke Orders</Link>

      <h1>Order {order.orderNumber}</h1>

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h3>Informasi Customer</h3>
          <p><strong>Nama:</strong> {order.customerName}</p>
          <p><strong>Telepon:</strong> {order.customerPhone}</p>
          <p><strong>Metode:</strong> {order.fulfillmentMethod}</p>
          {order.fulfillmentMethod === 'pickup' ? (
            <>
              <p><strong>Tanggal:</strong> {order.pickupDate}</p>
              <p><strong>Jam:</strong> {order.pickupTime}</p>
            </>
          ) : (
            <>
              <p><strong>Alamat:</strong> {order.deliveryAddress}</p>
              {order.addressNote && (
                <p><strong>Catatan:</strong> {order.addressNote}</p>
              )}
            </>
          )}
          <p><strong>Tanggal Order:</strong> {new Date(order.createdAt).toLocaleString('id-ID')}</p>
        </div>

        <div className="admin-detail-card">
          <h3>Status & Pembayaran</h3>

          <label className="admin-detail-field">
            <strong>Status Order</strong>
            <select
              className="admin-select"
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="admin-detail-field">
            <strong>Status Pembayaran</strong>
            <select
              className="admin-select"
              value={order.paymentStatus}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <p><strong>Metode Bayar:</strong> {order.paymentMethod}</p>
          <p><strong>Total:</strong> {formatRupiah(order.totalPrice)}</p>

          {actionError && <p className="submit-error">{actionError}</p>}
        </div>
      </div>

      <div className="admin-detail-card">
        <h3>Items</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Ukuran</th>
                <th>Warna</th>
                <th>Tema</th>
                <th>Catatan</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td>{item.sizeLabel}</td>
                  <td>{item.colorText || '-'}</td>
                  <td>{item.theme || '-'}</td>
                  <td>{item.message || '-'}</td>
                  <td>{item.quantity}</td>
                  <td>{formatRupiah(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetailPage
