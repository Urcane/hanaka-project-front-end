# Membangun Fitur Baru: **Lacak Pesanan**

> **Materi terpadu Modul 2 + 3 + 4 — fitur fresh, full frontend, dibangun dari nol.** Halaman publik tempat siapa pun bisa mengecek status pesanan lewat nomor pesanan, **tanpa login**. Fitur ini belum ada di codebase; kamu menambahkannya mengikuti arsitektur Hanaka tanpa mengubah fitur lain.
>
> ✅ Sudah diuji: `npm run lint` lolos & `npm run build` sukses di branch `integration`.

---

## Apa yang dibangun

Halaman **/lacak**: user memasukkan nomor pesanan (mis. `HNK-20260624-103000-123`), lalu melihat status, tanggal, item, dan total pesanannya. Halaman ini **publik** (tidak butuh login) dan **tidak menyentuh state global** — dua keputusan desain yang justru jadi poin ajar menarik.

| Lapisan | Modul | Yang kamu buat |
|---|---|---|
| Halaman publik (tanpa guard) | **Modul 2** | Route `/lacak` polos — kontras dengan `/orders` yang `ProtectedRoute` |
| Validasi format nomor pesanan | **Modul 3** | `trackModel.js` baru — validator custom inline |
| Ambil status dari backend | **Modul 4** | `apiTrackOrder` baru → `api.get('/orders/track')` |

> Dua hal yang membedakan fitur ini dari Login/Checkout: **(1) route tanpa guard**, dan **(2) tidak lewat Context**. Pahami *kenapa* — itu inti materinya.

---

## Kontrak API yang diasumsikan

```
GET /orders/track?number=HNK-20260624-103000-123
  (publik — tidak wajib JWT)
  Sukses    : 200 { order: { orderNumber, status, createdAt, totalPrice, items[] } }
  Tak ada   : 404 { ok:false, error:'Pesanan tidak ditemukan.' }
```

> Endpoint ini **publik**: backend mencari order berdasarkan nomor saja. `apiService` tetap menempelkan `Authorization` kalau kebetulan ada token, tapi backend tidak mewajibkannya. Kalau endpoint belum ada, halaman tetap jalan sampai submit (request gagal di network — wajar saat backend belum siap).

---

## Peta fitur

```
                          ┌──────────────────────── MODUL 2 ───────────────────────┐
   URL /lacak  ──────────►│  App.jsx: <Route path="/lacak" element={<TrackOrderPage/>}│
                          │  TANPA guard → siapa pun boleh akses (publik)            │
                          └─────────────────────────┬───────────────────────────────┘
                                                     ▼
                          ┌──────────────────────── TrackOrderPage.jsx ─────────────┐
   user isi nomor & klik  │  handleSubmit:                                           │
   "Lacak"  ─────────────►│   1) validateTrackInput({ orderNumber })   ◄── MODUL 3   │
                          │   2) format salah → stop, tampilkan error               │
                          │   3) apiTrackOrder(...)  ← LANGSUNG, tanpa Context       │
                          └─────────────────────────┬───────────────────────────────┘
                                                     ▼
                          ┌──────────────────────── MODUL 4 ────────────────────────┐
                          │  apiTrackOrder → api.get('/orders/track?number=')        │
                          │  200 → setOrder(found), status='success'                 │
                          │  404 → status='notfound'  ·  lain → status='error'       │
                          └──────────────────────────────────────────────────────────┘
                                                     ▼
                          tampilkan kartu status (orderNumber, status, item, total)
```

---

# BAGIAN A — Bangun dari Bawah ke Atas

Tiap langkah ditandai **🆕 FILE BARU** atau **✏️ EDIT FILE**.

## Langkah 1 — 🆕 `src/models/trackModel.js` (Modul 3)

Validasi format nomor pesanan. Di sini kamu belajar bahwa framework validasi menerima **fungsi validator apa pun**, bukan cuma yang bawaan.

```js
import { validateSchema, validators } from '../validation/customValidation.js'

// Nomor pesanan dibuat di utils/id.js: HNK-YYYYMMDD-HHMMSS-NNN
const ORDER_NUMBER_REGEX = /^HNK-\d{8}-\d{6}-\d{3}$/

export function normalizeOrderNumber(value) {
  return String(value).trim().toUpperCase()  // rapikan: buang spasi, huruf besar
}

// Validator custom inline: (value) => string | null.
// Skip kalau kosong → biar `required` yang menangani (pola sama dgn validator bawaan).
function orderNumberFormat(message) {
  return (value) => {
    if (!value) return null
    return ORDER_NUMBER_REGEX.test(normalizeOrderNumber(value)) ? null : message
  }
}

const trackSchema = {
  orderNumber: [
    validators.required('Nomor pesanan wajib diisi.'),
    orderNumberFormat('Format nomor pesanan tidak sesuai (contoh: HNK-20260624-103000-123).'),
  ],
}

export function validateTrackInput(values) {
  return validateSchema(trackSchema, values)
}
```

