import { describe, it, expect, beforeEach } from 'vitest';
import { ProductService, INITIAL_PRODUCTS } from './services/product.service.js';

describe('ProductService CRUD & Operations', () => {
  let service: ProductService;

  beforeEach(() => {
    service = new ProductService();
  });

  it('harus memuat daftar produk awal (Read)', async () => {
    const products = await service.getAll();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('id');
    expect(products[0]).toHaveProperty('name');
    expect(products[0]).toHaveProperty('price');
  });

  it('harus dapat membuat produk baru (Create)', async () => {
    const created = await service.create({
      sku: 'TEST-001',
      name: 'Produk Uji Coba',
      category: 'Elektronik',
      price: 250000,
      stock: 15,
      unit: 'Unit',
      description: 'Ini produk pengujian unit',
    });

    expect(created.id).toBeDefined();
    expect(created.sku).toBe('TEST-001');
    expect(created.name).toBe('Produk Uji Coba');
    expect(created.status).toBe('available');

    const all = await service.getAll();
    const found = all.find(p => p.id === created.id);
    expect(found).toBeDefined();
  });

  it('harus dapat memperbarui produk (Update)', async () => {
    const created = await service.create({
      sku: 'TEST-002',
      name: 'Produk Sebelum Diedit',
      category: 'Pakaian',
      price: 100000,
      stock: 5,
      unit: 'Pcs',
    });

    const updated = await service.update(created.id, {
      sku: 'TEST-002-MOD',
      name: 'Produk Setelah Diedit',
      category: 'Pakaian',
      price: 150000,
      stock: 0,
      unit: 'Pcs',
    });

    expect(updated.name).toBe('Produk Setelah Diedit');
    expect(updated.price).toBe(150000);
    expect(updated.status).toBe('out_of_stock'); // Stok 0 otomatis menjadi out_of_stock
  });

  it('harus dapat menghapus produk (Delete)', async () => {
    const created = await service.create({
      sku: 'DEL-001',
      name: 'Produk Akan Dihapus',
      category: 'Lainnya',
      price: 50000,
      stock: 1,
      unit: 'Unit',
    });

    const success = await service.delete(created.id);
    expect(success).toBe(true);

    const all = await service.getAll();
    expect(all.find(p => p.id === created.id)).toBeUndefined();
  });

  it('harus menghitung metrik inventaris dengan tepat', async () => {
    const products = await service.getAll();
    const stats = service.computeStats(products);

    expect(stats.totalProducts).toBe(products.length);
    expect(stats.totalStock).toBeGreaterThan(0);
    expect(stats.totalValue).toBeGreaterThan(0);
  });

  it('harus mengekspor dan mengimpor JSON dengan benar', async () => {
    const products = await service.getAll();
    const jsonStr = service.exportToJson(products);
    const imported = service.importFromJson(jsonStr);

    expect(imported.length).toBe(products.length);
    expect(imported[0].name).toBe(products[0].name);
  });

  it('harus memfilter produk berdasarkan kata kunci pencarian', async () => {
    const products = await service.getAll();
    const filtered = service.filterAndSort(products, {
      search: 'Laptop',
      category: 'all',
      status: 'all',
      sortField: 'createdAt',
      sortOrder: 'desc',
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].name.toLowerCase()).toContain('laptop');
  });
});
