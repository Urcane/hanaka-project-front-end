import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminOrders, updateOrderStatus } from '../../services/adminApi.js'
import { formatRupiah } from '../../utils/currency.js'

const ORDER_STATUSES = [
  { value: '', label: 'Semua Status' },
  { value: 'menunggu konfirmasi', label: 'Menunggu Konfirmasi' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'siap diambil', label: 'Siap Diambil' },
  { value: 'diantar', label: 'Diantar' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
]

function statusBadgeClass(status) {
  switch (status) {
    case 'menunggu konfirmasi': return 'badge-pending'
    case 'diproses': return 'badge-processing'
    case 'siap diambil':
    case 'diantar': return 'badge-ready'
    case 'selesai': return 'badge-done'
    case 'dibatalkan': return 'badge-cancelled'
    default: return ''
  }
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 20

  useEffect(() => {
    const params = { limit, offset }
    if (filterStatus) params.status = filterStatus

    fetchAdminOrders(params)
      .then((data) => {
        setOrders(data.orders)
        setTotal(data.total)
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [filterStatus, offset])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o)),
      )
    } catch (err) {
      alert(err.message)
    }
  }

  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <div className="admin-page">
      <h1>Order Management</h1>

      <div className="admin-toolbar">
        <select
          className="admin-select"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setOffset(0) }}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <span className="admin-total-label">{total} order ditemukan</span>
      </div>

      {error && <p className="submit-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Metode</th>
              <th>Bayar</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="admin-table-empty">Memuat...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="admin-table-empty">Tidak ada order.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/admin/orders/${order.id}`} className="admin-link">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td>{order.customerName}</td>
                  <td>{formatRupiah(order.totalPrice)}</td>
                  <td className="admin-cell-cap">{order.fulfillmentMethod}</td>
                  <td className="admin-cell-cap">{order.paymentStatus}</td>
                  <td>
                    <span className={`admin-badge ${statusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="admin-cell-date">
                    {new Date(order.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td>
                    <select
                      className="admin-select-sm"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {ORDER_STATUSES.filter((s) => s.value).map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            type="button"
            className="admin-page-btn"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            ← Prev
          </button>
          <span className="admin-page-info">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            type="button"
            className="admin-page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setOffset(offset + limit)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage
