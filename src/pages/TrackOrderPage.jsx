import { useEffect, useState } from 'react'
import DeliveryMiniMap from '../components/DeliveryMiniMap.jsx'
import OrderProgress from '../components/OrderProgress.jsx'
import { validateTrackInput, normalizeOrderNumber } from '../models/trackModel.js'
import { hasAnyError } from '../validation/customValidation.js'
import { apiTrackOrder } from '../services/ordersApi.js'
import { fetchStoreProfile } from '../services/storeApi.js'
import { formatRupiah } from '../utils/currency.js'
import { STORE_FALLBACK } from '../utils/mapSetup.js'

function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [errors, setErrors] = useState({})

  const [status, setStatus] = useState('idle') // idle | loading | success | notfound | error
  const [errorMessage, setErrorMessage] = useState('')

  const [storePoint, setStorePoint] = useState(STORE_FALLBACK)

  const [order, setOrder] = useState(null)
  // Set Order digunakan untuk menyimpan data order yang ditemukan setelah melacak pesanan.

  // Koordinat toko dipakai sebagai titik awal rute di peta.
  useEffect(() => {
    let cancelled = false
    fetchStoreProfile()
      .then((store) => {
        if (!cancelled && store?.lat && store?.lng) {
          setStorePoint({ lat: store.lat, lng: store.lng })
        }
      })
      .catch(() => {
        // Pakai koordinat cadangan bila profil toko gagal dimuat.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    // ── MODUL 3: validasi format dulu ──
    const validationErrors = validateTrackInput({ orderNumber })
    setErrors(validationErrors)
    if (hasAnyError(validationErrors)) return

    // ── MODUL 4: panggil service LANGSUNG (tanpa Context) ──
    setStatus('loading')
    setOrder(null)
    setErrorMessage('')
    try {
      const found = await apiTrackOrder(normalizeOrderNumber(orderNumber))
      setOrder(found)
      setStatus('success')
    } catch (err) {
      if (err.status === 404) {
        setStatus('notfound')
      } else {
        setStatus('error')
        setErrorMessage(err.message || 'Gagal melacak pesanan. Silakan coba lagi.')
      }
    }
  }

  const handleChange = (event) => {
    setOrderNumber(event.target.value)
    setErrors({})
  }

  return (
    <section className="stack-gap-lg">
      <header className="section-head">
        <p className="brand-eyebrow">Hanaka Cake</p>
        <h2>Lacak Pesanan</h2>
        <p className="muted-text">
          Masukkan nomor pesananmu untuk melihat status terkini. Tanpa perlu
          login.
        </p>
      </header>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <label className="field" htmlFor="track-number">
          Nomor Pesanan
          <input
            id="track-number"
            type="text"
            name="orderNumber"
            placeholder="HNK-20260624-103000-123"
            value={orderNumber}
            onChange={handleChange}
          />
          {errors.orderNumber && (
            <span className="field-error">{errors.orderNumber}</span>
          )}
        </label>
        <button
          type="submit"
          className="primary-button"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Mencari...' : 'Lacak'}
        </button>
      </form>

      {status === 'notfound' && (
        <p className="submit-error">
          Pesanan tidak ditemukan. Periksa kembali nomor pesananmu.
        </p>
      )}
      {status === 'error' && <p className="submit-error">{errorMessage}</p>}

      {status === 'success' && order && (
        <article className="panel history-card">
          <div className="history-head">
            <div>
              <h3>{order.orderNumber}</h3>
              <p className="muted-text">
                {new Date(order.createdAt).toLocaleString('id-ID')}
              </p>
            </div>
            <span className="status-badge">{order.status}</span>
          </div>

          <OrderProgress order={order} />

          <DeliveryMiniMap order={order} storePoint={storePoint} />

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
        </article>
      )}
    </section>
  )
}

export default TrackOrderPage
