# TiniCRUD Desktop - Aplikasi Manajemen Produk & Inventaris (~6 MB)

Aplikasi desktop CRUD sederhana, cepat, dan ultra-ringan yang dibangun menggunakan **[TinyJS](https://tinyjs.app/)** karya Tarwin Stroh-Spijer ([DevClass](https://www.devclass.com/development/2026/10/13/when-you-just-need-to-build-a-tiny-desktop-app-tinyjs/5302508)).

Aplikasi ini menghasilkan biner berekstensi `.exe` mandiri berukuran **hanya ~5.59 MB** (bukan Electron 250 MB) dan menggunakan **RAM hanya ~15 MB**.

---

## ⚡ Kenapa Ukurannya Hanya ~6 MB?

1. **Bukan Menggunakan Electron**:
   Aplikasi tidak membundel browser Google Chromium raksasa. Sebagai gantinya, antarmuka dirender langsung menggunakan **WebView2 bawaan Windows**.
2. **Runtime txiki.js (QuickJS + libuv)**:
   Backend dijalankan oleh runtime JavaScript ultra-kompak `txiki.js`, bukan Node.js/Bun yang berat.
3. **Tanpa Perlu Belajar Rust**:
   Berbeda dengan Tauri yang mengharuskan menulis Rust, di TinyJS seluruh aplikasi ditulis murni dalam **JavaScript, HTML, dan CSS**.
4. **Komunikasi Socket Lokal**:
   Frontend dan backend berkomunikasi melalui IPC socket lokal tanpa membuka port web server HTTP.

---

## 🚀 Fitur Aplikasi

- **CRUD Lengkap (Create, Read, Update, Delete)**:
  - **Create**: Tambah produk baru dengan modal interaktif, validasi formulir, dan penomoran SKU otomatis.
  - **Read**: Daftar produk dengan dua pilihan tampilan: **Tabel Data** profesional dan **Grid Kartu**.
  - **Update**: Edit data produk langsung melalui modal dengan data terisi otomatis.
  - **Delete**: Hapus produk disertai modal konfirmasi pengamanan native.
- **Dashboard Statistik Inventaris**:
  - Total Produk terdaftar.
  - Total Unit Stok fisik di gudang.
  - Total Estimasi Nilai Inventaris (format Rupiah `Rp`).
  - Peringatan stok kritis (Stok Habis & Stok Rendah ≤ 10 unit).
- **Pencarian, Filter & Pengurutan Real-Time**:
  - Pencarian fleksibel berdasarkan Nama Produk, SKU, atau Kategori.
  - Filter Kategori (Elektronik, Pakaian, Makanan & Minuman, Peralatan Kantor, Aksesoris, dll).
  - Filter Status ketersediaan (Semua, Tersedia, Stok Rendah, Habis).
  - Pengurutan dinamis (Terbaru, Terlama, Nama A-Z, Harga Terendah/Tertinggi, Stok).
- **Manajemen Berkas & Portabilitas Data**:
  - **Penyimpanan Lokal Fisik**: Data tersimpan otomatis di berkas lokal `products.json`.
  - **Export CSV**: Menggunakan native dialog Windows untuk menyimpan berkas CSV.
  - **Backup & Import JSON**: Ekspor cadangan dan impor data kembali dari berkas JSON.
  - **Reset Sampel Data**: Tombol untuk mengembalikan data ke contoh sampel realistis.
- **Pintasan Keyboard**:
  - <kbd>Ctrl</kbd> + <kbd>N</kbd>: Membuka formulir tambah produk baru.
  - <kbd>Esc</kbd>: Menutup modal.

---

## 📁 Struktur Direktori

```text
TiniJsApp/
├── assets/
│   └── icon.png             # Ikon aplikasi
├── dist/
│   └── tinicrud.exe         # Hasil biner kompilasi (HANYA 5.59 MB!)
├── src/
│   ├── backend/
│   │   └── main.js          # Backend txiki.js (file system, CRUD RPC)
│   └── frontend/
│       ├── app.js           # Logika antarmuka, dialog, state & filter
│       ├── index.html       # Markup antarmuka utama
│       └── style.css        # Desain responsif modern
├── types/
│   ├── tiny.d.ts            # Definisi tipe API TinyJS
│   └── tjs.d.ts             # Definisi tipe txiki.js
├── package.json             # Skrip NPM
├── products.json            # Berkas basis data lokal
├── tinyjs.json              # Konfigurasi aplikasi TinyJS
└── README.md
```

---

## 🛠️ Cara Menjalankan & Membangun

### 1. Menjalankan Mode Pengembangan
```bash
tinyjs dev
# atau
npm run dev
```

### 2. Membangun Berkas Executable `.EXE` (Hanya ~5.59 MB!)
```bash
tinyjs build
# atau
npm run build
```
Hasil biner executable akan langsung dibuat di **`dist/tinicrud.exe`** (ukuran berkas hanya **5.59 MB**).

### 3. Menjalankan Berkas Biner `.exe`
Klik dua kali pada berkas `dist\tinicrud.exe` di File Explorer, atau jalankan melalui terminal:
```bash
.\dist\tinicrud.exe
# atau
npm run run:exe
```

---

## 🧰 Teknologi

- **[TinyJS](https://tinyjs.app/)** oleh Tarwin Stroh-Spijer
- **[txiki.js](https://txikijs.org/)** (QuickJS + libuv JavaScript runtime)
- **Microsoft Edge WebView2** (Windows Native Web Engine)
