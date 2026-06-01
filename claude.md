# Hanaka Cake — AI Assistant Context (Frontend)

> Dokumen ini adalah referensi utama bagi AI assistant yang bekerja di repository **frontend** Hanaka Cake.
> Terakhir update: 2026-06-01

---

## 1. Ringkasan Project

**Hanaka Cake** adalah aplikasi web e-commerce kue custom untuk toko kue di Balikpapan, Kalimantan Timur. Frontend React sudah **fully integrated** dengan backend Slim PHP + MySQL.

| Aspek | Detail |
|---|---|
| Nama produk | Hanaka Cake |
| Jenis | E-commerce kue custom (cake ordering) |
| Bahasa utama | Bahasa Indonesia (UI & validasi), kode dalam Bahasa Inggris |
| Target user | Customer retail (B2C) + Admin toko |
| Lokasi toko | Jl. DR. Sukono Rt 09 No 11, Karang Rejo, Balikpapan Kota, Kaltim 76124 |
| Jam operasional | 07.00 AM – 11.00 PM WITA |

---

## 2. Tech Stack

### Frontend (Repo ini)
- **React 19** dengan React Compiler (via `babel-plugin-react-compiler`)
- **Vite 8** — build tool + dev server (localhost:5173)
- **React Router DOM v7** — client-side routing
- **qrcode** (npm) — render EMV QR string dari Midtrans ke PNG
- **ESLint 9** — flat config, react-hooks + react-refresh plugin
- **CSS murni** — Google Fonts (Fraunces + Manrope), tanpa CSS framework

### Backend (Repo terpisah: hanaka-project-back-end)
- **Slim PHP 4** — REST API (localhost:8080)
- **MySQL 8** — database
- **JWT** — autentikasi (token di localStorage)
- **Midtrans Core API** — QRIS payment (sandbox aktif)

---

## 3. Arsitektur Frontend

```
src/
├── assets/              # Gambar statis (logo, hero, foto produk)
├── components/          # Reusable components
│   ├── AppLayout.jsx    # Shell customer (header + nav + footer)
│   ├── AdminLayout.jsx  # Shell admin
│   ├── AdminRoute.jsx   # Guard: hanya admin
│   ├── GuestRoute.jsx   # Guard: redirect ke / jika sudah login
│   └── ProtectedRoute.jsx # Guard: redirect ke /login jika belum login
├── context/             # React Context (global state dari API)
│   ├── AppContext.jsx   # Provider — state + actions
│   ├── appContextObject.js  # createContext (dipisah — ESLint react-refresh)
│   └── useApp.js        # Custom hook
├── data/
│   └── products.js      # ⚠ Legacy — tidak dipakai, data dari API
├── models/              # Business logic murni (tanpa React)
│   ├── authModel.js     # Validasi form login/register (client-side)
│   ├── cartModel.js     # computeCartSubtotal
│   ├── checkoutModel.js # validateCheckoutInput, PAYMENT_METHODS
│   ├── orderModel.js    # ⚠ Legacy
│   └── productModel.js  # getFeaturedProducts, filter
├── pages/               # Page-level components
│   ├── HomePage.jsx
│   ├── MenuPage.jsx
│   ├── CustomizeCakePage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── PaymentQrisPage.jsx   # Real Midtrans QR + countdown + polling
│   ├── OrderHistoryPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── admin/
│       ├── AdminDashboardPage.jsx
│       ├── AdminOrdersPage.jsx
│       ├── AdminOrderDetailPage.jsx
│       ├── AdminProductsPage.jsx
│       └── AdminCustomersPage.jsx
├── services/            # Semua API call ke backend
│   ├── apiService.js    # Base fetch wrapper (JWT + session token + ngrok header)
│   ├── authApi.js       # /auth/*
│   ├── cartApi.js       # /cart/*
│   ├── ordersApi.js     # /orders/*
│   ├── paymentApi.js    # /payments/qris + /payments/qris/status
│   ├── productsApi.js   # /products/*
│   ├── adminApi.js      # /admin/*
│   └── qrisService.js   # Render EMV qrString → PNG (npm qrcode, bukan API call)
├── styles/
│   ├── app.css          # Stylesheet customer
│   └── admin.css        # Stylesheet admin
├── utils/
│   ├── currency.js      # formatRupiah()
│   ├── id.js            # createId(), createOrderNumber()
│   └── productImages.js # Mapping productId → imported image asset
├── validation/
│   └── customValidation.js  # Custom validation framework (no library)
├── index.css            # CSS variables & body styles
├── main.jsx             # Entry point
└── App.jsx              # Route definitions (customer + admin)
```

---

## 4. Routing

### Customer Routes

| Path | Komponen | Guard |
|---|---|---|
| `/` | HomePage | — |
| `/menu` | MenuPage | — |
| `/menu/:productId` | CustomizeCakePage | — |
| `/cart` | CartPage | — |
| `/checkout` | CheckoutPage | — |
| `/payment/:orderId` | PaymentQrisPage | — |
| `/orders` | OrderHistoryPage | ProtectedRoute |
| `/login` | LoginPage | GuestRoute |
| `/register` | RegisterPage | GuestRoute |
| `*` | → redirect `/` | — |

### Admin Routes

| Path | Komponen | Guard |
|---|---|---|
| `/admin/dashboard` | AdminDashboardPage | AdminRoute |
| `/admin/orders` | AdminOrdersPage | AdminRoute |
| `/admin/orders/:id` | AdminOrderDetailPage | AdminRoute |
| `/admin/products` | AdminProductsPage | AdminRoute |
| `/admin/customers` | AdminCustomersPage | AdminRoute |

---

## 5. Business Logic & Data Flow

