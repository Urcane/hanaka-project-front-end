import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import {
  getProductStartingPrice,
  getProductTotalStock,
} from '../models/productModel.js'
import { fetchProducts } from '../services/productsApi.js'
import { formatRupiah } from '../utils/currency.js'
import { resolveProductImage } from '../utils/productImages.js'
import heroBg from '../assets/hero.png'

// Katalog di-refresh berkala supaya badge stok tetap mengikuti perubahan yang
// dilakukan admin tanpa perlu reload halaman.
const STOCK_POLL_MS = 30000

function MenuPage() {
  const { products: contextProducts, isLoadingProducts } = useApp()
  const [liveProducts, setLiveProducts] = useState(null)

  useEffect(() => {
    let cancelled = false
    const loadStock = () => {
      fetchProducts()
        .then((fresh) => {
          if (!cancelled) setLiveProducts(fresh)
        })
        .catch(() => {
          // Pertahankan data terakhir bila request gagal.
        })
    }

    loadStock()
    const timer = setInterval(loadStock, STOCK_POLL_MS)
    window.addEventListener('focus', loadStock)

    return () => {
      cancelled = true
      clearInterval(timer)
      window.removeEventListener('focus', loadStock)
    }
  }, [])

  const products = liveProducts ?? contextProducts

  return (
    <section className="stack-gap-lg">
      <section className="menu-hero">
        <img src={heroBg} alt="" className="menu-hero-bg" aria-hidden="true" />
        <h2 className="menu-hero-title">Build your cake</h2>
      </section>

      {isLoadingProducts ? (
        <div className="menu-product-grid">
          {[1, 2, 3, 4, 5].map((n) => (
            <div className="menu-product-card skeleton-card" key={n}>
              <div className="skeleton skeleton-img" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {products.length > 0 && (
            <article className="price-list-panel">
              <h3>Daftar Harga</h3>
              {products[0].sizes.map((size) => (
                <p key={size.id}>
                  {size.fullLabel} : {formatRupiah(size.price)}
                </p>
              ))}
            </article>
          )}

          <div className="menu-product-grid">
            {products.map((product) => {
              const img = resolveProductImage(product.coverImage)
              const totalStock = getProductTotalStock(product)
              const isSoldOut = totalStock <= 0
              return (
                <Link
                  to={`/menu/${product.id}`}
                  className={`menu-product-card${isSoldOut ? ' is-sold-out' : ''}`}
                  key={product.id}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={product.name}
                      className="menu-product-img"
                    />
                  ) : (
                    <div
                      className="menu-product-gradient"
                      style={{ background: product.coverGradient }}
                    />
                  )}
                  <span className={`stock-badge${isSoldOut ? ' is-empty' : ''}`}>
                    {isSoldOut ? 'Stok habis' : `Stok ${totalStock}`}
                  </span>
                  <p className="menu-product-name">{product.name}</p>
                  <p className="menu-product-price">
                    {formatRupiah(getProductStartingPrice(product))}
                  </p>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}

export default MenuPage
