import { useEffect, useRef } from 'react'
import L, { STORE_FALLBACK, addBaseTiles } from '../utils/mapSetup.js'

/**
 * Peta pemilih titik antar pada halaman checkout.
 *
 * Memakai Leaflet langsung (bukan react-leaflet) supaya tidak menambah
 * dependensi dan aman dengan React 19 + React Compiler: seluruh instance peta
 * hidup di dalam ref, di luar siklus render React.
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
    const map = L.map(containerRef.current).setView([start.lat, start.lng], 14)
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

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // Sengaja hanya sekali: pembaruan posisi ditangani effect di bawah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pusatkan ulang saat koordinat toko baru diterima dan user belum memilih titik.
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || value || !center) return
    mapRef.current.setView([center.lat, center.lng], 14)
    markerRef.current.setLatLng([center.lat, center.lng])
  }, [center, value])

  return <div ref={containerRef} className="map-canvas" />
}

export default LocationPickerMap
