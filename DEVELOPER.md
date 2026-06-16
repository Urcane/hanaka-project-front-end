# Hanaka Cake — Developer Documentation (Frontend)

> Dokumentasi teknis lengkap untuk developer yang bekerja di repository **frontend** Hanaka Cake.
> Dokumen ini menjelaskan arsitektur, alur data, layer API, dan konvensi kode secara mendalam.
>
> Terakhir diperbarui: 2026-06-09

---

## Daftar Isi

1. [Tentang Aplikasi](#1-tentang-aplikasi)
2. [Tech Stack & Versi](#2-tech-stack--versi)
3. [Setup & Menjalankan Proyek](#3-setup--menjalankan-proyek)
4. [Struktur Folder](#4-struktur-folder)
5. [Arsitektur & Lapisan Kode](#5-arsitektur--lapisan-kode)
6. [State Management (Context)](#6-state-management-context)
7. [Routing & Route Guards](#7-routing--route-guards)
8. [Layer Services — Referensi API](#8-layer-services--referensi-api)
9. [Models — Business Logic](#9-models--business-logic)
10. [Validation Framework](#10-validation-framework)
11. [Alur Fitur Utama](#11-alur-fitur-utama)
12. [Utilities](#12-utilities)
13. [Styling](#13-styling)
14. [Konvensi Kode](#14-konvensi-kode)
15. [Build & Deployment](#15-build--deployment)
16. [Troubleshooting & Catatan Penting](#16-troubleshooting--catatan-penting)

---

## 1. Tentang Aplikasi

**Hanaka Cake** adalah aplikasi web e-commerce untuk pemesanan kue custom milik toko kue di Balikpapan, Kalimantan Timur. Frontend ini adalah Single Page Application (SPA) React yang **sudah terintegrasi penuh** dengan backend REST API (Slim PHP + MySQL).

| Aspek | Detail |
|---|---|
| Jenis | E-commerce kue custom (cake ordering), B2C |
| Pengguna | Customer retail + Admin toko |
| Bahasa UI & validasi | Bahasa Indonesia |
| Bahasa kode | Bahasa Inggris (variabel, fungsi, komentar) |
| Backend (repo terpisah) | `../hanaka-project-back-end` (Slim PHP 4 + MySQL 8) |
| Payment | Midtrans Core API — QRIS (real, bukan simulasi) |

**Dua jenis user:**
- **Customer** — browsing menu, kustomisasi cake, cart, checkout, bayar QRIS/cash, lihat riwayat order. Bisa sebagai **guest** (tanpa login) atau **member** (login).
- **Admin** — dashboard, kelola order, kelola produk + ukuran + gambar, lihat customer.

---

## 2. Tech Stack & Versi

| Kategori | Teknologi | Versi | Catatan |
|---|---|---|---|
| UI Library | React | `^19.2.4` | React 19 + **React Compiler** aktif |
| Build tool | Vite | `^8.0.4` | Dev server di port 5173 |
| Routing | react-router-dom | `^7.14.1` | Client-side routing (BrowserRouter) |
| QR Code | qrcode | `^1.5.4` | Render EMV QRIS string → PNG data URL |
| Linting | ESLint | `^9.39.4` | Flat config + react-hooks + react-refresh |
| Compiler | babel-plugin-react-compiler | `^1.0.0` | Auto-memoization |
| Styling | CSS murni | — | Google Fonts (Fraunces + Manrope), tanpa CSS framework |

> ⚠️ **Tidak menggunakan TypeScript** — pure JavaScript + JSX.
>
> ⚠️ **React Compiler aktif** — kode harus bebas side-effect di dalam render. Jangan menulis mutation atau efek samping selama fase render.

### Konfigurasi build ([vite.config.js](./vite.config.js))

```js
plugins: [
  react(),
  babel({ presets: [reactCompilerPreset()] })  // React Compiler
]
```

### Konfigurasi lint ([eslint.config.js](./eslint.config.js))

- Mengabaikan folder `dist`.
- Rule khusus: `no-unused-vars` mengizinkan variabel diawali huruf kapital / underscore (`^[A-Z_]`).
- Mengaktifkan `reactRefresh.configs.vite` — **inilah alasan context dipecah jadi 3 file** (lihat [§6](#6-state-management-context)).

---

## 3. Setup & Menjalankan Proyek

### Prasyarat
- Node.js (LTS terbaru direkomendasikan)
- Backend Hanaka berjalan (untuk integrasi penuh) — lihat `../hanaka-project-back-end`

### Instalasi & menjalankan

```bash
npm install        # Install dependencies
npm run dev        # Dev server → http://localhost:5173
npm run build      # Production build → folder dist/
npm run preview    # Preview hasil build production
npm run lint       # Jalankan ESLint
```

### Environment Variable

Buat file `.env` di root:

```env
# Base URL backend (WAJIB diakhiri /api)
VITE_API_URL=http://localhost:8080/api
```

| Variabel | Default (fallback) | Keterangan |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api` | Base URL REST API. Fallback didefinisikan di [apiService.js](./src/services/apiService.js). |

> 📌 **Catatan**: `.env` yang ada saat ini menunjuk ke **production** (`https://backend.hanaka-store.my.id/api`). Untuk pengembangan lokal, ganti ke `http://localhost:8080/api`.
>
> 📌 Variabel Vite **harus** diawali prefix `VITE_` agar ter-expose ke kode client lewat `import.meta.env`.

---

## 4. Struktur Folder

```
src/
├── assets/                  # Gambar statis (logo, hero, foto produk: brownies.jpg, strawberry-cake.jpg, dll)
│
├── components/              # Reusable components & layout shell
│   ├── AppLayout.jsx        # Shell customer: header + nav + cart badge + footer (<Outlet/>)
│   ├── AdminLayout.jsx      # Shell admin
│   ├── SiteFooter.jsx       # Footer (info toko)
│   ├── AdminRoute.jsx       # Guard: hanya role 'admin'
│   ├── GuestRoute.jsx       # Guard: redirect kalau SUDAH login
│   └── ProtectedRoute.jsx   # Guard: redirect ke /login kalau BELUM login
│
├── context/                 # Global state (WAJIB 3 file — lihat §6)
│   ├── AppContext.jsx       # Provider: semua state + actions
│   ├── appContextObject.js  # createContext(null) — dipisah untuk react-refresh
│   └── useApp.js            # Custom hook useApp()
│
├── data/
│   └── products.js          # ⚠ Sebagian legacy: katalog & sizes TIDAK dipakai (data dari API),
│                            #   tapi `storeProfile` MASIH dipakai (CheckoutPage, footer)
│
├── models/                  # Business logic murni (NO React)
│   ├── authModel.js         # Schema validasi register/login + buildAccount
│   ├── cartModel.js         # buildCartItem, rebuildCartItem, computeCartSubtotal, validateCustomizationInput
│   ├── checkoutModel.js     # validateCheckoutInput, buildCheckoutPayload, PAYMENT_METHODS, PICKUP_METHODS
│   ├── orderModel.js        # ⚠ Legacy
│   └── productModel.js      # getFeaturedProducts, findProductById, findSizeOption, getProductStartingPrice
│
├── pages/                   # Komponen level-halaman
│   ├── HomePage.jsx
│   ├── MenuPage.jsx
│   ├── CustomizeCakePage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── PaymentQrisPage.jsx  # Real Midtrans QR + countdown + polling status
│   ├── OrderHistoryPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── admin/
│       ├── AdminDashboardPage.jsx
│       ├── AdminOrdersPage.jsx
│       ├── AdminOrderDetailPage.jsx
│       ├── AdminProductsPage.jsx
│       └── AdminCustomersPage.jsx
│
├── services/                # SEMUA komunikasi ke backend
│   ├── apiService.js        # Base fetch wrapper (JWT + session token + ngrok header)
│   ├── authApi.js           # /auth/*
│   ├── cartApi.js           # /cart/*
│   ├── ordersApi.js         # /orders/*
│   ├── paymentApi.js        # /payments/qris + status
│   ├── productsApi.js       # /products/*
│   ├── adminApi.js          # /admin/*
│   └── qrisService.js       # Render EMV qrString → PNG (npm qrcode, BUKAN API call)
│
├── styles/
│   ├── app.css              # Stylesheet customer
│   └── admin.css            # Stylesheet admin
│
├── utils/
│   ├── currency.js          # formatRupiah() — Intl IDR
│   ├── id.js                # createId(prefix), createOrderNumber()
│   └── productImages.js     # resolveProductImage(coverImage) → asset lokal / URL backend
│
├── validation/
│   └── customValidation.js  # Framework validasi schema-based (tanpa library)
│
├── index.css                # CSS variables & body styles
├── main.jsx                 # Entry point (StrictMode + BrowserRouter + AppProvider)
└── App.jsx                  # Definisi semua route
```

---

## 5. Arsitektur & Lapisan Kode

Aplikasi memakai pemisahan lapisan yang tegas. Arah dependensi: **Pages → Context → Services → Backend**, dengan **Models** & **Validation** sebagai helper murni.

```
┌──────────────────────────────────────────────────────────────┐
│  PAGES (UI)                                                    │
│  HomePage, MenuPage, CartPage, CheckoutPage, PaymentQrisPage…  │
│  - Render UI, handle event, local form state (useState)        │
│  - Ambil global state & actions via useApp()                   │
└───────────────┬───────────────────────────┬──────────────────┘
                │ useApp()                   │ import langsung
                ▼                            ▼
┌──────────────────────────────┐   ┌────────────────────────────┐
│  CONTEXT (global state)      │   │  MODELS + VALIDATION        │
│  AppContext.jsx              │   │  (pure JS, no React)        │
│  - currentUser, products,    │   │  - validateCheckoutInput()  │
│    cartItems, userOrders     │   │  - buildCartItem()          │
│  - actions: login, addToCart │   │  - computeCartSubtotal()    │
└───────────────┬──────────────┘   └────────────────────────────┘
                │ panggil
                ▼
┌──────────────────────────────────────────────────────────────┐
│  SERVICES (API layer)                                          │
│  authApi, cartApi, ordersApi, paymentApi, productsApi, adminApi│
│         └── semuanya lewat apiService.js (fetch wrapper)       │
└───────────────┬──────────────────────────────────────────────┘
                │ HTTP (fetch + JWT + X-Session-Token)
                ▼
        ┌──────────────────────────┐
        │  BACKEND REST API         │
        │  Slim PHP + MySQL         │
        │  + Midtrans (QRIS)        │
        └──────────────────────────┘
```

**Prinsip kunci:**
- **Pages tidak pernah memanggil `fetch` langsung** — selalu lewat Context (untuk state global) atau Services (khusus admin/payment yang tidak disimpan di context global).
- **Services tidak pernah menyentuh React** — hanya fungsi async biasa.
- **Models & Validation 100% pure** — bisa di-unit-test tanpa render.
- **`apiService.js` adalah satu-satunya tempat** yang menangani header auth, base URL, dan error normalization.

---

## 6. State Management (Context)

Global state dikelola via React Context dan **WAJIB dipecah menjadi 3 file**. Ini bukan preferensi gaya — ini syarat agar ESLint `react-refresh/only-export-components` (Fast Refresh) tidak error.

| File | Isi | Alasan dipisah |
|---|---|---|
| [appContextObject.js](./src/context/appContextObject.js) | `createContext(null)` saja | Object context bukan komponen → tidak boleh satu file dengan komponen |
| [useApp.js](./src/context/useApp.js) | Hook `useApp()` + guard "harus di dalam AppProvider" | Hook bukan komponen |
| [AppContext.jsx](./src/context/AppContext.jsx) | Komponen `<AppProvider>` + semua state & action | Hanya meng-export komponen |

> 🚫 **JANGAN gabungkan ketiga file ini.** Menggabungnya akan memecah Fast Refresh dan memunculkan error lint.

### State yang disediakan oleh `AppProvider`

| State | Tipe | Sumber |
|---|---|---|
| `currentUser` | `object \| null` | `GET /auth/me` saat mount; di-set saat login/register |
| `isAuthLoading` | `boolean` | `true` sampai auth restore selesai |
| `products` | `array` | `GET /products` saat mount |
| `featuredProducts` | `array` (memoized) | `getFeaturedProducts(products)` |
| `isLoadingProducts` | `boolean` | status fetch produk |
| `cartItems` | `array` | `GET /cart` |
| `cartSubtotal` | `number` | dari response cart |
| `cartItemCount` | `number` | dari response cart |
| `isCartLoading` | `boolean` | status fetch cart |
| `userOrders` | `array` | `GET /orders` (di-refresh manual via `refreshOrders`) |

### Actions yang disediakan

| Action | Memanggil | Efek |
|---|---|---|
| `registerAccount(values)` | `apiRegister` | Set `currentUser`, simpan JWT |
| `loginAccount(values)` | `apiLogin` | Set `currentUser`, simpan JWT |
| `logoutAccount()` | `apiLogout` | Hapus token, `currentUser = null` |
| `addToCart(payload)` | `apiAddCartItem` → `refreshCart` | Tambah item, sync cart |
| `editCartItem(itemId, payload)` | `apiUpdateCartItem` → `refreshCart` | Edit item |
| `updateCartQuantity(itemId, qty)` | `apiUpdateCartItemQuantity` → `refreshCart` | Ubah jumlah |
| `removeCartItem(itemId)` | `apiRemoveCartItem` → `refreshCart` | Hapus item |
| `clearCart()` | `apiClearCart` | Kosongkan cart |
| `placeOrder(payload)` | `apiPlaceOrder` → `refreshCart` | Buat order |
| `getOrderById(orderId)` | `apiFetchOrderById` | Ambil 1 order (null jika gagal) |
| `refreshOrders()` | `apiFetchOrders` | Isi `userOrders` |
| `markCurrentUserOrderPaid(orderId)` | `apiMarkOrderPaid` | Tandai order dibayar |

### Lifecycle / efek penting

- **Auth restore** dan **fetch produk** berjalan sekali saat mount (`useEffect` dengan dependency `[]`).
- **Cart di-refetch setiap kali `currentUser` berubah** (`useEffect` dependency `[currentUser]`) — supaya cart guest ter-merge ke cart user setelah login.
- Semua efek async memakai pola `let cancelled = false` + cleanup untuk mencegah setState setelah unmount (penting di React 19 StrictMode yang double-invoke efek).

---

## 7. Routing & Route Guards

Definisi route ada di [App.jsx](./src/App.jsx). `BrowserRouter` dibungkus di [main.jsx](./src/main.jsx).

### Customer Routes (di dalam `<AppLayout>`)

| Path | Komponen | Guard |
|---|---|---|
| `/` | HomePage | — |
| `/home` | → redirect ke `/` | — |
| `/menu` | MenuPage | — |
| `/menu/:productId` | CustomizeCakePage | — |
| `/cart` | CartPage | — |
| `/checkout` | CheckoutPage | — |
| `/payment/:orderId` | PaymentQrisPage | — |
| `/orders` | OrderHistoryPage | `ProtectedRoute` |
| `/login` | LoginPage | `GuestRoute` |
| `/register` | RegisterPage | `GuestRoute` |
| `*` | → redirect ke `/` | — |

### Admin Routes (di dalam `<AdminRoute><AdminLayout>`)

| Path | Komponen |
|---|---|
| `/admin` | → redirect ke `/admin/dashboard` |
| `/admin/dashboard` | AdminDashboardPage |
| `/admin/orders` | AdminOrdersPage |
| `/admin/orders/:orderId` | AdminOrderDetailPage |
| `/admin/products` | AdminProductsPage |
| `/admin/customers` | AdminCustomersPage |

### Route Guards

Ketiga guard memakai `isAuthLoading` untuk menampilkan "Memuat..." dulu sebelum memutuskan redirect (menghindari flicker / salah-redirect saat auth belum restore).

| Guard | Aturan |
|---|---|
| [ProtectedRoute](./src/components/ProtectedRoute.jsx) | Jika tidak ada `currentUser` → redirect `/login` dengan `state.redirectTo` = path saat ini |
| [AdminRoute](./src/components/AdminRoute.jsx) | Jika tidak login **atau** `role !== 'admin'` → redirect `/login` |
| [GuestRoute](./src/components/GuestRoute.jsx) | Jika **sudah** login → redirect `/admin/dashboard` (admin) atau `/` (customer) |

> 💡 Pola `state.redirectTo` dipakai LoginPage untuk mengembalikan user ke halaman asal setelah login (mis. dari checkout sebagai guest).

---

## 8. Layer Services — Referensi API

Semua panggilan HTTP melewati [apiService.js](./src/services/apiService.js).

### `apiService.js` — base fetch wrapper

**Header yang otomatis dikirim di setiap request:**

| Header | Kondisi | Sumber |
|---|---|---|
| `Content-Type: application/json` | selalu (kecuali upload) | hardcoded |
| `ngrok-skip-browser-warning: true` | selalu | hardcoded — **jangan dihapus** |
| `Authorization: Bearer <jwt>` | jika `authToken` ada | `localStorage['hanaka_auth_token']` |
| `X-Session-Token: <token>` | jika `sessionToken` ada | `localStorage['hanaka_session_token']` |

**Token management (module-level, in-memory + localStorage):**

| Fungsi | Aksi |
|---|---|
| `setAuthToken(token)` | Simpan JWT ke memory + localStorage |
| `clearAuthToken()` | Hapus JWT |
| `getSessionToken()` | Ambil session token guest |
| `setSessionToken(token)` | Simpan session token guest |

**API helper:**

```js
api.get(path)
api.post(path, body)
api.put(path, body)
api.patch(path, body)
api.delete(path)
apiUpload(path, formData)   // multipart, untuk upload gambar produk
```

**Error handling**: Jika `!res.ok`, lempar `Error` dengan properti tambahan:
- `error.status` — HTTP status code
- `error.errors` — object field-level errors dari backend (dipakai untuk menampilkan error per-field di form)
- `error.message` — `data.error` dari backend atau `'Terjadi kesalahan.'`

### Daftar lengkap endpoint per service

#### Auth — [authApi.js](./src/services/authApi.js)
| Fungsi | Method | Endpoint | Catatan |
|---|---|---|---|
| `apiRegister(data)` | POST | `/auth/register` | Auto-simpan JWT dari response |
| `apiLogin(data)` | POST | `/auth/login` | Auto-simpan JWT |
| `apiLogout()` | POST | `/auth/logout` | Selalu `clearAuthToken()` di `finally` |
| `apiGetMe()` | GET | `/auth/me` | Return `result.user` |

#### Cart — [cartApi.js](./src/services/cartApi.js)
| Fungsi | Method | Endpoint | Catatan |
|---|---|---|---|
| `apiFetchCart()` | GET | `/cart` | Return `{ items, subtotal, itemCount }` |
| `apiAddCartItem(payload)` | POST | `/cart/items` | Jika response punya `sessionToken` → simpan (guest cart) |
| `apiUpdateCartItem(itemId, payload)` | PUT | `/cart/items/:id` | Edit penuh item |
| `apiUpdateCartItemQuantity(itemId, qty)` | PATCH | `/cart/items/:id/quantity` | Hanya quantity |
| `apiRemoveCartItem(itemId)` | DELETE | `/cart/items/:id` | |
| `apiClearCart()` | DELETE | `/cart` | |

#### Orders — [ordersApi.js](./src/services/ordersApi.js)
| Fungsi | Method | Endpoint | Catatan |
|---|---|---|---|
| `apiPlaceOrder(payload)` | POST | `/orders` | Backend ambil cart dari DB via JWT/session token |
| `apiFetchOrders()` | GET | `/orders` | Return `data.orders` |
| `apiFetchOrderById(orderId)` | GET | `/orders/:id` | Return `data.order` |
| `apiMarkOrderPaid(orderId)` | PATCH | `/orders/:id/pay` | |

#### Payment — [paymentApi.js](./src/services/paymentApi.js)
| Fungsi | Method | Endpoint | Catatan |
|---|---|---|---|
| `apiCreateQrisPayment(orderId)` | POST | `/payments/qris` | Charge Midtrans → return `payment` (`qrString`, `amount`, `expiresAt`, `status`) |
| `apiCheckQrisStatus(orderId)` | GET | `/payments/qris/status?orderId=` | Return `{ status }` (`pending`/`paid`/`expired`/`failed`) |

#### Products — [productsApi.js](./src/services/productsApi.js)
| Fungsi | Method | Endpoint | Catatan |
|---|---|---|---|
| `fetchProducts(featured?)` | GET | `/products` atau `/products?featured=true` | Return `data.products` |
| `fetchProductById(productId)` | GET | `/products/:id` | Return `data.product` |

#### Admin — [adminApi.js](./src/services/adminApi.js)
| Fungsi | Method | Endpoint |
|---|---|---|
| `fetchDashboard()` | GET | `/admin/dashboard` |
| `fetchAdminOrders(params)` | GET | `/admin/orders?status=&paymentStatus=&limit=&offset=` |
| `fetchAdminOrderById(orderId)` | GET | `/admin/orders/:id` |
| `updateOrderStatus(orderId, status)` | PATCH | `/admin/orders/:id/status` |
| `updateOrderPaymentStatus(orderId, paymentStatus)` | PATCH | `/admin/orders/:id/payment-status` |
| `fetchAdminCustomers()` | GET | `/admin/customers` |
| `createProduct(payload)` | POST | `/admin/products` |
| `updateProduct(productId, payload)` | PUT | `/admin/products/:id` |
| `deleteProduct(productId)` | DELETE | `/admin/products/:id` |
| `addProductSize(productId, payload)` | POST | `/admin/products/:id/sizes` |
| `updateProductSize(productId, sizeId, payload)` | PUT | `/admin/products/:id/sizes/:sizeId` |
| `deleteProductSize(productId, sizeId)` | DELETE | `/admin/products/:id/sizes/:sizeId` |
| `uploadProductImage(productId, file)` | POST (multipart) | `/admin/products/:id/image` |

#### QRIS rendering — [qrisService.js](./src/services/qrisService.js)
> ⚠️ **Bukan API call.** Fungsi `generateQrisDataUrl({ qrString })` memakai npm `qrcode` untuk encode EMV QRIS string (dari Midtrans) menjadi PNG data URL (320px, warna brand). Jangan ubah formatnya.

---

## 9. Models — Business Logic

Folder `models/` berisi logika bisnis murni (tanpa React, tanpa fetch). Cocok untuk di-unit-test.

### [checkoutModel.js](./src/models/checkoutModel.js)
- `PAYMENT_METHODS` — `[{ id: 'cash' }, { id: 'qris' }]`
- `PICKUP_METHODS` — `[{ id: 'pickup' }, { id: 'delivery' }]`
- `validateCheckoutInput(values)` — validasi schema checkout. Field `pickupDate`/`pickupTime` wajib **hanya** jika `pickupMethod === 'pickup'`; `address` wajib hanya jika `delivery` (pakai helper `when`).
- `buildCheckoutPayload(values)` — normalisasi payload (trim nama, hapus spasi/strip di nomor telepon, isi address default "Ambil di toko" untuk pickup).

### [cartModel.js](./src/models/cartModel.js)
- `validateCustomizationInput(product, values)` — validasi form kustomisasi (sizeId harus salah satu size produk, colorText wajib ≤40 char, quantity 1–5, message ≤ `product.maxMessageLength`).
- `buildCartItem({...})` / `rebuildCartItem(existing, {...})` — bentuk objek cart item lengkap dengan harga.
- `updateCartItemQuantity(item, qty)` — clamp quantity ke 1–5, hitung ulang `totalPrice`.
- `computeCartSubtotal(items)` — jumlahkan `totalPrice`.

> 📌 Quantity di-clamp ke **1–5** baik di model (`Math.max(1, Math.min(5, ...))`) maupun di validasi.

### [productModel.js](./src/models/productModel.js)
- `getAllProducts`, `getFeaturedProducts(products)` (filter `featured === true`), `findProductById`, `findSizeOption`, `getProductStartingPrice` (harga terendah), `calculateUnitPrice`.

### [authModel.js](./src/models/authModel.js)
- `validateRegistrationInput(values)` / `validateLoginInput(values)` — schema register & login.
- `buildAccount(values)` — bentuk objek akun (sebagian legacy; auth kini lewat backend).

> ⚠️ [orderModel.js](./src/models/orderModel.js) berstatus **legacy** — order kini sepenuhnya via API.

---

## 10. Validation Framework

File: [customValidation.js](./src/validation/customValidation.js). Framework validasi schema-based **tanpa library eksternal**.

### Cara pakai

```js
import { validateSchema, validators, when, hasAnyError } from '../validation/customValidation.js'

const schema = {
  email: [validators.required('Email wajib diisi.'), validators.email()],
  password: [validators.required(), validators.strongPassword()],
}

const errors = validateSchema(schema, formValues)  // → { fieldName: 'pesan error', ... }
if (hasAnyError(errors)) { /* tampilkan errors */ }
```

### Cara kerja

- `validateSchema(schema, values)` menjalankan validator per-field **berurutan** dan **berhenti pada error pertama** (short-circuit) untuk tiap field. Mengembalikan object `{ fieldName: errorMessage }` (kosong jika valid).
- Setiap validator menerima `(value, values)` dan mengembalikan `string` (pesan error) atau `null` (valid).
- Validator otomatis **skip jika value kosong** (kecuali `required`) — supaya field opsional tidak ikut tervalidasi.

### Daftar validator

| Validator | Aturan |
|---|---|
| `required(msg?)` | Tidak boleh kosong |
| `email(msg?)` | Regex email sederhana |
| `phoneId(msg?)` | Nomor Indonesia: `^(?:\+62\|62\|0)8[1-9][0-9]{6,11}$` (spasi & strip dihapus dulu) |
| `minLength(n, msg?)` / `maxLength(n, msg?)` | Panjang string |
| `oneOf(allowed[], msg?)` | Harus salah satu nilai |
| `numeric(msg?)` | Harus angka |
| `minNumber(n, msg?)` / `maxNumber(n, msg?)` | Rentang angka |
| `strongPassword(msg?)` | Min 8 char + huruf + angka |
| `sameAs(field, msg?)` | Sama dengan field lain (mis. konfirmasi password) |

**Helper kondisional:**
```js
when(predicate, validator)  // validator hanya jalan jika predicate(values) === true
```

---

## 11. Alur Fitur Utama

### 11.1 Autentikasi (JWT)

```
Register/Login → POST /auth/register|login → { user, token }
   → setAuthToken(token) → localStorage['hanaka_auth_token']
   → setCurrentUser(user)

Mount aplikasi → GET /auth/me (pakai JWT tersimpan) → restore currentUser
Logout → POST /auth/logout → clearAuthToken() → currentUser = null
```

- Token JWT disimpan di `localStorage['hanaka_auth_token']`, dikirim sebagai `Authorization: Bearer`.
- `role: 'admin'` → guard mengizinkan akses admin; `GuestRoute` mengarahkan admin ke `/admin/dashboard`.
- **Akun admin dev**: `admin@hanakacake.com` / `Admin12345`.

### 11.2 Guest Cart & Merge

```
Guest tambah item → POST /cart/items → response berisi sessionToken
   → setSessionToken → localStorage['hanaka_session_token']
   → request berikutnya kirim header X-Session-Token

Saat login/register → backend auto-merge guest cart ke user cart
   → context refetch cart (useEffect [currentUser])
```

### 11.3 Cart

- Semua CRUD lewat API (`/cart/*`); state global: `cartItems`, `cartSubtotal`, `cartItemCount`.
- Quantity di-clamp **1–5**.
- Cart badge di header (`AppLayout`) menampilkan `cartItemCount`.

### 11.4 Checkout

Lihat [CheckoutPage.jsx](./src/pages/CheckoutPage.jsx). Mode pickup/delivery ditentukan dari query string `?mode=delivery`.

```
Isi form → validateCheckoutInput → POST /orders (backend ambil cart dari DB)
   ├── paymentMethod 'qris'  → navigate /payment/:orderId
   ├── 'cash' + login        → navigate /orders
   └── 'cash' + guest        → tampilkan success inline (nomor order)
```

Error 400 dari backend dengan `err.errors` dipetakan ke error per-field; error lain → `submitError` umum.

### 11.5 QRIS Payment (Midtrans) — real, bukan simulasi

Lihat [PaymentQrisPage.jsx](./src/pages/PaymentQrisPage.jsx). Halaman ini mengelola beberapa `useEffect` paralel:

```
1. Load order               → getOrderById(orderId)
2. Create charge            → POST /payments/qris → { qrString, amount, expiresAt, status }
                              → generateQrisDataUrl(qrString) → render <img> QR
3. Polling status tiap 5s   → GET /payments/qris/status
                              (berhenti jika status paid/expired/failed)
4. Countdown tiap 1s        → dari payment.expiresAt (ISO-8601 UTC)
5. Redirect saat 'paid'     → navigate ke /orders (login) atau / (guest) setelah 1.4s
```

- Backend menerima Midtrans **webhook** → update DB → polling frontend mendeteksi `paid`.
- Ada tombol manual **"Cek status pembayaran"** untuk memaksa cek.
- Countdown memakai `new Date(expiresAt)` — selalu benar karena `expiresAt` ISO-8601 UTC.
- Jika `order.paymentMethod !== 'qris'` → redirect ke `/orders`.

> 🚫 `qrString` adalah **EMV QRIS string asli** dari Midtrans. Jangan ubah `qrisService.js` ke format lain.

### 11.6 Admin

- Login admin → `role: 'admin'` → `AdminRoute` mengizinkan, `AdminLayout` jadi shell.
- Halaman admin memanggil `adminApi.js` langsung (tidak lewat global context) karena datanya tidak perlu dibagikan ke seluruh app.
- Fitur: dashboard ringkasan, kelola order + ubah status & status pembayaran, kelola produk + ukuran + upload gambar, daftar customer.

---

## 12. Utilities

| File | Fungsi | Keterangan |
|---|---|---|
| [currency.js](./src/utils/currency.js) | `formatRupiah(value)` | `Intl.NumberFormat('id-ID', IDR)`, tanpa desimal. NaN → `Rp 0` |
| [id.js](./src/utils/id.js) | `createId(prefix)` | `prefix_` + `crypto.randomUUID()` (fallback `Math.random`) |
| | `createOrderNumber()` | Format `HNK-YYYYMMDD-HHMMSS-NNN` |
| [productImages.js](./src/utils/productImages.js) | `resolveProductImage(coverImage)` | Jika diawali `uploads/` → URL backend; jika nama file lokal → asset import; else `null` |

> 📌 `resolveProductImage` menurunkan base backend dari `VITE_API_URL` dengan menghapus suffix `/api`.

---

## 13. Styling

- **CSS murni**, tanpa framework. Tiga file:
  - [index.css](./src/index.css) — CSS variables & body.
  - [styles/app.css](./src/styles/app.css) — tampilan customer.
  - [styles/admin.css](./src/styles/admin.css) — tampilan admin.
- Font: **Fraunces** (display) + **Manrope** (body) dari Google Fonts.
- Konvensi class CSS: **kebab-case** + modifier `is-*` (contoh: `nav-link is-active`, `payment-option-btn is-selected`).

---

## 14. Konvensi Kode

| Hal | Aturan |
|---|---|
| Komponen React | **PascalCase** — `CartPage.jsx` |
| Non-komponen (model/service/util) | **camelCase** — `apiService.js`, `authModel.js` |
| CSS class | **kebab-case** — `cart-table-row`, `is-active` |
| Prefix ID | `usr_`, `cart_`, `ord_` (via `createId`) |
| Pesan error & teks UI | **Bahasa Indonesia** |
| Kode (variabel, fungsi, komentar) | **Bahasa Inggris** |
| Context | **WAJIB** tetap 3 file terpisah (lihat §6) |
| Side-effect di render | **Dilarang** (React Compiler aktif) |
| Async effect | Pakai pola `let cancelled = false` + cleanup |

---

## 15. Build & Deployment

### Build

```bash
npm run build      # Output → dist/
npm run preview    # Uji hasil build lokal
```

### SPA Fallback ([public/.htaccess](./public/.htaccess))

Karena ini SPA dengan client-side routing (BrowserRouter), server Apache harus mengarahkan semua path yang bukan file/direktori nyata ke `index.html`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

> Tanpa ini, refresh di route seperti `/menu` atau `/admin/orders` akan menghasilkan 404 di server. File `.htaccess` ada di `public/` agar ikut tersalin ke `dist/` saat build.

### Checklist deploy
1. Set `VITE_API_URL` ke URL backend production (akhiri `/api`).
2. `npm run build`.
3. Upload isi `dist/` ke web server (pastikan `.htaccess` ikut untuk Apache).
4. Pastikan CORS backend mengizinkan domain frontend **dan** header `ngrok-skip-browser-warning` (sumber kebenaran CORS ada di `ResponseEmitter.php` di backend).

---

## 16. Troubleshooting & Catatan Penting

| Masalah / Aturan | Penjelasan |
|---|---|
| **Context tidak boleh digabung** | Memecah Fast Refresh → error lint. Tetap 3 file. |
| **Jangan hapus `ngrok-skip-browser-warning`** | Sudah di-set di `apiService.js`; dibutuhkan saat backend lewat ngrok. Header baru harus diizinkan juga di backend (`ResponseEmitter.php` **dan** `CorsMiddleware`). |
| **QRIS string asli Midtrans** | Jangan ubah `qrisService.js`; itu encode EMV → PNG, bukan API call. |
| **Refresh route → 404 di production** | Pastikan `.htaccess` (SPA fallback) ter-deploy. |
| **CORS error** | Sumber kebenaran CORS di backend ada di `ResponseEmitter.php`, bukan hanya `CorsMiddleware`. |
| **Tidak ada TypeScript** | Pure JS + JSX. Jangan tambah `.ts`/`.tsx` tanpa diskusi. |
| **`data/products.js` sebagian legacy** | Katalog & sizes **tidak dipakai** (data dari API). Tapi `storeProfile` **masih dipakai** (CheckoutPage & footer) — jangan dihapus tanpa cek pemakaian. |
| **`.env` saat ini ke production** | Untuk dev lokal, ganti `VITE_API_URL` ke `http://localhost:8080/api`. |
| **React 19 StrictMode double-effect** | Efek async wajib pakai guard `cancelled` agar tidak setState setelah unmount. |

---

## Referensi Cepat

```bash
npm install        # Install dependencies
npm run dev        # Dev server → localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run lint       # ESLint check
```

**Repo backend**: `../hanaka-project-back-end` (Slim PHP 4 + MySQL 8 + Midtrans).
**Dokumen terkait**: [`CLAUDE.md`](./CLAUDE.md) (konteks AI assistant & ringkasan project).
