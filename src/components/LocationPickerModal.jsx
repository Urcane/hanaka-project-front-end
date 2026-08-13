import { useEffect, useState } from 'react'
import LocationPickerMap from './LocationPickerMap.jsx'

// Pesan error geolocation dalam Bahasa Indonesia — kode error mengikuti
// GeolocationPositionError milik browser.
const GEO_ERRORS = {
  1: 'Izin lokasi ditolak. Aktifkan izin lokasi di browser, atau pilih titik langsung di peta.',
  2: 'Lokasi tidak bisa dideteksi. Pastikan GPS/layanan lokasi aktif, atau pilih titik langsung di peta.',
  3: 'Deteksi lokasi terlalu lama. Coba lagi, atau pilih titik langsung di peta.',
}

function formatCoordinate(point) {
  if (!point) return ''
  return `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`
}

/**
 * Isi popup. Dipisah dari pembungkusnya supaya komponen ini hanya hidup selama
 * popup terbuka — state draft otomatis bersih setiap kali dibuka lagi, tanpa
 * perlu effect penyelaras.
 */
function LocationPickerDialog({ center, value, onConfirm, onClose }) {
  const [draft, setDraft] = useState(value ?? null)
  const [geoStatus, setGeoStatus] = useState('idle') // idle | loading | error
  const [geoError, setGeoError] = useState('')

  // Esc menutup popup; scroll halaman di belakang dikunci selama popup terbuka.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleUseCurrentLocation = () => {
    // Geolocation hanya tersedia di konteks aman (https atau localhost).
    if (!navigator.geolocation) {
      setGeoStatus('error')
      setGeoError(
        'Browser ini tidak mendukung deteksi lokasi. Silakan pilih titik langsung di peta.',
      )
      return
    }

    setGeoStatus('loading')
    setGeoError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDraft({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setGeoStatus('idle')
      },
      (error) => {
        setGeoStatus('error')
        setGeoError(
          GEO_ERRORS[error.code] ??
            'Gagal mendeteksi lokasi. Silakan pilih titik langsung di peta.',
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const handleConfirm = () => {
    if (!draft) return
    onConfirm(draft)
  }

  return (
    <div
      className="map-modal-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="map-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-modal-title"
      >
        <div className="map-modal-head">
          <div>
            <h3 id="map-modal-title">Pilih Titik Pengantaran</h3>
            <p className="muted-text map-hint">
              Klik lokasi di peta atau geser pin ke titik yang tepat.
            </p>
          </div>
          <button
            type="button"
            className="map-modal-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <div className="map-modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleUseCurrentLocation}
            disabled={geoStatus === 'loading'}
          >
            {geoStatus === 'loading'
              ? 'Mendeteksi lokasi...'
              : '📍 Gunakan Lokasi Sekarang'}
          </button>
          {draft ? (
            <span className="map-coord">Titik: {formatCoordinate(draft)}</span>
          ) : (
            <span className="muted-text map-hint">Belum ada titik dipilih</span>
          )}
        </div>

        {geoStatus === 'error' && <p className="field-error">{geoError}</p>}

        <LocationPickerMap center={center} value={draft} onChange={setDraft} />

        <div className="map-modal-footer">
          <button type="button" className="ghost-button" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={handleConfirm}
            disabled={!draft}
          >
            Gunakan Titik Ini
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Popup pemilih titik antar.
 *
 * Titik yang dipilih baru dikirim ke parent saat tombol konfirmasi ditekan,
 * jadi menutup popup lewat Batal/Esc/klik latar tidak mengubah apa pun.
 */
function LocationPickerModal({ isOpen, ...props }) {
  if (!isOpen) return null
  return <LocationPickerDialog {...props} />
}

export default LocationPickerModal
