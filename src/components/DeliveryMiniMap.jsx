import { useEffect, useRef } from 'react'
import L, { STORE_FALLBACK, addBaseTiles } from '../utils/mapSetup.js'
import { getCourierProgress, hasDeliveryPoint } from '../models/trackModel.js'

/**
 * Minimap titik untuk halaman lacak pesanan: marker toko, marker tujuan, garis
 * putus-putus penghubung, dan satu titik posisi *estimasi* yang bergerak
 * mengikuti status pesanan (bukan GPS kurir sungguhan).
 *
 * Order pickup — atau order lama tanpa koordinat — hanya menampilkan toko.
 */
function DeliveryMiniMap({ order, storePoint }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  const store = storePoint ?? STORE_FALLBACK
  const showRoute = hasDeliveryPoint(order)
  const progress = getCourierProgress(order)

  useEffect(() => {
    if (!containerRef.current) return undefined

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
      }).setView([store.lat, store.lng], 13)
      addBaseTiles(map)
      mapRef.current = map
    }

    const map = mapRef.current

    // Gambar ulang isi peta tiap kali status/koordinat berubah.
    layerRef.current?.remove()
    const layer = L.layerGroup().addTo(map)
    layerRef.current = layer

    L.marker([store.lat, store.lng])
      .addTo(layer)
      .bindPopup('<strong>Hanaka Cake</strong><br>Titik penjemputan pesanan')

    if (!showRoute) {
      map.setView([store.lat, store.lng], 14)
      return undefined
    }

    const destination = { lat: order.deliveryLat, lng: order.deliveryLng }

    L.marker([destination.lat, destination.lng])
      .addTo(layer)
      .bindPopup('<strong>Tujuan pengantaran</strong>')

    // Interpolasi lurus antara toko dan tujuan sesuai progres status.
    const courier = {
      lat: store.lat + (destination.lat - store.lat) * progress,
      lng: store.lng + (destination.lng - store.lng) * progress,
    }

    // Garis tracking dibagi dua: bagian yang sudah dilalui digambar tegas,
    // sisanya putus-putus — sehingga progres terbaca sekali lihat.
    L.polyline(
      [
        [store.lat, store.lng],
        [courier.lat, courier.lng],
      ],
      { color: '#934428', weight: 4, opacity: 0.95 },
    ).addTo(layer)

    L.polyline(
      [
        [courier.lat, courier.lng],
        [destination.lat, destination.lng],
      ],
      { color: '#c8683d', weight: 3, dashArray: '6 8', opacity: 0.65 },
    ).addTo(layer)

    L.circleMarker([courier.lat, courier.lng], {
      radius: 9,
      color: '#ffffff',
      weight: 3,
      fillColor: '#934428',
      fillOpacity: 1,
    })
      .addTo(layer)
      .bindPopup('<strong>Perkiraan posisi</strong><br>Estimasi dari status pesanan')

    map.fitBounds(
      [
        [store.lat, store.lng],
        [destination.lat, destination.lng],
      ],
      { padding: [40, 40], maxZoom: 15 },
    )

    return undefined
  }, [order, progress, showRoute, store.lat, store.lng])

  // Bongkar peta saat komponen dilepas.
  useEffect(() => {
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  return (
    <div className="delivery-minimap">
      <div ref={containerRef} className="map-canvas" />
      <p className="muted-text map-hint">
        {showRoute
          ? 'Titik oranye adalah perkiraan posisi berdasarkan status pesanan, bukan lokasi GPS kurir.'
          : 'Pesanan ini diambil di toko, jadi peta hanya menampilkan lokasi Hanaka Cake.'}
      </p>
    </div>
  )
}

export default DeliveryMiniMap