### 5.1 Autentikasi (JWT)
- Register/Login → `POST /api/auth/register` atau `/login` → JWT di localStorage (`hanaka_auth_token`)
- Auth restore on mount: `GET /api/auth/me`
- Logout: hapus token dari localStorage
- `role: 'admin'` → redirect ke `/admin/dashboard`
- Guest cart pakai `X-Session-Token` header (localStorage `hanaka_session_token`)
- Login/register → backend auto-merge guest cart ke user cart

### 5.2 Produk & Katalog
- Data dari `GET /api/products` — bukan lagi hardcoded
- 5 varian: Black Forest, Red Velvet, Vanila, Lemon, Rainbow
- 4 ukuran per produk (size ID format: `size-16-bf`, `size-18-rv`, dll)
- `coverImage` = string filename → di-map ke static asset via `productImages.js`

### 5.3 Cart
- Semua CRUD via API (`/api/cart/*`)
- State di context: `cartItems`, `cartSubtotal`, `cartItemCount`
- Guest: diidentifikasi via `X-Session-Token` (header otomatis dari `apiService.js`)
- Quantity: 1–5 per item

### 5.4 Checkout
- `POST /api/orders` — backend ambil cart dari DB via JWT/session token
- QRIS → navigate ke `/payment/:orderId`
- Cash + login → navigate ke `/orders`
- Cash + guest → success inline

### 5.5 QRIS Payment (Midtrans)
- `POST /api/payments/qris` → backend charge Midtrans → dapat `qrString` (EMV)
- `qrisService.js` encode EMV string ke PNG via npm `qrcode`
- Frontend polling `GET /api/payments/qris/status` tiap 5 detik
- Midtrans webhook → backend update DB → polling detect `paid` → redirect
- Countdown dari `expiresAt` (ISO-8601 UTC) — `new Date(expiresAt)` selalu benar

### 5.6 Admin
- Login sebagai admin → `role: 'admin'` → `AdminRoute` mengizinkan akses
- Akun default dev: `admin@hanakacake.com` / `Admin12345`

---

## 6. Validasi (Client-side)

File: `src/validation/customValidation.js`

- **Schema-based**: `validateSchema(schema, values)` → `{ fieldName: errorMessage }`
- **Validators**: `required`, `email`, `phoneId`, `minLength`, `maxLength`, `oneOf`, `numeric`, `minNumber`, `maxNumber`, `strongPassword`, `sameAs`
- **Conditional**: `when(predicate, validator)`
- **Cek**: `hasAnyError(errors)` → boolean

---

## 7. Konvensi Kode

- Komponen React: **PascalCase** (`CartPage.jsx`)
- Non-komponen: **camelCase** (`authModel.js`, `apiService.js`)
- CSS class: **kebab-case** (`cart-table-row`, `is-active`)
- ID prefix: `usr_`, `cart_`, `ord_`
- **Jangan ubah context split 3 file** — wajib untuk ESLint react-refresh
- Pesan error/UI: **Bahasa Indonesia**
- Kode (variabel, fungsi, komentar): **Bahasa Inggris**

---

## 8. Catatan Penting untuk AI Assistant

1. **Context split 3 file** (`appContextObject.js`, `useApp.js`, `AppContext.jsx`) — JANGAN digabung, wajib untuk ESLint react-refresh.
2. **QRIS sudah real Midtrans** — `qrString` adalah EMV QRIS string, bukan simulasi. Jangan ubah `qrisService.js` untuk format lain.
3. **Sumber kebenaran CORS di backend ada di `ResponseEmitter.php`** — bukan `CorsMiddleware`. Jika ada header baru yang perlu diizinkan, tambah di kedua tempat.
4. **`ngrok-skip-browser-warning: true`** sudah di-set di `apiService.js` — jangan hapus.
5. **Tidak pakai TypeScript** — pure JavaScript + JSX.
6. **React 19 + React Compiler aktif** — kode harus compatible (no side effects in render).
7. **`data/products.js` sudah legacy** — data produk dari API, bukan dari file ini.
8. **Backend repo**: `../hanaka-project-back-end` — baca context di sana untuk implementasi backend.

---

## 9. Dev Setup

```bash
# Frontend
npm install
npm run dev     # localhost:5173

# Backend (repo terpisah)
cd ../hanaka-project-back-end
composer start  # localhost:8080
php database/migrate.php --seed  # sekali saja
```

```env
# .env
VITE_API_URL=http://localhost:8080/api
```

---

## 10. Changelog

### Fase 1 — Frontend MVP (Mei 2026)
- Setup React 19 + Vite 8 + React Compiler
- Auth sistem (localStorage — legacy)
- HomePage, MenuPage, CustomizeCakePage, CartPage
- Checkout (pickup/delivery, cash/qris)
- Simulasi QRIS payment (string lokal)
- OrderHistoryPage, custom validation framework
- Responsive design, guest checkout

### Fase 2 — Backend Integration (Mei–Juni 2026)
- Semua data localStorage → backend API
- JWT auth (register, login, logout, me, restore on mount)
- Cart CRUD via API + guest session token + merge
- Order via API
- Admin dashboard (orders, products, customers)
- Admin pages + AdminRoute + AdminLayout

### Fase 3 — Midtrans QRIS + CORS Fix (Juni 2026)
- `paymentApi.js`: `apiCreateQrisPayment` + `apiCheckQrisStatus`
- `PaymentQrisPage.jsx`: real QR, countdown, polling 5 detik, auto-redirect
- `apiService.js`: header `ngrok-skip-browser-warning`
- Backend: MidtransService, GenerateQrisAction, PaymentStatusAction, PaymentWebhookAction
- CORS fix: `ResponseEmitter.php` tambah `ngrok-skip-browser-warning`

---

## 11. Quick Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server → localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run lint       # ESLint check
```
