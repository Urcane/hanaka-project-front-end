import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import {
  buildCheckoutPayload,
  PAYMENT_METHODS,
  validateCheckoutInput,
} from '../models/checkoutModel.js'
import { storeProfile } from '../data/products.js'
import { hasAnyError } from '../validation/customValidation.js'

function CheckoutPage() {
  const { currentUser, cartItems, placeOrder } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pickupMethod = searchParams.get('mode') === 'delivery' ? 'delivery' : 'pickup'

  const [formValues, setFormValues] = useState({
    customerName: currentUser?.fullName ?? '',
    phone: currentUser?.phone ?? '',
    pickupMethod,
    pickupDate: '',
    pickupTime: '',
    address: '',
    addressNote: '',
    paymentMethod: '',
  })

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [successOrder, setSuccessOrder] = useState(null)

  if (successOrder) {
    return (
      <section className="panel stack-gap-md">
        <h2>Order berhasil dibuat</h2>
        <p>
          Nomor order kamu: <strong>{successOrder.orderNumber}</strong>
        </p>
        <p>Tim Hanaka Cake akan menghubungi kamu untuk konfirmasi.</p>
        <div className="hero-actions">
          <Link to="/menu" className="primary-button inline-button">Pesan Lagi</Link>
          {!currentUser && (
            <Link to="/login" className="secondary-button inline-button">Login Akun</Link>
          )}
        </div>
      </section>
    )
  }

  if (!cartItems.length) {
    return (
      <section className="panel stack-gap-md">
        <h2>Belum ada item untuk checkout</h2>
        <p>Tambahkan pesanan ke keranjang dulu, lalu lanjut checkout.</p>
        <Link to="/menu" className="primary-button inline-button">Pilih Menu</Link>
      </section>
    )
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const handlePaymentSelect = (methodId) => {
    setFormValues((prev) => ({ ...prev, paymentMethod: methodId }))
    setErrors((prev) => {
      if (!prev.paymentMethod) return prev
      const next = { ...prev }
      delete next.paymentMethod
      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitError('')
    setSuccessOrder(null)

    const validationErrors = validateCheckoutInput(formValues)
    setErrors(validationErrors)
    if (hasAnyError(validationErrors)) return

    const checkoutPayload = buildCheckoutPayload(formValues)
    const result = placeOrder(checkoutPayload)
    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    if (checkoutPayload.paymentMethod === 'qris') {
      navigate(`/payment/${result.order.id}`)
      return
    }

    if (currentUser) {
      navigate('/orders')
      return
    }

    setSuccessOrder(result.order)
  }

  const isPickup = pickupMethod === 'pickup'

  return (
    <section className="stack-gap-lg">
      <h2>{isPickup ? 'Pickup' : 'Delivery'}</h2>

      {!currentUser && (
        <article className="panel stack-gap-md">
          <p>
            Checkout sebagai tamu. Mau simpan riwayat order?{' '}
            <Link
              to="/login"
              state={{ redirectTo: `/checkout?mode=${pickupMethod}` }}
              className="text-link"
            >
              Login dulu
            </Link>
          </p>
        </article>
      )}

      <div className="checkout-grid">
        <form className="checkout-form-col" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <strong>Nama Pelanggan</strong>
            <input
              type="text"
              name="customerName"
              value={formValues.customerName}
              onChange={handleChange}
            />
            {errors.customerName && (
              <span className="field-error">{errors.customerName}</span>
            )}
          </label>

          <label className="field">
            <strong>Nomor Pelanggan</strong>
            <input
              type="tel"
              name="phone"
              value={formValues.phone}
              onChange={handleChange}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </label>

          {isPickup ? (
            <>
              <label className="field">
                <strong>Tanggal Pengambilan</strong>
                <input
                  type="date"
                  name="pickupDate"
                  value={formValues.pickupDate}
                  onChange={handleChange}
                />
                {errors.pickupDate && (
                  <span className="field-error">{errors.pickupDate}</span>
                )}
              </label>
              <label className="field">
                <strong>Jam Pengambilan</strong>
                <input
                  type="time"
                  name="pickupTime"
                  value={formValues.pickupTime}
                  onChange={handleChange}
                />
                {errors.pickupTime && (
                  <span className="field-error">{errors.pickupTime}</span>
                )}
              </label>
            </>
          ) : (
            <>
              <label className="field">
                <strong>Alamat Detail</strong>
                <input
                  type="text"
                  name="address"
                  value={formValues.address}
                  onChange={handleChange}
                />
                {errors.address && (
                  <span className="field-error">{errors.address}</span>
                )}
              </label>
              <label className="field">
                <strong>Catatan Alamat</strong>
                <input
                  type="text"
                  name="addressNote"
                  placeholder="cth. rumah warna biru"
                  value={formValues.addressNote}
                  onChange={handleChange}
                />
                {errors.addressNote && (
                  <span className="field-error">{errors.addressNote}</span>
                )}
              </label>
            </>
          )}

          {submitError && <p className="submit-error">{submitError}</p>}

          <button type="submit" className="continue-btn">
            Continue
          </button>
        </form>

        <aside className="checkout-notes-panel">
          <h3>NOTES</h3>
          {isPickup ? (
            <p>Cake bisa diambil 2 hari setelah pesanan dikonfirmasi</p>
          ) : (
            <>
              <p>Cake akan diantar 2 hari setelah pesanan dikonfirmasi</p>
              <p>Pesanan akan dikirim dari alamat</p>
              <p><strong>{storeProfile.address}</strong></p>
            </>
          )}

          <h3>Payment</h3>
          <div className="payment-options">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                className={`payment-option-btn${formValues.paymentMethod === method.id ? ' is-selected' : ''}`}
                onClick={() => handlePaymentSelect(method.id)}
              >
                {method.label}
              </button>
            ))}
          </div>
          {errors.paymentMethod && (
            <p className="field-error">{errors.paymentMethod}</p>
          )}
        </aside>
      </div>
    </section>
  )
}

export default CheckoutPage
