import { Link } from 'react-router-dom'
import { getFeaturedProducts } from '../models/productModel.js'
import heroBanner from '../assets/big-hero.png'
import browniesImg from '../assets/brownies.jpg'
import strawberryImg from '../assets/strawberry-cake.jpg'

const productImages = {
  'black-forest': browniesImg,
  'red-velvet': strawberryImg,
}

function HomePage() {
  const featuredProducts = getFeaturedProducts()

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

        <div className="bestseller-grid">
          {featuredProducts.map((product) => (
            <article className="bestseller-card" key={product.id}>
              {productImages[product.id] && (
                <img
                  src={productImages[product.id]}
                  alt={product.name}
                  className="bestseller-img"
                />
              )}
              <div className="bestseller-body">
                <h3>{product.name}</h3>
                <p>{product.shortDescription}</p>
              </div>
            </article>
          ))}
        </div>

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
