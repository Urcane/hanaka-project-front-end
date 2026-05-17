# Hanaka Cake Frontend

Frontend React untuk alur customer Hanaka Cake: login/register, pilih varian cake,
custom pesanan, checkout COD/QRIS, QR payment page, dan order history.

## Tech Stack

- React 19
- Vite 8
- React Router DOM
- LocalStorage state persistence
- Custom validation utility

## Fitur yang Sudah Diimplementasikan

- Login dan registrasi customer
- Home page dengan promo banner dan produk unggulan
- Menu varian cake
- Halaman custom cake:
	- pilih ukuran
	- pilih warna cake
	- tambahan kata-kata
	- harga berubah sesuai ukuran/jumlah
- Keranjang:
	- tambah pesanan
	- edit varian
	- ubah quantity
	- hapus item
- Checkout:
	- nama, no telepon, alamat
	- metode bayar COD / QRIS
	- metode pengambilan (delivery / pickup)
- Halaman QRIS untuk generate QR pembayaran
- Order history customer
- Informasi toko (alamat, WhatsApp, Instagram)

## Menjalankan Project

```bash
npm install
npm run dev
```

## Script Penting

- npm run dev
- npm run build
- npm run preview
- npm run lint

## Struktur Penting

```text
src/
	components/
	context/
	data/
	models/
	pages/
	services/
	styles/
	utils/
	validation/
```

## Catatan Integrasi Backend (Next Step)

Saat ini data masih di LocalStorage agar alur UI/UX dan business flow bisa dites cepat.
Model frontend sudah dipisah di folder src/models agar gampang dipetakan nanti ke API
Slim PHP + MySQL di folder backend terpisah.
