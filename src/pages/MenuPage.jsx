import { Link } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { getProductStartingPrice } from '../models/productModel.js'
import { formatRupiah } from '../utils/currency.js'
import { resolveProductImage } from '../utils/productImages.js'
import heroBg from '../assets/hero.png'

function MenuPage() {
  const { products, isLoadingProducts } = useApp()

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
              return (
                <Link
                  to={`/menu/${product.id}`}
                  className="menu-product-card"
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
