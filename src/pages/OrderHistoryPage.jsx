import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { formatRupiah } from '../utils/currency.js'

function getPaymentLabel(order) {
  if (order.paymentMethod === 'cash') {
    return 'Cash'
  }

  if (order.paymentStatus === 'paid') {
    return 'QRIS (Lunas)'
  }

  return 'QRIS (Menunggu pembayaran)'
}

function OrderHistoryPage() {
  const { refreshOrders, userOrders } = useApp()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    refreshOrders().finally(() => setIsLoading(false))
  }, [refreshOrders])

  if (isLoading) {
    return (
      <section className="stack-gap-lg">
        <h2>Order History</h2>
        <div className="skeleton skeleton-text" style={{ width: '50%' }} />
        <div className="skeleton skeleton-text" style={{ width: '70%' }} />
      </section>
    )
  }

  if (!userOrders.length) {
    return (
      <section className="panel stack-gap-md">
        <h2>Belum ada riwayat order</h2>
        <p>Order pertama kamu akan tampil di halaman ini.</p>
        <Link to="/menu" className="primary-button inline-button">
          Mulai Order
        </Link>
      </section>
    )
  }

  return (
    <section className="stack-gap-lg">
      <header className="section-head">
        <h2>Order History</h2>
        <p>Daftar semua order yang pernah kamu buat di Hanaka Cake.</p>
      </header>

      <div className="history-list">
        {userOrders.map((order) => (
          <article className="panel history-card" key={order.id}>
            <div className="history-head">
              <div>
                <h3>{order.orderNumber}</h3>
                <p className="muted-text">
                  {new Date(order.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
              <span className="status-badge">{order.status}</span>
            </div>

            <p>
              Metode bayar: <strong>{getPaymentLabel(order)}</strong>
            </p>
            <p>
              Metode pengambilan: <strong>{order.fulfillmentMethod}</strong>
            </p>
            <p>
              Alamat/Pickup: <strong>{order.deliveryAddress}</strong>
            </p>

            <div className="history-items">
              {order.items.map((item) => (
                <div key={item.id} className="history-item-row">
                  <p>
                    {item.productName} - {item.sizeLabel} ({item.quantity} pcs)
                  </p>
                  <p>{formatRupiah(item.totalPrice)}</p>
                </div>
              ))}
            </div>

            <p>
              Total Order: <strong>{formatRupiah(order.totalPrice)}</strong>
            </p>

            {order.paymentMethod === 'qris' && order.paymentStatus !== 'paid' && (
              <Link to={`/payment/${order.id}`} className="text-link">
                Lanjutkan pembayaran QRIS
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default OrderHistoryPage
