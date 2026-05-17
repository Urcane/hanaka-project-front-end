import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { generateQrisDataUrl } from '../services/qrisService.js'

function PaymentQrisPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { currentUser, getOrderById, markCurrentUserOrderPaid } = useApp()

  const order = getOrderById(orderId)

  const [qrState, setQrState] = useState({
    orderId: null,
    image: '',
    error: '',
  })

  useEffect(() => {
    if (!order || order.paymentMethod !== 'qris') return

    let isMounted = true

    generateQrisDataUrl(order)
      .then((qrDataUrl) => {
        if (!isMounted) return
        setQrState({ orderId: order.id, image: qrDataUrl, error: '' })
      })
      .catch(() => {
        if (!isMounted) return
        setQrState({
          orderId: order.id,
          image: '',
          error: 'QR gagal dibuat. Silakan refresh halaman.',
        })
      })

    return () => {
      isMounted = false
    }
  }, [order])

  if (!order) {
    return (
      <section className="panel stack-gap-md">
        <h2>Order tidak ditemukan</h2>
        <p>Order ini tidak tersedia untuk sesi kamu saat ini.</p>
        <Link to={currentUser ? '/orders' : '/'} className="text-link">
          {currentUser ? 'Kembali ke order history' : 'Kembali ke landing'}
        </Link>
      </section>
    )
  }

  if (order.paymentMethod !== 'qris') {
    return <Navigate to="/orders" replace />
  }

  const qrImage = qrState.orderId === order.id ? qrState.image : ''
  const loadError = qrState.orderId === order.id ? qrState.error : ''
  const isLoading = !qrImage && !loadError

  const handlePaid = () => {
    markCurrentUserOrderPaid(order.id)
    if (currentUser) {
      navigate('/orders')
    } else {
      navigate('/')
    }
  }

  return (
    <section className="qris-page">
      <article className="qris-card">
        <p className="qris-logo-text">QRIS</p>

        {isLoading && <p className="muted-text">Menyiapkan QR pembayaran...</p>}
        {loadError && <p className="submit-error">{loadError}</p>}

        {!isLoading && !loadError && qrImage && (
          <img className="qris-image" src={qrImage} alt="QRIS Hanaka Cake" />
        )}
      </article>

      <button type="button" className="place-order-btn" onClick={handlePaid}>
        Place my order
      </button>
    </section>
  )
}

export default PaymentQrisPage