**Yang harus kamu jelaskan:**
- Schema `trackSchema` memakai `required` bawaan **dan** `orderNumberFormat` buatan sendiri → bukti framework-nya *extensible*.
- `orderNumberFormat` mengikuti kontrak validator yang sama: terima `value`, return pesan error (string) atau `null`, dan **skip kalau kosong** supaya `required` yang menangani field kosong.
- Karena short-circuit, kalau nomor kosong yang muncul "wajib diisi", bukan "format salah".
- `normalizeOrderNumber` dipakai dua kali: saat validasi (samakan ke huruf besar sebelum dicek regex) dan sebelum dikirim ke backend.

## Langkah 2 — ✏️ `src/services/ordersApi.js` (Modul 4)

Tambah satu fungsi. Endpoint ini **publik**.

```js
// tambahkan setelah apiFetchOrderById
export async function apiTrackOrder(orderNumber) {
  const data = await api.get(`/orders/track?number=${encodeURIComponent(orderNumber)}`)
  return data.order
}
```

**Yang harus kamu jelaskan:**
- `encodeURIComponent` mengamankan nilai sebelum masuk query string (good practice).
- Beda dengan `apiFetchOrders` (butuh login, ambil semua pesanan milik user), `apiTrackOrder` cukup nomor — **publik**.
- Kalau backend balas `404`, `apiService` melempar `Error{ status:404 }` → page memetakannya jadi "tidak ditemukan".

## Langkah 3 — 🆕 `src/pages/TrackOrderPage.jsx` (Page: Modul 3 + 4)

Di sini ada **dua keputusan penting**: (a) memanggil service **langsung tanpa Context**, dan (b) memakai **state machine** `status` untuk merepresentasikan tiap kondisi UI.

```jsx
import { useState } from 'react'
import { validateTrackInput, normalizeOrderNumber } from '../models/trackModel.js'
import { hasAnyError } from '../validation/customValidation.js'
import { apiTrackOrder } from '../services/ordersApi.js'
import { formatRupiah } from '../utils/currency.js'

function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [errors, setErrors] = useState({})
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('idle')   // idle | loading | success | notfound | error
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    // ── MODUL 3: validasi format dulu ──
    const validationErrors = validateTrackInput({ orderNumber })
    setErrors(validationErrors)
    if (hasAnyError(validationErrors)) return

    // ── MODUL 4: panggil service LANGSUNG (tanpa Context) ──
    setStatus('loading')
    setOrder(null)
    setErrorMessage('')
    try {
      const found = await apiTrackOrder(normalizeOrderNumber(orderNumber))
      setOrder(found)
      setStatus('success')
    } catch (err) {
      if (err.status === 404) {
        setStatus('notfound')
      } else {
        setStatus('error')
        setErrorMessage(err.message || 'Gagal melacak pesanan. Silakan coba lagi.')
      }
    }
  }

  const handleChange = (event) => {
    setOrderNumber(event.target.value)
    setErrors({})
  }

  return (
    <section className="stack-gap-lg">
      <header className="section-head">
        <p className="brand-eyebrow">Hanaka Cake</p>
        <h2>Lacak Pesanan</h2>
        <p className="muted-text">Masukkan nomor pesananmu untuk melihat status terkini. Tanpa perlu login.</p>
      </header>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <label className="field" htmlFor="track-number">
          Nomor Pesanan
          <input id="track-number" type="text" name="orderNumber"
            placeholder="HNK-20260624-103000-123"
            value={orderNumber} onChange={handleChange} />
          {errors.orderNumber && <span className="field-error">{errors.orderNumber}</span>}
        </label>
        <button type="submit" className="primary-button" disabled={status === 'loading'}>
          {status === 'loading' ? 'Mencari...' : 'Lacak'}
        </button>
      </form>

      {status === 'notfound' && (
        <p className="submit-error">Pesanan tidak ditemukan. Periksa kembali nomor pesananmu.</p>
      )}
      {status === 'error' && <p className="submit-error">{errorMessage}</p>}

      {status === 'success' && order && (
        <article className="panel history-card">
          <div className="history-head">
            <div>
              <h3>{order.orderNumber}</h3>
              <p className="muted-text">{new Date(order.createdAt).toLocaleString('id-ID')}</p>
            </div>
            <span className="status-badge">{order.status}</span>
          </div>
          <div className="history-items">
            {order.items.map((item) => (
              <div key={item.id} className="history-item-row">
                <p>{item.productName} - {item.sizeLabel} ({item.quantity} pcs)</p>
                <p>{formatRupiah(item.totalPrice)}</p>
              </div>
            ))}
          </div>
          <p>Total Order: <strong>{formatRupiah(order.totalPrice)}</strong></p>
        </article>
      )}
    </section>
  )
}

export default TrackOrderPage
```

