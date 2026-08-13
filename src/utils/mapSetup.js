import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Leaflet menyusun URL ikon default relatif terhadap file CSS-nya. Setelah
// di-bundle Vite, path itu tidak lagi valid — jadi ikonnya didaftarkan ulang
// dari asset yang sudah di-import.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION = '&copy; OpenStreetMap'

// Titik toko dipakai sebagai pusat peta default. Nilai sebenarnya diambil dari
// GET /api/store/profile (env STORE_LAT / STORE_LNG di backend).
export const STORE_FALLBACK = { lat: -1.2654, lng: 116.8312 }

/**
 * Pasang tile OpenStreetMap ke sebuah map instance.
 */
export function addBaseTiles(map) {
  L.tileLayer(TILE_URL, {
    maxZoom: 19,
    attribution: TILE_ATTRIBUTION,
  }).addTo(map)
}

export default L
