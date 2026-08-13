import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { validateCustomizationInput } from '../models/cartModel.js'
import {
  findFirstAvailableSize,
  findProductById,
  findSizeOption,
  getMaxOrderableQuantity,
  getSizeStock,
  isProductAvailable,
  isSizeAvailable,
} from '../models/productModel.js'
import { fetchProductById } from '../services/productsApi.js'
import { formatRupiah } from '../utils/currency.js'
import { resolveProductImage } from '../utils/productImages.js'
import { hasAnyError } from '../validation/customValidation.js'

// Stok ditarik ulang berkala supaya angka yang dilihat pelanggan mendekati
// kondisi nyata tanpa perlu reload halaman.
const STOCK_POLL_MS = 20000

function createInitialForm(product, editingItem) {
  if (!product) {
    return { sizeId: '', colorText: '', theme: '', quantity: 1, message: '' }
  }

  if (editingItem && editingItem.productId === product.id) {
    return {
      sizeId: editingItem.size.id,
      colorText: editingItem.colorText ?? '',
      theme: editingItem.theme ?? '',
      quantity: editingItem.quantity,
      message: editingItem.message,
    }
  }

  // Mulai dari ukuran pertama yang stoknya masih ada.
  const defaultSize = findFirstAvailableSize(product) ?? product.sizes[0]

  return {
    sizeId: defaultSize?.id ?? '',
    colorText: '',
    theme: '',
    quantity: 1,
    message: '',
  }
}

