import { Link } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { resolveProductImage } from '../utils/productImages.js'
import heroBanner from '../assets/big-hero.png'

function HomePage() {
  const { products, featuredProducts, isLoadingProducts } = useApp()

  return (
    <section className="landing-page">
      <section className="hero-banner">
        <img
          src={heroBanner}
          alt="Custom your cake - With Hanaka Cake"
          className="hero-banner-img"
        />
      </section>

      <section className="bestseller-section">
        <h2 className="bestseller-title">Best Seller</h2>

        {isLoadingProducts ? (
          <div className="bestseller-grid">
            {[1, 2].map((n) => (
              <article className="bestseller-card skeleton-card" key={n}>
                <div className="skeleton skeleton-img" />
                <div className="bestseller-body">
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-text" />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bestseller-grid">
            {featuredProducts.map((product) => {
              const img = resolveProductImage(product.coverImage)
              return (
                <article className="bestseller-card" key={product.id}>
                  {img && (
                    <img
                      src={img}
                      alt={product.name}
                      className="bestseller-img"
                    />
                  )}
                  <div className="bestseller-body">
                    <h3>{product.name}</h3>
                    <p>{product.shortDescription}</p>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div className="bestseller-actions">
          <Link to="/menu" className="see-more-button">
            See More
          </Link>
        </div>
      </section>
    </section>
  )
}

export default HomePage
