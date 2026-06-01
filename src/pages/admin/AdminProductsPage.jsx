import { useEffect, useRef, useState } from 'react'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  addProductSize,
  deleteProductSize,
  uploadProductImage,
} from '../../services/adminApi.js'
import { fetchProducts } from '../../services/productsApi.js'
import { resolveProductImage } from '../../utils/productImages.js'
import { formatRupiah } from '../../utils/currency.js'

const emptyProductForm = {
  id: '',
  name: '',
  shortDescription: '',
  longDescription: '',
  featured: false,
  coverGradient: '',
  maxMessageLength: 60,
}

const emptySizeForm = {
  label: '',
  fullLabel: '',
  price: '',
}

function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const [sizeTarget, setSizeTarget] = useState(null)
  const [sizeForm, setSizeForm] = useState(emptySizeForm)
  const [sizeError, setSizeError] = useState('')

  const loadProducts = async () => {
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const resetImageState = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
  }

  const openCreateForm = () => {
    setEditingProduct(null)
    setProductForm(emptyProductForm)
    setFormError('')
    resetImageState()
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditingProduct(product)
    setProductForm({
      id: product.id,
      name: product.name,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription || '',
      featured: product.featured,
      coverGradient: product.coverGradient || '',
      maxMessageLength: product.maxMessageLength || 60,
    })
    setFormError('')
    resetImageState()
    setImagePreview(resolveProductImage(product.coverImage))
    setShowForm(true)
  }

  const closeForm = () => {
    resetImageState()
    setShowForm(false)
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setProductForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setIsSaving(true)
    try {
      const payload = {
        ...productForm,
        maxMessageLength: Number(productForm.maxMessageLength) || 60,
      }

      let savedProductId
      if (editingProduct) {
        const { id: _id, ...updatePayload } = payload
        await updateProduct(editingProduct.id, updatePayload)
        savedProductId = editingProduct.id
      } else {
        await createProduct(payload)
        savedProductId = payload.id
      }

      if (imageFile) {
        await uploadProductImage(savedProductId, imageFile)
      }

      closeForm()
      await loadProducts()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Hapus produk ini beserta semua ukurannya?')) return
    try {
      await deleteProduct(productId)
      await loadProducts()
    } catch (err) {
      alert(err.message)
    }
  }

  const openSizeForm = (product) => {
    setSizeTarget(product)
    setSizeForm(emptySizeForm)
    setSizeError('')
  }

  const handleSizeSubmit = async (e) => {
    e.preventDefault()
    setSizeError('')
    try {
      await addProductSize(sizeTarget.id, {
        label: sizeForm.label,
        fullLabel: sizeForm.fullLabel,
        price: Number(sizeForm.price),
      })
      setSizeTarget(null)
      await loadProducts()
    } catch (err) {
      setSizeError(err.message)
    }
  }

  const handleDeleteSize = async (productId, sizeId) => {
    if (!confirm('Hapus ukuran ini?')) return
    try {
      await deleteProductSize(productId, sizeId)
      await loadProducts()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Product Management</h1>
        <button type="button" className="primary-button" onClick={openCreateForm}>
          + Tambah Produk
        </button>
      </div>

      {error && <p className="submit-error">{error}</p>}

      {showForm && (
        <div className="admin-modal-overlay" onClick={closeForm}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            <form className="form-grid" onSubmit={handleFormSubmit} noValidate>
              {!editingProduct && (
                <label className="field">
                  ID (slug)
                  <input
                    name="id"
                    value={productForm.id}
                    onChange={handleFormChange}
                    placeholder="cth. tiramisu-cake"
                  />
                </label>
              )}
              <label className="field">
                Nama Produk
                <input name="name" value={productForm.name} onChange={handleFormChange} />
              </label>
              <label className="field">
                Deskripsi Pendek
                <input
                  name="shortDescription"
                  value={productForm.shortDescription}
                  onChange={handleFormChange}
                />
              </label>
              <label className="field">
                Deskripsi Panjang
                <textarea
                  name="longDescription"
                  rows={3}
                  value={productForm.longDescription}
                  onChange={handleFormChange}
                />
              </label>
              <label className="field">
                Cover Gradient (CSS fallback)
                <input
                  name="coverGradient"
                  value={productForm.coverGradient}
                  onChange={handleFormChange}
                  placeholder="linear-gradient(135deg, #8B6914, #D4A843)"
                />
              </label>

              <div className="field">
                <span>Cover Image</span>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="admin-image-preview"
                  />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                </button>
                {imageFile && (
                  <span className="muted-text" style={{ fontSize: '0.8rem' }}>
                    {imageFile.name}
                  </span>
                )}
                <span className="muted-text" style={{ fontSize: '0.75rem' }}>
                  JPG, PNG, WebP — maks. 2MB
                </span>
              </div>

              <label className="field">
                Max Message Length
                <input
                  name="maxMessageLength"
                  type="number"
                  value={productForm.maxMessageLength}
                  onChange={handleFormChange}
                />
              </label>
              <label className="admin-checkbox-field">
                <input
                  type="checkbox"
                  name="featured"
                  checked={productForm.featured}
                  onChange={handleFormChange}
                />
                Tampilkan di Best Seller
              </label>

              {formError && <p className="submit-error">{formError}</p>}

              <div className="admin-form-actions">
                <button type="submit" className="primary-button" disabled={isSaving}>
                  {isSaving ? 'Menyimpan...' : editingProduct ? 'Simpan Perubahan' : 'Buat Produk'}
                </button>
                <button type="button" className="ghost-button" onClick={closeForm}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sizeTarget && (
        <div className="admin-modal-overlay" onClick={() => setSizeTarget(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Tambah Ukuran — {sizeTarget.name}</h2>
            <form className="form-grid" onSubmit={handleSizeSubmit} noValidate>
              <label className="field">
                Label (cth. 16)
                <input
                  value={sizeForm.label}
                  onChange={(e) => setSizeForm((prev) => ({ ...prev, label: e.target.value }))}
                />
              </label>
              <label className="field">
                Full Label (cth. Ukuran 16 cm)
                <input
                  value={sizeForm.fullLabel}
                  onChange={(e) => setSizeForm((prev) => ({ ...prev, fullLabel: e.target.value }))}
                />
              </label>
              <label className="field">
                Harga (Rp)
                <input
                  type="number"
                  value={sizeForm.price}
                  onChange={(e) => setSizeForm((prev) => ({ ...prev, price: e.target.value }))}
                />
              </label>

              {sizeError && <p className="submit-error">{sizeError}</p>}

              <div className="admin-form-actions">
                <button type="submit" className="primary-button">Tambah</button>
                <button type="button" className="ghost-button" onClick={() => setSizeTarget(null)}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <p>Memuat produk...</p>
      ) : (
        <div className="admin-product-list">
          {products.map((product) => {
            const img = resolveProductImage(product.coverImage)
            return (
              <div className="admin-product-card" key={product.id}>
                <div className="admin-product-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {img ? (
                      <img src={img} alt={product.name} className="admin-product-thumb" />
                    ) : product.coverGradient ? (
                      <div
                        className="admin-product-thumb"
                        style={{ background: product.coverGradient }}
                      />
                    ) : null}
                    <div>
                      <h3>{product.name}</h3>
                      <p className="muted-text">{product.shortDescription}</p>
                      {product.featured && <span className="admin-badge badge-done">Featured</span>}
                    </div>
                  </div>
                  <div className="admin-product-actions">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => openEditForm(product)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDelete(product.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <div className="admin-sizes-section">
                  <div className="admin-sizes-header">
                    <strong>Ukuran & Harga</strong>
                    <button
                      type="button"
                      className="admin-add-size-btn"
                      onClick={() => openSizeForm(product)}
                    >
                      + Ukuran
                    </button>
                  </div>
                  {product.sizes?.length > 0 ? (
                    <div className="admin-sizes-list">
                      {product.sizes.map((size) => (
                        <div className="admin-size-row" key={size.id}>
                          <span>{size.fullLabel}</span>
                          <span>{formatRupiah(size.price)}</span>
                          <button
                            type="button"
                            className="admin-delete-size-btn"
                            onClick={() => handleDeleteSize(product.id, size.id)}
                            aria-label="Hapus ukuran"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-text">Belum ada ukuran.</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage
