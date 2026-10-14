# TiniCRUD Desktop - Aplikasi Manajemen Produk & Inventaris

Aplikasi desktop CRUD sederhana, cepat, dan modern yang dibangun menggunakan **[TiniJS](https://tinijs.dev/)** (framework Web Components berbasis Lit) dan dikemas sebagai aplikasi desktop native menggunakan **Electron**.

---

## 🚀 Fitur Utama

- **CRUD Lengkap (Create, Read, Update, Delete)**:
  - **Create**: Tambah produk baru dengan modal interaktif, validasi input, dan auto-generate SKU.
  - **Read**: Daftar produk dengan dua mode tampilan (**Tabel Data** dan **Grid Kartu**).
  - **Update**: Edit data produk langsung melalui form modal dengan auto-populate.
  - **Delete**: Hapus produk disertai modal konfirmasi pengamanan.
- **Dashboard Statistik Inventaris**:
  - Total Produk terdaftar.
  - Total Unit Stok fisik di gudang.
  - Total Estimasi Nilai Inventaris (format mata uang Rupiah `Rp`).
  - Peringatan stok kritis (Stok Habis & Stok Rendah ≤ 10 unit).
- **Pencarian & Penyaringan Real-Time**:
  - Pencarian fleksibel berdasarkan Nama Produk, SKU, atau Kategori.
  - Filter Kategori (Elektronik, Pakaian, Makanan & Minuman, Peralatan Kantor, Aksesoris, dll).
  - Filter Status ketersediaan (Semua, Tersedia, Stok Rendah, Habis).
  - Pengurutan dinamis (Terbaru, Terlama, Nama A-Z, Harga Terendah/Tertinggi, Stok).
- **Manajemen Berkas & Portabilitas Data**:
  - **Export CSV**: Unduh laporan inventaris dalam format CSV untuk Microsoft Excel.
  - **Backup JSON**: Cadangkan seluruh data produk ke berkas JSON.
  - **Import JSON**: Pulihkan atau impor data inventaris dari berkas JSON.
  - **Reset Data**: Kembalikan data ke sampel realistis awal kapan saja.
- **Dukungan Native Desktop & Web**:
  - Menggunakan Electron IPC & penyimpanan lokal berkas komputer (`products.json`).
  - Fallback otomatis ke `localStorage` saat dijalankan di browser web.
  - Keyboard Shortcut: Tekan <kbd>Ctrl</kbd> + <kbd>N</kbd> untuk membuka form tambah produk baru, dan <kbd>Esc</kbd> untuk menutup modal.

---

## 📁 Struktur Direktori

```text
TiniJsApp/
├── app/
│   ├── assets/              # Logo dan favicon
│   ├── components/          # Web Components TiniJS
│   │   ├── delete-modal.ts  # Modal konfirmasi hapus data
│   │   ├── navbar.ts        # Header & tombol aksi (Export, Import, Reset)
│   │   ├── product-modal.ts # Modal form Tambah & Edit produk
│   │   ├── stats-card.ts    # Kartu statistik ringkasan inventaris
│   │   └── toast-notification.ts # Notifikasi toast mengambang
│   ├── services/
│   │   └── product.service.ts # Logika bisnis, CRUD, kalkulasi stok & persistensi
│   ├── types/
│   │   └── product.ts       # Definisi interface & tipe TypeScript
│   ├── app.spec.ts          # Pengujian unit otomatis (Vitest)
│   ├── app.ts               # Root component TiniJS (@App)
│   └── index.html           # HTML template aplikasi
├── electron/
│   ├── main.cjs             # Proses utama Electron & IPC dialogs/file system
│   └── preload.cjs          # Script jembatan konteks (contextBridge)
├── package.json
├── tini.config.ts           # Konfigurasi TiniJS
├── tsconfig.json            # Konfigurasi TypeScript
├── vite.config.ts           # Konfigurasi Vite bundler
└── README.md
```

---

## 🛠️ Cara Menjalankan

### 1. Menjalankan Mode Desktop (Aplikasi Desktop Native)
Untuk membangun antarmuka dan meluncurkan jendela desktop Electron:
```bash
npm run desktop
# atau
npm start
```

### 2. Menjalankan Mode Desktop Development (Live Reload)
Untuk pengembangan dengan fitur hot-reload:
```bash
npm run desktop:dev
```

### 3. Menjalankan Mode Web Browser
Jika ingin menjalankan antarmuka langsung di browser lokal:
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

### 4. Menjalankan Pengujian Unit (Testing)
Untuk menjalankan tes otomatis CRUD dan filter:
```bash
npx vitest run
```

### 5. Membangun Berkas Produksi
```bash
npm run build
```
Hasil build web tersimpan di folder `.output/`.

---

## 🧰 Teknologi

- **[TiniJS](https://tinijs.dev/)** - Meta-framework berbasis Web Components & Lit
- **[Lit](https://lit.dev/)** - Library komponen reaktif standar web dari Google
- **[Electron](https://www.electronjs.org/)** - Framework pembuatan aplikasi desktop lintas platform
- **[Vite](https://vitejs.dev/)** - Bundler frontend ultra-cepat
- **[TypeScript](https://www.typescriptlang.org/)** - Pengetikan statis untuk keamanan kode
- **[Vitest](https://vitest.dev/)** - Framework testing modern