**Dua keputusan desain yang wajib kamu kuasai:**

1. **Tanpa Context.** Login & Checkout lewat Context karena hasilnya mengubah **state global** (`currentUser`, `cart`). Lacak Pesanan hasilnya **lokal di halaman ini saja** — tidak ada komponen lain yang butuh tahu. Maka page memanggil `apiTrackOrder` **langsung**. Aturannya: *Context untuk state yang dibagikan; service langsung untuk hasil yang dipakai satu halaman.*
2. **State machine `status`.** Daripada banyak boolean (`isLoading`, `isError`, `isNotFound`) yang bisa saling bertabrakan, satu variabel `status` dengan nilai `idle/loading/success/notfound/error` membuat UI selalu konsisten (mustahil "loading sekaligus error"). Ini pola yang rapi dan layak disebut di skripsi.

## Langkah 4 — ✏️ `src/App.jsx` (Modul 2)

Daftarkan route **publik** di dalam grup `AppLayout`. **Tidak ada** pembungkus guard.

```jsx
// (1) import
import TrackOrderPage from './pages/TrackOrderPage.jsx'

// (2) route polos, di dalam <Route element={<AppLayout/>}>
<Route path="/lacak" element={<TrackOrderPage />} />
```

**Yang harus kamu jelaskan (poin Modul 2):**
- **Kenapa tanpa guard?** Karena melacak pesanan tidak butuh akun — tamu yang memesan tanpa login pun harus bisa cek statusnya. Bandingkan dengan `/orders` (riwayat semua pesanan milik user) yang dibungkus `ProtectedRoute`.
- Tetap di dalam grup `AppLayout` → dapat header, nav, dan footer yang sama.
- Keputusan "guard atau tidak" adalah bagian dari **desain keamanan & UX rute** — bukan asal pasang.

---

# BAGIAN B — Jejak Runtime (atas ke bawah)

Skenario: tamu (tanpa login) membuka `/lacak`, mengetik nomor valid, klik **Lacak**.

1. **(Modul 2)** Router cocokkan `/lacak` → render `TrackOrderPage` (tanpa guard, langsung tampil).
2. User ketik nomor → `handleChange` update `orderNumber`, reset error.
3. User klik **Lacak** → `handleSubmit`.
4. **(Modul 3)** `validateTrackInput({ orderNumber })` → `required` lolos, `orderNumberFormat` cek regex → return `{}` (valid).
5. `hasAnyError({})` false → lanjut. `status` di-set `'loading'`.
6. **(Modul 4)** `apiTrackOrder(normalizeOrderNumber(orderNumber))` → `api.get('/orders/track?number=...')`.
7. **(Modul 4)** `apiService` rakit header → `fetch` → backend balas `200 { order }`.
8. **(Page)** `setOrder(found)` + `setStatus('success')`.
9. **(Page)** UI render kartu status: nomor, badge status, daftar item, total. Selesai — **tanpa menyentuh Context sama sekali**.

---

# BAGIAN C — Tiga Skenario Wajib

### Skenario 1 — Format salah (Modul 3)
User ketik `12345`. `validateTrackInput` → `orderNumberFormat` gagal cocok regex → `{ orderNumber: 'Format nomor pesanan tidak sesuai...' }` → `hasAnyError` true → **berhenti sebelum hit backend**. Tidak ada request.

### Skenario 2 — Tidak ditemukan / 404 (Modul 4)
Format benar, tapi nomor tidak ada di DB. Backend balas `404`. `apiService` lempar `Error{ status:404 }`. Di `catch`, `err.status === 404` → `setStatus('notfound')` → muncul pesan "Pesanan tidak ditemukan." `order` tetap `null`.

