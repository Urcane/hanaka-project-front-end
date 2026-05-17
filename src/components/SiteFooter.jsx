import { storeProfile } from '../data/products.js'

function SiteFooter() {
  const whatsappLink = `https://wa.me/${storeProfile.whatsappNumber}`
  const instagramLink = `https://instagram.com/${storeProfile.instagramHandle}`

  return (
    <footer className="site-footer">
      <div>
        <p className="footer-title">Operational Hours</p>
        <p>{storeProfile.operationalHours}</p>
      </div>

      <div>
        <p className="footer-title">Address</p>
        <p>{storeProfile.address}</p>
      </div>

      <div>
        <p className="footer-title">Contact Us</p>
        <p>
          <a href={instagramLink}>Instagram</a>
        </p>
        <p>
          <a href={whatsappLink}>Whatsapp</a>
        </p>
      </div>
    </footer>
  )
}

export default SiteFooter
