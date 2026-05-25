import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { apiCreateQrisPayment } from '../services/paymentApi.js'
import { generateQrisDataUrl } from '../services/qrisService.js'

function PaymentQrisPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { currentUser, getOrderById, markCurrentUserOrderPaid } = useApp()

  const [order, setOrder] = useState(null)
  const [isOrderLoading, setIsOrderLoading] = useState(true)
  const [qrImage, setQrImage] = useState('')
  const [loadError, setLoadError] = useState('')
  const [isPaying, setIsPaying] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsOrderLoading(true)
    getOrderById(orderId)
      .then((data) => {
        if (!cancelled) setOrder(data)
      })
      .finally(() => {
        if (!cancelled) setIsOrderLoading(false)
      })
    return () => { cancelled = true }
  }, [orderId, getOrderById])

  useEffect(() => {
    if (!order || order.paymentMethod !== 'qris') return

    let cancelled = false

    apiCreateQrisPayment(order.id)
      .then((payment) => {
        if (cancelled) return
        return generateQrisDataUrl({ qrString: payment.qrString })
      })
      .then((dataUrl) => {
        if (!cancelled && dataUrl) setQrImage(dataUrl)
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('QR gagal dibuat. Silakan refresh halaman.')
        }
      })

    return () => { cancelled = true }
  }, [order])

  if (isOrderLoading) {
    return (
      <section className="panel stack-gap-md" style={{ textAlign: 'center' }}>
        <p>Memuat order...</p>
      </section>
    )
  }

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

  const isLoading = !qrImage && !loadError

  const handlePaid = async () => {
    setIsPaying(true)
    try {
      await markCurrentUserOrderPaid(order.id)
      if (currentUser) {
        navigate('/orders')
      } else {
        navigate('/')
      }
    } catch {
      setLoadError('Gagal mengkonfirmasi pembayaran. Silakan coba lagi.')
    } finally {
      setIsPaying(false)
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

      <button
        type="button"
        className="place-order-btn"
        onClick={handlePaid}
        disabled={isPaying}
      >
        {isPaying ? 'Memproses...' : 'Place my order'}
      </button>
    </section>
  )
}

export default PaymentQrisPage
