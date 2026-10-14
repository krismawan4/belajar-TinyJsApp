import type { Product, ProductInput, StockStatus, ProductFilter, InventoryStats } from '../types/product.js';

const STORAGE_KEY = 'tinijs_desktop_products';

export const INITIAL_PRODUCTS: Product[] = [
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

export class ProductService {
  private cache: Product[] | null = null;

  determineStatus(stock: number): StockStatus {
    if (stock <= 0) return 'out_of_stock';
    if (stock <= 10) return 'low';
    return 'available';
  }

  async getAll(): Promise<Product[]> {
    if (this.cache) {
      return [...this.cache];
    }

    // Try Electron Desktop API if available
    if (typeof window !== 'undefined' && window.desktopApi?.getProducts) {
      try {
        const desktopData = await window.desktopApi.getProducts();
        if (desktopData && Array.isArray(desktopData) && desktopData.length > 0) {
          this.cache = desktopData;
          this.saveToLocalStorage(desktopData);
          return [...this.cache];
        }
      } catch (err) {
        console.warn('Desktop API load failed, falling back to local storage:', err);
      }
    }

    // Try localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cache = parsed;
            return [...this.cache];
          }
        }
      } catch (err) {
        console.warn('LocalStorage load failed:', err);
      }
    }

    // Default sample data
    this.cache = [...INITIAL_PRODUCTS];
    await this.save(this.cache);
    return [...this.cache];
  }

  async save(products: Product[]): Promise<void> {
    this.cache = [...products];

    // Persist to localStorage
    this.saveToLocalStorage(products);

    // Persist via Electron Desktop API if available
    if (typeof window !== 'undefined' && window.desktopApi?.saveProducts) {
      try {
        await window.desktopApi.saveProducts(products);
      } catch (err) {
        console.warn('Desktop API save failed:', err);
      }
    }
  }

  private saveToLocalStorage(products: Product[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
    }
  }

  async create(input: ProductInput): Promise<Product> {
    const list = await this.getAll();
    const now = new Date().toISOString();
    const id = `PRD-${Date.now()}`;
    const sku = input.sku?.trim() || `PRD-${Math.floor(100 + Math.random() * 900)}`;

    const newProduct: Product = {
      id,
      sku: sku.toUpperCase(),
      name: input.name.trim(),
      category: input.category || 'Lainnya',
      price: Number(input.price) || 0,
      stock: Number(input.stock) || 0,
      unit: input.unit?.trim() || 'Unit',
      status: this.determineStatus(Number(input.stock) || 0),
      description: input.description?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newProduct);
    await this.save(list);
    return newProduct;
  }

  async update(id: string, input: ProductInput): Promise<Product> {
    const list = await this.getAll();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Produk dengan ID "${id}" tidak ditemukan.`);
    }

    const current = list[index];
    const now = new Date().toISOString();
    const stock = Number(input.stock) >= 0 ? Number(input.stock) : current.stock;

    const updated: Product = {
      ...current,
      sku: (input.sku || current.sku).trim().toUpperCase(),
      name: (input.name || current.name).trim(),
      category: input.category || current.category,
      price: Number(input.price) >= 0 ? Number(input.price) : current.price,
      stock,
      unit: input.unit || current.unit,
      status: this.determineStatus(stock),
      description: input.description !== undefined ? input.description.trim() : current.description,
      updatedAt: now,
    };

    list[index] = updated;
    await this.save(list);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter(p => p.id !== id);
    if (filtered.length === list.length) {
      return false;
    }
    await this.save(filtered);
    return true;
  }

  async reset(): Promise<Product[]> {
    const defaultData = [...INITIAL_PRODUCTS];
    await this.save(defaultData);
    return defaultData;
  }

  filterAndSort(products: Product[], filter: ProductFilter): Product[] {
    let result = [...products];

    // Search filter
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filter.category && filter.category !== 'all') {
      result = result.filter(p => p.category === filter.category);
    }

    // Status filter
    if (filter.status && filter.status !== 'all') {
      result = result.filter(p => p.status === filter.status);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (filter.sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'id');
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return filter.sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }

  computeStats(products: Product[]): InventoryStats {
    let totalStock = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const p of products) {
      totalStock += p.stock;
      totalValue += p.price * p.stock;
      if (p.status === 'out_of_stock') {
        outOfStockCount++;
      } else if (p.status === 'low') {
        lowStockCount++;
      }
    }

    return {
      totalProducts: products.length,
      totalStock,
      totalValue,
      lowStockCount,
      outOfStockCount,
    };
  }

  formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return '-';
    try {
      const d = new Date(isoDate);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return isoDate;
    }
  }

  exportToCsv(products: Product[]): string {
    const headers = ['ID', 'SKU', 'Nama Produk', 'Kategori', 'Harga (Rp)', 'Stok', 'Satuan', 'Status', 'Deskripsi', 'Dibuat'];
    const rows = products.map(p => [
      `"${p.id}"`,
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.price,
      p.stock,
      `"${p.unit}"`,
      `"${p.status}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      `"${p.createdAt}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  }

  exportToJson(products: Product[]): string {
    return JSON.stringify(products, null, 2);
  }

  importFromJson(jsonStr: string): Product[] {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      throw new Error('Format data tidak valid: harus berupa JSON Array.');
    }

    return parsed.map((item, idx) => {
      if (!item.name) {
        throw new Error(`Data pada baris ${idx + 1} tidak memiliki properti 'name'.`);
      }
      const stock = Number(item.stock) || 0;
      return {
        id: item.id || `PRD-${Date.now()}-${idx}`,
        sku: (item.sku || `SKU-${idx + 1}`).toUpperCase(),
        name: String(item.name).trim(),
        category: item.category || 'Lainnya',
        price: Number(item.price) || 0,
        stock,
        unit: item.unit || 'Unit',
        status: this.determineStatus(stock),
        description: item.description || '',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      };
    });
  }
}

export const productService = new ProductService();

