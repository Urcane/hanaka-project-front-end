import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { apiCheckQrisStatus, apiCreateQrisPayment } from '../services/paymentApi.js'
import { generateQrisDataUrl } from '../services/qrisService.js'
import { formatRupiah } from '../utils/currency.js'

function formatCountdown(ms) {
  if (ms <= 0) return '00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

function PaymentQrisPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { currentUser, getOrderById } = useApp()

  const [order, setOrder] = useState(null)
  const [isOrderLoading, setIsOrderLoading] = useState(true)
  const [payment, setPayment] = useState(null)
  const [qrImage, setQrImage] = useState('')
  const [loadError, setLoadError] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [now, setNow] = useState(Date.now())
  const [isChecking, setIsChecking] = useState(false)

  // Load the order
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

  // Create the Midtrans QRIS charge and render the QR
  useEffect(() => {
    if (!order || order.paymentMethod !== 'qris') return

    let cancelled = false

    apiCreateQrisPayment(order.id)
      .then(async (data) => {
        if (cancelled) return
        setPayment(data)
        if (data.status) setPaymentStatus(data.status)
        const dataUrl = await generateQrisDataUrl({ qrString: data.qrString })
        if (!cancelled) setQrImage(dataUrl)
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('QR gagal dibuat. Silakan refresh halaman.')
        }
      })

    return () => { cancelled = true }
  }, [order])

  // Poll Midtrans status until paid/expired/failed
  useEffect(() => {
    if (!order || order.paymentMethod !== 'qris') return
    if (['paid', 'expired', 'failed'].includes(paymentStatus)) return

    let cancelled = false
    const intervalId = setInterval(async () => {
      try {
        const res = await apiCheckQrisStatus(order.id)
        if (!cancelled && res.status) setPaymentStatus(res.status)
      } catch {
        // Ignore transient poll errors; the next tick will retry.
      }
    }, 5000)

    return () => { cancelled = true; clearInterval(intervalId) }
  }, [order, paymentStatus])

  // Tick the countdown every second
  useEffect(() => {
    const tickId = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(tickId)
  }, [])

  // Redirect once paid
  useEffect(() => {
    if (paymentStatus !== 'paid') return
    const timeoutId = setTimeout(() => {
      navigate(currentUser ? '/orders' : '/')
    }, 1400)
    return () => clearTimeout(timeoutId)
  }, [paymentStatus, currentUser, navigate])

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

  const expiresMs = payment?.expiresAt
    ? new Date(payment.expiresAt).getTime() - now
    : null
  const isExpired =
    paymentStatus === 'expired' || (expiresMs !== null && expiresMs <= 0)
  const isFailed = paymentStatus === 'failed'
  const isPaid = paymentStatus === 'paid'
  const isPreparing = !qrImage && !loadError && !isExpired && !isPaid

  const handleCheck = async () => {
    setIsChecking(true)
    setLoadError('')
    try {
      const res = await apiCheckQrisStatus(order.id)
      if (res.status === 'paid') {
        setPaymentStatus('paid')
      } else if (res.status === 'expired') {
        setPaymentStatus('expired')
      } else if (res.status === 'failed') {
        setPaymentStatus('failed')
      } else {
        setLoadError('Pembayaran belum diterima. Selesaikan scan & bayar QRIS dulu, lalu cek lagi.')
      }
    } catch {
      setLoadError('Gagal cek status pembayaran. Silakan coba lagi.')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <section className="qris-page">
      <article className="qris-card">
        <p className="qris-logo-text">QRIS</p>

        {payment && (
          <p className="muted-text">
            Total: <strong>{formatRupiah(payment.amount)}</strong>
          </p>
        )}

        {isPaid ? (
          <p className="muted-text"><strong>Pembayaran diterima! Mengalihkan...</strong></p>
        ) : isExpired ? (
          <p className="submit-error">QR sudah kedaluwarsa. Silakan buat pesanan baru.</p>
        ) : isFailed ? (
          <p className="submit-error">Pembayaran gagal/dibatalkan. Silakan buat pesanan baru.</p>
        ) : (
          <>
            {isPreparing && <p className="muted-text">Menyiapkan QR pembayaran...</p>}
            {loadError && <p className="submit-error">{loadError}</p>}
            {qrImage && (
              <img className="qris-image" src={qrImage} alt="QRIS Hanaka Cake" />
            )}
            {expiresMs !== null && expiresMs > 0 && (
              <p className="muted-text">Berlaku: {formatCountdown(expiresMs)}</p>
            )}
            <p className="muted-text">Scan dengan aplikasi e-wallet/m-banking. Status terupdate otomatis.</p>
          </>
        )}
      </article>

      {!isPaid && !isExpired && !isFailed && (
        <button
          type="button"
          className="place-order-btn"
          onClick={handleCheck}
          disabled={isChecking}
        >
          {isChecking ? 'Mengecek...' : 'Cek status pembayaran'}
        </button>
      )}
    </section>
  )
}

export default PaymentQrisPage