function CustomizeCakeForm({ product, editingItem, onSave }) {
  const [formValues, setFormValues] = useState(() =>
    createInitialForm(product, editingItem),
  )
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedSize =
    findSizeOption(product, formValues.sizeId) ?? product.sizes[0]
  const selectedStock = getSizeStock(selectedSize)
  const maxQuantity = Math.max(1, getMaxOrderableQuantity(selectedSize))
  const quantity = Math.max(
    1,
    Math.min(maxQuantity, Number(formValues.quantity) || 1),
  )
  const dynamicTotal = selectedSize.price * quantity
  const isEditingCurrentProduct =
    Boolean(editingItem) && editingItem.productId === product.id
  const isSelectedSoldOut = selectedStock <= 0

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const handleSizeClick = (sizeId) => {
    setFormValues((prev) => ({ ...prev, sizeId }))
    setErrors((prev) => {
      if (!prev.sizeId) return prev
      const next = { ...prev }
      delete next.sizeId
      return next
    })
  }

  const handleQtyChange = (delta) => {
    setFormValues((prev) => ({
      ...prev,
      quantity: Math.max(1, Math.min(maxQuantity, prev.quantity + delta)),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    const validationErrors = validateCustomizationInput(product, formValues)
    setErrors(validationErrors)
    if (hasAnyError(validationErrors)) return

    // Stok bisa berubah sejak halaman dibuka — cegah submit yang pasti ditolak
    // backend, dengan pesan yang lebih jelas.
    if (isSelectedSoldOut) {
      setSubmitError('Stok ukuran ini sedang habis. Silakan pilih ukuran lain.')
      return
    }
    if (quantity > selectedStock) {
      setSubmitError(`Stok ukuran ini tinggal ${selectedStock}.`)
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({
        productId: product.id,
        sizeId: formValues.sizeId,
        colorText: formValues.colorText,
        theme: formValues.theme,
        quantity,
        message: formValues.message,
      })
    } catch (err) {
      setSubmitError(err.message || 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const heroImg = resolveProductImage(product.coverImage)

  return (
    <form className="detail-layout" onSubmit={handleSubmit} noValidate>
      <div className="detail-image-col">
        {heroImg ? (
          <img src={heroImg} alt={product.name} className="detail-hero-img" />
        ) : (
          <div
            className="detail-hero-gradient"
            style={{ background: product.coverGradient }}
          />
        )}
      </div>

      <div className="detail-form-col">
        <h2>{product.name}</h2>
        <p className="muted-text">{product.longDescription ?? product.shortDescription}</p>

        {!isProductAvailable(product) && (
          <p className="stock-notice">
            Semua ukuran varian ini sedang habis. Silakan pilih varian lain di
            halaman menu.
          </p>
        )}

        <h3>Pilih Ukuran</h3>
        <div className="size-circles">
          {product.sizes.map((s) => {
            const stock = getSizeStock(s)
            const available = isSizeAvailable(s)
            return (
              <div className="size-option" key={s.id}>
                <button
                  type="button"
                  className={`size-circle${formValues.sizeId === s.id ? ' is-selected' : ''}${
                    available ? '' : ' is-sold-out'
                  }`}
                  onClick={() => handleSizeClick(s.id)}
                  disabled={!available}
                  aria-label={
                    available
                      ? `Ukuran ${s.label} cm, sisa stok ${stock}`
                      : `Ukuran ${s.label} cm, stok habis`
                  }
                >
                  {s.label}
                </button>
                <span
                  className={`size-stock${available ? '' : ' is-empty'}${
                    s.lowStock ? ' is-low' : ''
                  }`}
                >
                  {available ? `Sisa ${stock}` : 'Habis'}
                </span>
              </div>
            )
          })}
        </div>
        {errors.sizeId && <p className="field-error">{errors.sizeId}</p>}

        <h3>Warna Kue</h3>
        <input
          type="text"
          name="colorText"
          placeholder="Cth. Merah Muda"
          value={formValues.colorText}
          onChange={handleChange}
        />
        {errors.colorText && <p className="field-error">{errors.colorText}</p>}

        <h3>Tema Kue</h3>
        <input
          type="text"
          name="theme"
          placeholder="Cth. Roblox"
          value={formValues.theme}
          onChange={handleChange}
        />
        {errors.theme && <p className="field-error">{errors.theme}</p>}
      </div>

      <div className="detail-notes-col">
        <h3>Catatan tambahan</h3>
        <textarea
          name="message"
          rows={5}
          placeholder="Cth. Selamat ulang tahun yang ke 50th"
          value={formValues.message}
          onChange={handleChange}
        />
        {errors.message && <p className="field-error">{errors.message}</p>}
      </div>

      {submitError && <p className="submit-error detail-error">{submitError}</p>}

      <div className="detail-bottom-bar">
        <div className="qty-stepper">
          <button type="button" onClick={() => handleQtyChange(-1)}>−</button>
          <span>{quantity}</span>
          <button
            type="button"
            onClick={() => handleQtyChange(1)}
            disabled={quantity >= maxQuantity}
          >
            +
          </button>
        </div>
        <span className="detail-total-label">Total</span>
        <span className="detail-total-price">{formatRupiah(dynamicTotal)}</span>
        <button
          type="submit"
          className="detail-add-btn"
          disabled={isSubmitting || isSelectedSoldOut}
        >
          {isSubmitting
            ? 'Memproses...'
            : isSelectedSoldOut
              ? 'Stok habis'
              : isEditingCurrentProduct
                ? 'Update cart'
                : 'Add to cart'}
        </button>
      </div>
    </form>
  )
}

function CustomizeCakePage() {
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const { products, isLoadingProducts, cartItems, addToCart, editCartItem } = useApp()
  const navigate = useNavigate()

  // Salinan produk yang selalu di-refresh dari backend supaya angka stok tetap
  // aktual selama halaman dibuka. Data dari context dipakai sebagai tampilan
  // awal agar halaman tidak kosong menunggu request pertama.
  const [liveProduct, setLiveProduct] = useState(null)

  useEffect(() => {
    if (!productId) return undefined

    let cancelled = false
    const loadStock = () => {
      fetchProductById(productId)
        .then((fresh) => {
          if (!cancelled) setLiveProduct(fresh)
        })
        .catch(() => {
          // Biarkan data terakhir tetap tampil bila request gagal.
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
  }, [productId])

  const contextProduct = useMemo(
    () => findProductById(products, productId),
    [products, productId],
  )

  const product =
    liveProduct && liveProduct.id === productId ? liveProduct : contextProduct

  const editingItem = useMemo(() => {
    if (!editId) return null
    return cartItems.find((item) => item.id === editId) ?? null
  }, [cartItems, editId])

  // Bila polling stok sudah membawa produknya, halaman tidak perlu menunggu
  // daftar produk di context selesai dimuat.
  if (isLoadingProducts && !product) {
    return (
      <section className="panel stack-gap-md">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" />
      </section>
    )
  }

  if (!product) {
    return (
      <section className="panel stack-gap-md">
        <h2>Produk tidak ditemukan</h2>
        <p>Varian yang kamu pilih belum tersedia.</p>
        <Link to="/menu" className="text-link">Kembali ke menu</Link>
      </section>
    )
  }

  const isEditingCurrentProduct =
    Boolean(editingItem) && editingItem.productId === product.id

  const handleSave = async (payload) => {
    const result = isEditingCurrentProduct
      ? await editCartItem(editingItem.id, payload)
      : await addToCart(payload)
    if (result.ok) navigate('/cart')
    return result
  }

  return (
    <CustomizeCakeForm
      key={`${product.id}-${editingItem?.id ?? 'new'}`}
      product={product}
      editingItem={editingItem}
      onSave={handleSave}
    />
  )
}

export default CustomizeCakePage
