import { html, css } from 'lit';
import { state } from 'lit/decorators/state.js';
import { App, TiniComponent } from '@tinijs/core';

import './components/navbar.js';
import './components/stats-card.js';
import './components/product-modal.js';
import './components/delete-modal.js';
import './components/toast-notification.js';

import type {
  Product,
  ProductInput,
  ProductFilter,
  ToastMessage,
  SortField,
  SortOrder,
} from './types/product.js';
import { productService } from './services/product.service.js';

@App()
export class AppRoot extends TiniComponent {
  @state()
  private products: Product[] = [];

  @state()
  private filter: ProductFilter = {
    search: '',
    category: 'all',
    status: 'all',
    sortField: 'createdAt',
    sortOrder: 'desc',
  };

  @state()
  private viewMode: 'table' | 'grid' = 'table';

  @state()
  private isModalOpen = false;

  @state()
  private editingProduct: Product | null = null;

  @state()
  private isDeleteModalOpen = false;

  @state()
  private deletingProduct: Product | null = null;

  @state()
  private toasts: ToastMessage[] = [];

  @state()
  private isLoading = true;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadData();
    window.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+N or Cmd+N: New Product
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      this.openCreateModal();
    }
    // Escape: Close modal
    if (e.key === 'Escape') {
      if (this.isModalOpen) this.isModalOpen = false;
      if (this.isDeleteModalOpen) this.isDeleteModalOpen = false;
    }
  };

  private async loadData() {
    this.isLoading = true;
    try {
      this.products = await productService.getAll();
    } catch (err: any) {
      this.addToast('error', `Gagal memuat data: ${err.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  private addToast(type: 'success' | 'error' | 'info', message: string) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, message };
    this.toasts = [...this.toasts, newToast];

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      this.dismissToast(id);
    }, 4000);
  }

  private dismissToast(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  // CRUD: Create / Open Modal
  private openCreateModal() {
    this.editingProduct = null;
    this.isModalOpen = true;
  }

  // CRUD: Update / Open Modal
  private openEditModal(product: Product) {
    this.editingProduct = { ...product };
    this.isModalOpen = true;
  }

  // CRUD: Save (Create or Update)
  private async handleSaveProduct(e: CustomEvent<{ id?: string; data: ProductInput }>) {
    const { id, data } = e.detail;
    try {
      if (id) {
        await productService.update(id, data);
        this.addToast('success', `Produk "${data.name}" berhasil diperbarui!`);
      } else {
        await productService.create(data);
        this.addToast('success', `Produk "${data.name}" berhasil ditambahkan!`);
      }
      this.products = await productService.getAll();
      this.isModalOpen = false;
    } catch (err: any) {
      this.addToast('error', `Gagal menyimpan: ${err.message}`);
    }
  }

  // CRUD: Delete confirmation
  private openDeleteModal(product: Product) {
    this.deletingProduct = product;
    this.isDeleteModalOpen = true;
  }

  private async handleConfirmDelete(e: CustomEvent<{ id: string }>) {
    const { id } = e.detail;
    const name = this.deletingProduct?.name || 'Produk';
    try {
      await productService.delete(id);
      this.products = await productService.getAll();
      this.isDeleteModalOpen = false;
      this.deletingProduct = null;
      this.addToast('success', `Produk "${name}" berhasil dihapus.`);
    } catch (err: any) {
      this.addToast('error', `Gagal menghapus produk: ${err.message}`);
    }
  }

  // Reset to initial sample data
  private async handleResetData() {
    if (confirm('Kembalikan seluruh data ke contoh sampel bawaan?')) {
      try {
        this.products = await productService.reset();
        this.addToast('info', 'Data berhasil direset ke sampel bawaan.');
      } catch (err: any) {
        this.addToast('error', `Gagal mereset data: ${err.message}`);
      }
    }
  }

  // Export to CSV
  private async handleExportCsv() {
    try {
      const csvContent = productService.exportToCsv(this.products);
      if (window.desktopApi?.exportData) {
        const res = await window.desktopApi.exportData(csvContent, 'laporan-produk.csv');
        if (res.success) {
          this.addToast('success', `File CSV berhasil disimpan ke ${res.filePath || 'komputer'}!`);
          return;
        }
      }
      // Web browser fallback
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `laporan-produk-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      this.addToast('success', 'Laporan CSV berhasil diunduh!');
    } catch (err: any) {
      this.addToast('error', `Gagal mengekspor CSV: ${err.message}`);
    }
  }

  // Export to JSON
  private async handleExportJson() {
    try {
      const jsonContent = productService.exportToJson(this.products);
      if (window.desktopApi?.exportData) {
        const res = await window.desktopApi.exportData(jsonContent, 'backup-produk.json');
        if (res.success) {
          this.addToast('success', `Backup JSON berhasil disimpan ke ${res.filePath || 'komputer'}!`);
          return;
        }
      }
      // Web browser fallback
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `backup-produk-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      this.addToast('success', 'Backup JSON berhasil diunduh!');
    } catch (err: any) {
      this.addToast('error', `Gagal mengekspor JSON: ${err.message}`);
    }
  }

  // Import JSON
  private async handleImportJson() {
    if (window.desktopApi?.importData) {
      try {
        const res = await window.desktopApi.importData();
        if (res.success && res.data) {
          const imported = productService.importFromJson(
            typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
          );
          await productService.save(imported);
          this.products = await productService.getAll();
          this.addToast('success', `Berhasil mengimpor ${imported.length} data produk!`);
          return;
        }
      } catch (err: any) {
        this.addToast('error', `Gagal mengimpor file: ${err.message}`);
        return;
      }
    }

    // Web browser fallback: trigger file input
    const input = this.shadowRoot?.querySelector('#file-import') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  private handleFileSelected(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event: any) => {
      try {
        const content = event.target?.result as string;
        const imported = productService.importFromJson(content);
        await productService.save(imported);
        this.products = await productService.getAll();
        this.addToast('success', `Berhasil mengimpor ${imported.length} data produk!`);
      } catch (err: any) {
        this.addToast('error', `Gagal memproses file: ${err.message}`);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  private handleSortChange(e: any) {
    const val = e.target.value;
    const [field, order] = val.split(':') as [SortField, SortOrder];
    this.filter = {
      ...this.filter,
      sortField: field,
      sortOrder: order,
    };
  }

  protected render() {
    const stats = productService.computeStats(this.products);
    const displayedProducts = productService.filterAndSort(this.products, this.filter);

    // List of unique categories for filter
    const categories = Array.from(new Set(this.products.map(p => p.category))).filter(Boolean);

    return html`
      <div class="app-layout">
        <!-- Header Navbar -->
        <app-navbar
          @create-product=${this.openCreateModal}
          @export-csv=${this.handleExportCsv}
          @export-json=${this.handleExportJson}
          @import-json=${this.handleImportJson}
          @reset-data=${this.handleResetData}
        ></app-navbar>

        <main class="main-content">
          <!-- Stats Summary Overview -->
          <app-stats .stats=${stats}></app-stats>

          <!-- Control Panel: Search, Category, Status, Sort & View Mode -->
          <section class="control-panel">
            <div class="search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Cari berdasarkan nama produk, SKU, atau kategori..."
                .value=${this.filter.search}
                @input=${(e: any) => {
                  this.filter = { ...this.filter, search: e.target.value };
                }}
              />
              ${this.filter.search
                ? html`
                    <button
                      class="btn-clear"
                      @click=${() => {
                        this.filter = { ...this.filter, search: '' };
                      }}
                      title="Hapus pencarian"
                    >
                      &times;
                    </button>
                  `
                : ''}
            </div>

            <div class="filters-row">
              <!-- Filter Kategori -->
              <div class="filter-item">
                <label>Kategori:</label>
                <select
                  .value=${this.filter.category}
                  @change=${(e: any) => {
                    this.filter = { ...this.filter, category: e.target.value };
                  }}
                >
                  <option value="all">Semua Kategori</option>
                  ${categories.map(c => html`<option value=${c}>${c}</option>`)}
                </select>
              </div>

              <!-- Filter Status -->
              <div class="filter-item">
                <label>Status:</label>
                <div class="status-pills">
                  <button
                    class="pill ${this.filter.status === 'all' ? 'active' : ''}"
                    @click=${() => (this.filter = { ...this.filter, status: 'all' })}
                  >
                    Semua (${this.products.length})
                  </button>
                  <button
                    class="pill pill-green ${this.filter.status === 'available' ? 'active' : ''}"
                    @click=${() => (this.filter = { ...this.filter, status: 'available' })}
                  >
                    Tersedia
                  </button>
                  <button
                    class="pill pill-yellow ${this.filter.status === 'low' ? 'active' : ''}"
                    @click=${() => (this.filter = { ...this.filter, status: 'low' })}
                  >
                    Stok Rendah (${stats.lowStockCount})
                  </button>
                  <button
                    class="pill pill-red ${this.filter.status === 'out_of_stock' ? 'active' : ''}"
                    @click=${() => (this.filter = { ...this.filter, status: 'out_of_stock' })}
                  >
                    Habis (${stats.outOfStockCount})
                  </button>
                </div>
              </div>

              <!-- Sorting -->
              <div class="filter-item sort-item">
                <label>Urutkan:</label>
                <select @change=${this.handleSortChange}>
                  <option value="createdAt:desc">Terbaru</option>
                  <option value="createdAt:asc">Terlama</option>
                  <option value="name:asc">Nama (A - Z)</option>
                  <option value="name:desc">Nama (Z - A)</option>
                  <option value="price:asc">Harga Terendah</option>
                  <option value="price:desc">Harga Tertinggi</option>
                  <option value="stock:desc">Stok Terbanyak</option>
                  <option value="stock:asc">Stok Tersedikit</option>
                </select>
              </div>

              <!-- View Switcher -->
              <div class="view-toggle">
                <button
                  class="toggle-btn ${this.viewMode === 'table' ? 'active' : ''}"
                  @click=${() => (this.viewMode = 'table')}
                  title="Tampilan Tabel"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
                <button
                  class="toggle-btn ${this.viewMode === 'grid' ? 'active' : ''}"
                  @click=${() => (this.viewMode = 'grid')}
                  title="Tampilan Grid Kartu"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
              </div>
            </div>
          </section>

          <!-- Data Content -->
          ${this.isLoading
            ? html`
                <div class="loading-state">
                  <div class="spinner"></div>
                  <span>Memuat data inventaris...</span>
                </div>
              `
            : displayedProducts.length === 0
            ? html`
                <div class="empty-state">
                  <div class="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="m7.5 4.27 9 5.15"></path>
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                      <path d="m3.3 7 8.7 5 8.7-5"></path>
                      <path d="M12 22V12"></path>
                    </svg>
                  </div>
                  <h3>Tidak ada produk yang cocok</h3>
                  <p>
                    ${this.filter.search || this.filter.category !== 'all' || this.filter.status !== 'all'
                      ? 'Coba sesuaikan kata kunci pencarian atau setel ulang filter.'
                      : 'Belum ada produk yang tersimpan. Mulai tambahkan produk pertama Anda sekarang!'}
                  </p>
                  <button class="btn-add-empty" @click=${this.openCreateModal}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Tambah Produk Baru</span>
                  </button>
                </div>
              `
            : this.viewMode === 'table'
            ? this.renderTable(displayedProducts)
            : this.renderGrid(displayedProducts)}
        </main>

        <!-- Modals & Toasts -->
        <app-product-modal
          .isOpen=${this.isModalOpen}
          .product=${this.editingProduct}
          @close-modal=${() => (this.isModalOpen = false)}
          @save-product=${this.handleSaveProduct}
        ></app-product-modal>

        <app-delete-modal
          .isOpen=${this.isDeleteModalOpen}
          .productId=${this.deletingProduct?.id || ''}
          .productName=${this.deletingProduct?.name || ''}
          @close-delete-modal=${() => (this.isDeleteModalOpen = false)}
          @confirm-delete=${this.handleConfirmDelete}
        ></app-delete-modal>

        <app-toast
          .toasts=${this.toasts}
          @dismiss-toast=${(e: CustomEvent<{ id: string }>) => this.dismissToast(e.detail.id)}
        ></app-toast>

        <!-- Hidden input for file import fallback in web mode -->
        <input
          id="file-import"
          type="file"
          accept=".json,application/json"
          style="display: none;"
          @change=${this.handleFileSelected}
        />
      </div>
    `;
  }

  private renderTable(products: Product[]) {
    return html`
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 110px;">SKU</th>
              <th>Nama Produk & Deskripsi</th>
              <th style="width: 140px;">Kategori</th>
              <th style="width: 140px; text-align: right;">Harga Satuan</th>
              <th style="width: 120px; text-align: center;">Stok</th>
              <th style="width: 130px; text-align: center;">Status</th>
              <th style="width: 110px;">Diperbarui</th>
              <th style="width: 100px; text-align: center;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(
              item => html`
                <tr class="row-${item.status}">
                  <td>
                    <span class="badge-sku">${item.sku}</span>
                  </td>
                  <td>
                    <div class="cell-product-name">
                      <strong>${item.name}</strong>
                      ${item.description
                        ? html`<small class="product-desc">${item.description}</small>`
                        : ''}
                    </div>
                  </td>
                  <td>
                    <span class="badge-category">${item.category}</span>
                  </td>
                  <td style="text-align: right;">
                    <span class="cell-price">${productService.formatRupiah(item.price)}</span>
                  </td>
                  <td style="text-align: center;">
                    <span class="cell-stock ${item.stock === 0 ? 'stock-zero' : item.stock <= 10 ? 'stock-low' : ''}">
                      ${item.stock} <small>${item.unit}</small>
                    </span>
                  </td>
                  <td style="text-align: center;">
                    ${this.renderStatusBadge(item.status)}
                  </td>
                  <td>
                    <small class="text-muted">${productService.formatDate(item.updatedAt)}</small>
                  </td>
                  <td style="text-align: center;">
                    <div class="row-actions">
                      <button
                        class="btn-icon btn-edit"
                        @click=${() => this.openEditModal(item)}
                        title="Edit produk"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      <button
                        class="btn-icon btn-delete"
                        @click=${() => this.openDeleteModal(item)}
                        title="Hapus produk"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
        <div class="table-footer">
          <span>Menampilkan <strong>${products.length}</strong> produk</span>
          <span class="footer-hint">Gunakan tombol Edit atau Hapus untuk mengelola data</span>
        </div>
      </div>
    `;
  }

  private renderGrid(products: Product[]) {
    return html`
      <div class="products-grid">
        ${products.map(
          item => html`
            <div class="product-card">
              <div class="card-top">
                <span class="badge-sku">${item.sku}</span>
                ${this.renderStatusBadge(item.status)}
              </div>

              <div class="card-middle">
                <span class="badge-category">${item.category}</span>
                <h4 class="card-title">${item.name}</h4>
                <p class="card-desc">${item.description || 'Tidak ada keterangan tambahan.'}</p>
              </div>

              <div class="card-stats">
                <div class="stat-col">
                  <span class="stat-title">Harga</span>
                  <strong class="stat-val text-primary">${productService.formatRupiah(item.price)}</strong>
                </div>
                <div class="stat-col text-right">
                  <span class="stat-title">Stok Gudang</span>
                  <strong class="stat-val ${item.stock === 0 ? 'text-danger' : item.stock <= 10 ? 'text-warning' : ''}">
                    ${item.stock} ${item.unit}
                  </strong>
                </div>
              </div>

              <div class="card-bottom">
                <small class="text-muted">${productService.formatDate(item.updatedAt)}</small>
                <div class="row-actions">
                  <button
                    class="btn-icon btn-edit"
                    @click=${() => this.openEditModal(item)}
                    title="Edit produk"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    class="btn-icon btn-delete"
                    @click=${() => this.openDeleteModal(item)}
                    title="Hapus produk"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  private renderStatusBadge(status: string) {
    switch (status) {
      case 'available':
        return html`<span class="badge-status badge-success">● Tersedia</span>`;
      case 'low':
        return html`<span class="badge-status badge-warning">▲ Stok Rendah</span>`;
      case 'out_of_stock':
        return html`<span class="badge-status badge-danger">✕ Habis</span>`;
      default:
        return html`<span class="badge-status">${status}</span>`;
    }
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: #f1f5f9;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      max-width: 1360px;
      width: 100%;
      margin: 0 auto;
      padding: 1.5rem;
      box-sizing: border-box;
    }

    /* Control Panel */
    .control-panel {
      background: #ffffff;
      border-radius: 12px;
      padding: 1.25rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.55rem 0.85rem;
      color: #64748b;
      transition: all 0.15s;
    }

    .search-box:focus-within {
      border-color: #0284c7;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
    }

    .search-box input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      font-size: 0.9rem;
      color: #0f172a;
      font-family: inherit;
    }

    .btn-clear {
      background: none;
      border: none;
      font-size: 1.3rem;
      color: #94a3b8;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .btn-clear:hover {
      color: #334155;
    }

    .filters-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.25rem;
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #475569;
    }

    .filter-item label {
      font-weight: 600;
      white-space: nowrap;
    }

    select {
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #1e293b;
      font-family: inherit;
      font-size: 0.84rem;
      outline: none;
      cursor: pointer;
    }

    select:focus {
      border-color: #0284c7;
    }

    .status-pills {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
    }

    .pill {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      padding: 0.35rem 0.7rem;
      border-radius: 9999px;
      font-size: 0.76rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .pill:hover {
      background: #f1f5f9;
    }

    .pill.active {
      background: #0284c7;
      color: #ffffff;
      border-color: #0284c7;
    }

    .pill-green.active {
      background: #10b981;
      border-color: #10b981;
    }

    .pill-yellow.active {
      background: #f59e0b;
      border-color: #f59e0b;
    }

    .pill-red.active {
      background: #ef4444;
      border-color: #ef4444;
    }

    .sort-item {
      margin-left: auto;
    }

    .view-toggle {
      display: flex;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #f8fafc;
    }

    .toggle-btn {
      padding: 0.4rem 0.65rem;
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }

    .toggle-btn.active {
      background: #0284c7;
      color: #ffffff;
    }

    /* Table Styles */
    .table-container {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }

    .data-table thead th {
      background: #f8fafc;
      color: #475569;
      font-weight: 600;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .data-table tbody td {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .data-table tbody tr:hover {
      background: #f8fafc;
    }

    .badge-sku {
      background: #f1f5f9;
      color: #334155;
      font-family: monospace;
      font-size: 0.76rem;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .cell-product-name {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .cell-product-name strong {
      color: #0f172a;
      font-weight: 600;
    }

    .product-desc {
      color: #64748b;
      font-size: 0.76rem;
      max-width: 320px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge-category {
      background: #e0f2fe;
      color: #0369a1;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.76rem;
      font-weight: 600;
      display: inline-block;
    }

    .cell-price {
      font-weight: 700;
      color: #0f172a;
    }

    .cell-stock {
      font-weight: 600;
      color: #0f172a;
    }

    .cell-stock.stock-low {
      color: #d97706;
      font-weight: 700;
    }

    .cell-stock.stock-zero {
      color: #dc2626;
      font-weight: 700;
    }

    .badge-status {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.74rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-danger {
      background: #fee2e2;
      color: #991b1b;
    }

    .text-muted {
      color: #94a3b8;
      font-size: 0.78rem;
    }

    .row-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
    }

    .btn-icon {
      border: none;
      background: transparent;
      padding: 0.4rem;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.78rem;
      font-weight: 600;
      transition: all 0.15s;
    }

    .btn-edit {
      color: #0284c7;
      background: #e0f2fe;
    }

    .btn-edit:hover {
      background: #bae6fd;
    }

    .btn-delete {
      color: #ef4444;
      background: #fee2e2;
    }

    .btn-delete:hover {
      background: #fecaca;
    }

    .table-footer {
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      font-size: 0.8rem;
      color: #64748b;
    }

    /* Grid Styles */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .product-card {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: transform 0.15s, box-shadow 0.15s;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.85rem;
    }

    .card-middle {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    }

    .card-title {
      margin: 0.5rem 0 0.35rem 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
    }

    .card-desc {
      margin: 0;
      font-size: 0.8rem;
      color: #64748b;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-stats {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .stat-col {
      display: flex;
      flex-direction: column;
    }

    .stat-col.text-right {
      text-align: right;
    }

    .stat-title {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 600;
      color: #94a3b8;
    }

    .stat-val {
      font-size: 0.95rem;
      margin-top: 0.15rem;
    }

    .text-primary {
      color: #0284c7;
    }

    .text-warning {
      color: #d97706;
    }

    .text-danger {
      color: #dc2626;
    }

    .card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #f1f5f9;
      padding-top: 0.85rem;
    }

    /* Empty & Loading States */
    .empty-state {
      background: #ffffff;
      border-radius: 12px;
      padding: 3.5rem 2rem;
      text-align: center;
      border: 1px dashed #cbd5e1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .empty-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .empty-state h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #0f172a;
    }

    .empty-state p {
      margin: 0.5rem 0 1.5rem 0;
      color: #64748b;
      max-width: 440px;
      font-size: 0.9rem;
    }

    .btn-add-empty {
      background: #0284c7;
      color: white;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 2px 4px rgba(2, 132, 199, 0.25);
    }

    .btn-add-empty:hover {
      background: #0369a1;
    }

    .loading-state {
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: #64748b;
      font-size: 0.95rem;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #0284c7;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
}
