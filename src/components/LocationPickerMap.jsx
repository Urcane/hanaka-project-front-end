import { useEffect, useRef } from 'react'
import L, { STORE_FALLBACK, addBaseTiles } from '../utils/mapSetup.js'

// Dua koordinat dianggap sama bila selisihnya di bawah ini (~1 cm), dipakai
// supaya update marker dari luar tidak memicu onChange balik ke pemanggil.
const EPSILON = 0.0000001

function isSamePoint(a, b) {
  if (!a || !b) return false
  return Math.abs(a.lat - b.lat) < EPSILON && Math.abs(a.lng - b.lng) < EPSILON
}

/**
 * Peta pemilih titik antar.
 *
 * Memakai Leaflet langsung (bukan react-leaflet) supaya tidak menambah
 * dependensi dan aman dengan React 19 + React Compiler: seluruh instance peta
 * hidup di dalam ref, di luar siklus render React.
 *
 * Titik bisa dipilih dengan tiga cara — klik peta, geser pin, atau di-set dari
 * luar lewat prop `value` (dipakai tombol "gunakan lokasi sekarang").
 */
function LocationPickerMap({ center, value, onChange }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  // Handler terbaru disimpan di ref agar peta tidak perlu dibangun ulang tiap
  // kali parent re-render.
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined

    const start = value ?? center ?? STORE_FALLBACK
    const map = L.map(containerRef.current).setView([start.lat, start.lng], 15)
    addBaseTiles(map)

    const marker = L.marker([start.lat, start.lng], { draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const position = marker.getLatLng()
      onChangeRef.current?.({ lat: position.lat, lng: position.lng })
    })

    map.on('click', (event) => {
      marker.setLatLng(event.latlng)
      onChangeRef.current?.({ lat: event.latlng.lat, lng: event.latlng.lng })
    })

    mapRef.current = map
    markerRef.current = marker

    // Peta yang dibuat di dalam modal kadang mengukur container sebelum
    // animasi buka selesai — hitung ulang setelah frame berikutnya.
    const resizeTimer = setTimeout(() => map.invalidateSize(), 120)

    return () => {
      clearTimeout(resizeTimer)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // Sengaja hanya sekali: pembaruan posisi ditangani effect di bawah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ikuti perubahan titik dari luar (tombol lokasi sekarang), dan pusatkan ulang
  // ke toko selama pelanggan belum memilih titik apa pun.
  useEffect(() => {
    const map = mapRef.current
    const marker = markerRef.current
    if (!map || !marker) return

    const target = value ?? center
    if (!target) return

    const current = marker.getLatLng()
    if (isSamePoint({ lat: current.lat, lng: current.lng }, target)) return

    marker.setLatLng([target.lat, target.lng])
    map.setView([target.lat, target.lng], value ? 17 : 15)
  }, [center, value])

  return <div ref={containerRef} className="map-canvas" />
}

export default LocationPickerMap
