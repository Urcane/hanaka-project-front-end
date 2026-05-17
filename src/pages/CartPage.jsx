import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { formatRupiah } from '../utils/currency.js'

function CartPage() {
  const { cartItems, cartSubtotal, updateCartQuantity, removeCartItem } = useApp()
  const navigate = useNavigate()
  const [fulfillment, setFulfillment] = useState('pickup')

  if (!cartItems.length) {
    return (
      <section className="panel stack-gap-md">
        <h2>Keranjang masih kosong</h2>
        <p>Yuk pilih varian cake dulu dari halaman menu.</p>
        <Link to="/menu" className="primary-button inline-button">
          Lihat Menu
        </Link>
      </section>
    )
  }

  const handleBayar = () => {
    navigate(`/checkout?mode=${fulfillment}`)
  }

  return (
    <section className="stack-gap-lg">
      <h2>Cart</h2>

      <div className="cart-table">
        <div className="cart-table-head">
          <span>ITEMS</span>
          <span>QTY</span>
          <span>SUBTOTAL</span>
        </div>

        {cartItems.map((item) => (
          <div className="cart-table-row" key={item.id}>
            <div className="cart-item-info">
              <h3>{item.productName}</h3>
              <p className="muted-text">Size : {item.size.label}</p>
              {item.colorText && (
                <p className="muted-text">Warna Kue : {item.colorText}</p>
              )}
              {item.theme && (
                <p className="muted-text">Tema Kue : {item.theme}</p>
              )}
              {item.message && (
                <p className="muted-text">Catatan : {item.message}</p>
              )}
              <Link
                to={`/menu/${item.productId}?edit=${item.id}`}
                className="edit-pesanan-btn"
              >
                Edit Pesanan
              </Link>
            </div>

            <div className="cart-qty-col">
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="cart-subtotal-col">
              <span>{formatRupiah(item.totalPrice)}</span>
              <button
                type="button"
                className="delete-icon-btn"
                onClick={() => removeCartItem(item.id)}
                aria-label="Hapus"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fulfillment-toggle">
        <button
          type="button"
          className={`fulfillment-btn${fulfillment === 'pickup' ? ' is-active' : ''}`}
          onClick={() => setFulfillment('pickup')}
        >
          <strong>Pickup</strong>
          <span>Order dan ambil di outlet</span>
        </button>
        <button
          type="button"
          className={`fulfillment-btn${fulfillment === 'delivery' ? ' is-active' : ''}`}
          onClick={() => setFulfillment('delivery')}
        >
          <strong>Delivery</strong>
          <span>Pesanan diantar ke alamat</span>
        </button>
      </div>

      <div className="cart-total-bar">
        <span>Total</span>
        <span className="cart-total-price">{formatRupiah(cartSubtotal)}</span>
        <button type="button" className="bayar-btn" onClick={handleBayar}>
          Bayar
        </button>
      </div>
    </section>
  )
}

export default CartPage
