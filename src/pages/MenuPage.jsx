import { Link } from 'react-router-dom'
import { getAllProducts, getProductStartingPrice } from '../models/productModel.js'
import { standardSizes } from '../data/products.js'
import { formatRupiah } from '../utils/currency.js'
import heroBg from '../assets/hero.png'
import browniesImg from '../assets/brownies.jpg'
import strawberryImg from '../assets/strawberry-cake.jpg'

const productImages = {
  'black-forest': browniesImg,
  'red-velvet': strawberryImg,
}

function MenuPage() {
  const products = getAllProducts()

  return (
    <section className="stack-gap-lg">
      <section className="menu-hero">
        <img src={heroBg} alt="" className="menu-hero-bg" aria-hidden="true" />
        <h2 className="menu-hero-title">Build your cake</h2>
      </section>

      <article className="price-list-panel">
        <h3>Daftar Harga</h3>
        {standardSizes.map((size) => (
          <p key={size.id}>
            {size.fullLabel} : {formatRupiah(size.price)}
          </p>
        ))}
      </article>

      <div className="menu-product-grid">
        {products.map((product) => {
          const img = productImages[product.id]
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
    </section>
  )
}

export default MenuPage
