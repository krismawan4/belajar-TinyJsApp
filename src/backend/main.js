// Backend TiniCRUD - berjalan di atas runtime txiki.js (QuickJS + libuv)
// Menyediakan akses langsung ke file system komputer lokal.

const dec = new TextDecoder();
const enc = new TextEncoder();

const DATA_FILE = tjs.cwd + '/products.json';

const DEFAULT_PRODUCTS = [
  {
    id: 'PRD-1700000001',
    sku: 'ELC-101',
    name: 'Laptop ASUS Vivobook 14',
    category: 'Elektronik',
    price: 8250000,
    stock: 12,
    unit: 'Unit',
    status: 'available',
    description: 'Laptop Intel Core i5 12th Gen, 16GB RAM, 512GB SSD NVMe',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'PRD-1700000002',
    sku: 'AKS-201',
    name: 'Mouse Wireless Silent Click',
    category: 'Aksesoris',
    price: 185000,
    stock: 35,
    unit: 'Pcs',
    status: 'available',
    description: 'Mouse nirkabel 2.4GHz dual mode Bluetooth ergonomis',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'PRD-1700000003',
    sku: 'AKS-202',
    name: 'Keyboard Mekanikal TKL RGB',
    category: 'Aksesoris',
    price: 450000,
    stock: 7,
    unit: 'Unit',
    status: 'low',
    description: 'Keyboard gaming 87 tombol switch merah hot-swappable',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'PRD-1700000004',
    sku: 'ELC-102',
    name: 'Monitor LG 24" IPS Full HD',
    category: 'Elektronik',
    price: 1650000,
    stock: 5,
    unit: 'Unit',
    status: 'low',
    description: 'Layar IPS 75Hz refresh rate dengan bezel tipis & AMD FreeSync',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'PRD-1700000005',
    sku: 'FD-301',
    name: 'Kopi Arabika Single Origin Gayo 250g',
    category: 'Makanan & Minuman',
    price: 75000,
    stock: 40,
    unit: 'Pcs',
    status: 'available',
    description: 'Biji kopi sangrai medium roast aroma cokelat & floral',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'PRD-1700000006',
    sku: 'ATK-401',
    name: 'Kertas HVS A4 80gsm Satu Rim',
    category: 'Peralatan Kantor',
    price: 52000,
    stock: 65,
    unit: 'Rim',
    status: 'available',
    description: 'Kertas dokumen putih bersih 500 lembar standar arsip kantor',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'PRD-1700000007',
    sku: 'ATK-402',
    name: 'Tinta Printer Botol Hitam 003',
    category: 'Peralatan Kantor',
    price: 85000,
    stock: 0,
    unit: 'Botol',
    status: 'out_of_stock',
    description: 'Tinta original kapasitas 65ml untuk printer inkjet',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'PRD-1700000008',
    sku: 'FSH-501',
    name: 'Kemeja Katun Oxford Formal Lengan Panjang',
    category: 'Pakaian',
    price: 195000,
    stock: 18,
    unit: 'Pcs',
    status: 'available',
    description: 'Bahan katun premium sejuk tidak mudah kusut warna navy',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const api = {
  async sysinfo() {
    return {
      runtime: 'TinyJS + txiki.js ' + tjs.version,
      quickjs: tjs.engine.versions.quickjs,
      host: tjs.hostName,
      cwd: tjs.cwd,
      dataFile: DATA_FILE,
    };
  },

  async loadProducts() {
    try {
      const data = await tjs.readFile(DATA_FILE);
      const jsonStr = dec.decode(data);
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      // Belum ada file, buat file awal
    }

    // Tulis default
    await tjs.writeFile(DATA_FILE, enc.encode(JSON.stringify(DEFAULT_PRODUCTS, null, 2)));
    return DEFAULT_PRODUCTS;
  },

  async saveProducts({ products }) {
    await tjs.writeFile(DATA_FILE, enc.encode(JSON.stringify(products, null, 2)));
    return { success: true };
  },

  async resetProducts() {
    await tjs.writeFile(DATA_FILE, enc.encode(JSON.stringify(DEFAULT_PRODUCTS, null, 2)));
    return DEFAULT_PRODUCTS;
  },

  async writeFile({ path, content }) {
    await tjs.writeFile(path, enc.encode(content));
    return { success: true, path };
  },

  async readFile({ path }) {
    const data = await tjs.readFile(path);
    return dec.decode(data);
  },
};

export function init(app) {
  // Dipanggil saat jendela sudah siap
  console.log('TiniCRUD Desktop Backend running on txiki.js');
}

