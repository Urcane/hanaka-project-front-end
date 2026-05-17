import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { validateCustomizationInput } from '../models/cartModel.js'
import { findProductById, findSizeOption } from '../models/productModel.js'
import { formatRupiah } from '../utils/currency.js'
import { hasAnyError } from '../validation/customValidation.js'
import browniesImg from '../assets/brownies.jpg'
import strawberryImg from '../assets/strawberry-cake.jpg'

const productImages = {
  'black-forest': browniesImg,
  'red-velvet': strawberryImg,
}

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

  return {
    sizeId: product.sizes[0].id,
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

  const selectedSize =
    findSizeOption(product, formValues.sizeId) ?? product.sizes[0]
  const quantity = Math.max(1, Math.min(5, Number(formValues.quantity) || 1))
  const dynamicTotal = selectedSize.price * quantity
  const isEditingCurrentProduct =
    Boolean(editingItem) && editingItem.productId === product.id

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
      quantity: Math.max(1, Math.min(5, prev.quantity + delta)),
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitError('')

    const validationErrors = validateCustomizationInput(product, formValues)
    setErrors(validationErrors)
    if (hasAnyError(validationErrors)) return

    const result = onSave({
      productId: product.id,
      sizeId: formValues.sizeId,
      colorText: formValues.colorText,
      theme: formValues.theme,
      quantity,
      message: formValues.message,
    })
    if (!result.ok) setSubmitError(result.error)
  }

  const heroImg = productImages[product.id]

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

        <h3>Pilih Ukuran</h3>
        <div className="size-circles">
          {product.sizes.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`size-circle${formValues.sizeId === s.id ? ' is-selected' : ''}`}
              onClick={() => handleSizeClick(s.id)}
            >
              {s.label}
            </button>
          ))}
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
          <button type="button" onClick={() => handleQtyChange(1)}>+</button>
        </div>
        <span className="detail-total-label">Total</span>
        <span className="detail-total-price">{formatRupiah(dynamicTotal)}</span>
        <button type="submit" className="detail-add-btn">
          {isEditingCurrentProduct ? 'Update cart' : 'Add to cart'}
        </button>
      </div>
    </form>
  )
}

function CustomizeCakePage() {
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const { cartItems, addToCart, editCartItem } = useApp()
  const navigate = useNavigate()

  const product = useMemo(() => findProductById(productId), [productId])

  const editingItem = useMemo(() => {
    if (!editId) return null
    return cartItems.find((item) => item.id === editId) ?? null
  }, [cartItems, editId])

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

  const handleSave = (payload) => {
    const result = isEditingCurrentProduct
      ? editCartItem(editingItem.id, payload)
      : addToCart(payload)
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