### Skenario 3 — Sukses (Modul 2+3+4)
Tamu (tanpa login) berhasil melihat status pesanannya. Membuktikan rute publik bekerja (Modul 2), validasi lolos (Modul 3), service mengembalikan data (Modul 4) — semua tanpa Context.

---

## Dua kontras penting (bahan diskusi sidang)

| Aspek | Fitur ber-guard (mis. /orders) | Lacak Pesanan (/lacak) |
|---|---|---|
| Route | `ProtectedRoute` (harus login) | polos (publik) |
| Sumber data | `apiFetchOrders` (semua order milik user, butuh JWT) | `apiTrackOrder` (satu order via nomor, publik) |
| State | lewat Context (dibagikan) | **langsung di page** (lokal) |
| Kondisi UI | loading/empty/list | **state machine** idle→loading→success/notfound/error |

> Inti: **tidak semua fitur butuh guard, dan tidak semua fitur butuh Context.** Kemampuan memutuskan kapan perlu/tidak inilah tanda paham arsitektur — bukan sekadar meniru pola.

---

## Pemetaan ke BAB Skripsi

| Bagian fitur | Modul | BAB |
|---|---|---|
| `trackModel.js` (validator custom inline) | 3 | Perancangan — Logika / Validasi |
| `apiTrackOrder` (endpoint publik) | 4 | Integrasi Client–Server |
| Route `/lacak` tanpa guard (vs ProtectedRoute) | 2 | Perancangan — Keamanan & Akses Rute |
| Keputusan "tanpa Context" | 5 (singgung) | Implementasi — State Management |
| State machine `status` | — | Pembahasan — kualitas UI/UX |
| Jejak runtime end-to-end | 2·3·4 | Implementasi & Pengujian |

---

## ✅ Self-Check
1. Kenapa route `/lacak` tidak pakai guard, padahal `/orders` pakai?
2. Kenapa halaman ini memanggil `apiTrackOrder` langsung, bukan lewat Context?
3. Apa keuntungan `status` (state machine) dibanding beberapa boolean terpisah?
4. Bagaimana `orderNumberFormat` membuktikan framework validasi bersifat extensible?
5. Di skenario 404, properti `err` apa yang dipakai, dan dari mana asalnya?
6. Kenapa `normalizeOrderNumber` dipanggil di validasi DAN sebelum kirim?

## 🛠 Latihan
- **(Extension Modul 2)** Buat link yang bisa dibagikan: tambah route `/lacak/:orderNumber`, baca dengan `useParams()`, lalu auto-fetch lewat `useEffect` (pakai pola `cancelled` seperti restore sesi di `AppContext`). Form submit cukup `navigate('/lacak/' + nomor)`.
- **Tambah validasi:** tolak nomor dengan tanggal di masa depan (mis. tahun > tahun ini) sebagai validator custom inline kedua.
- **Unit test (capstone):** tulis 3 test untuk `validateTrackInput` (valid, kosong, format salah) + 1 test untuk `normalizeOrderNumber` (cek trim & uppercase). Semua fungsi pure.
- **Trace manual:** tulis urutan fungsi dari klik "Lacak" sampai kartu status muncul (tanpa lihat Bagian B).

## Pertanyaan Sidang
- "Apakah halaman ini aman dibuka tanpa login?" → Ya, sengaja publik; yang ditampilkan hanya status satu pesanan berdasarkan nomor. Data sensitif lain tetap di balik login & validasi backend.
- "Kenapa tidak semua fitur lewat Context?" → Context untuk state global yang dibagikan; hasil lacak lokal di satu halaman, jadi service langsung lebih sederhana & tepat.
- "Validasi format di client cukup?" → Tidak; backend tetap penentu (cari di DB, balas 404 kalau tak ada). Client hanya menyaring input jelas-salah lebih awal.

---

## Ringkasan file (checklist implementasi)

| File | Status | Modul |
|---|---|---|
| `src/models/trackModel.js` | 🆕 buat | 3 |
| `src/services/ordersApi.js` | ✏️ tambah `apiTrackOrder` | 4 |
| `src/pages/TrackOrderPage.jsx` | 🆕 buat | 3 + 4 |
| `src/App.jsx` | ✏️ import + route `/lacak` (tanpa guard) | 2 |

> Diuji di branch `integration` (commit `c277a66`): `npm run lint` lolos, `npm run build` sukses.
