import { html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { Component, TiniComponent } from '@tinijs/core';
import type { Product, ProductInput } from '../types/product.js';

@Component({
  name: 'app-product-modal',
})
export class AppProductModal extends TiniComponent {
  @property({ type: Boolean })
  isOpen = false;

  @property({ type: Object })
  product: Product | null = null; // null for Create, Product for Edit

  @state()
  private sku = '';

  @state()
  private name = '';

  @state()
  private category = 'Elektronik';

  @state()
  private price = 0;

  @state()
  private stock = 0;

  @state()
  private unit = 'Unit';

  @state()
  private description = '';

  @state()
  private errors: Record<string, string> = {};

  protected willUpdate(changedProperties: Map<string, any>) {
    if (changedProperties.has('product') || changedProperties.has('isOpen')) {
      if (this.isOpen) {
        if (this.product) {
          this.sku = this.product.sku;
          this.name = this.product.name;
          this.category = this.product.category;
          this.price = this.product.price;
          this.stock = this.product.stock;
          this.unit = this.product.unit;
          this.description = this.product.description || '';
        } else {
          this.sku = '';
          this.name = '';
          this.category = 'Elektronik';
          this.price = 0;
          this.stock = 1;
          this.unit = 'Unit';
          this.description = '';
        }
        this.errors = {};
      }
    }
  }

  private onClose() {
    this.dispatchEvent(new CustomEvent('close-modal', { bubbles: true, composed: true }));
  }

  private validate(): boolean {
    const errs: Record<string, string> = {};
    if (!this.name.trim()) {
      errs.name = 'Nama produk wajib diisi.';
    }
    if (this.price === undefined || this.price < 0 || isNaN(this.price)) {
      errs.price = 'Harga harus berupa angka 0 atau lebih.';
    }
    if (this.stock === undefined || this.stock < 0 || isNaN(this.stock)) {
      errs.stock = 'Jumlah stok harus berupa angka 0 atau lebih.';
    }
    this.errors = errs;
    return Object.keys(errs).length === 0;
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    if (!this.validate()) return;

    const data: ProductInput = {
      sku: this.sku.trim(),
      name: this.name.trim(),
      category: this.category,
      price: Number(this.price),
      stock: Number(this.stock),
      unit: this.unit.trim() || 'Unit',
      description: this.description.trim(),
    };

    this.dispatchEvent(
      new CustomEvent('save-product', {
        detail: {
          id: this.product ? this.product.id : undefined,
          data,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render() {
    if (!this.isOpen) return html``;

    const isEdit = !!this.product;
    const title = isEdit ? 'Edit Data Produk' : 'Tambah Produk Baru';

    return html`
      <div class="backdrop" @click=${(e: Event) => e.target === e.currentTarget && this.onClose()}>
        <div class="modal">
          <div class="modal-header">
            <div class="header-icon ${isEdit ? 'icon-edit' : 'icon-add'}">
              ${isEdit
                ? html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>`
                : html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>`}
            </div>
            <div class="header-text">
              <h2>${title}</h2>
              <p>${isEdit ? 'Perbarui informasi produk dan stok' : 'Lengkapi data produk yang ingin ditambahkan'}</p>
            </div>
            <button class="btn-close" @click=${this.onClose} title="Tutup">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form @submit=${this.handleSubmit}>
            <div class="modal-body">
              <div class="grid-2">
                <!-- SKU / Kode -->
                <div class="form-group">
                  <label for="sku">Kode SKU / Kode Barang</label>
                  <input
                    id="sku"
                    type="text"
                    placeholder="Contoh: ELC-001 (Otomatis jika kosong)"
                    .value=${this.sku}
                    @input=${(e: any) => (this.sku = e.target.value)}
                  />
                  <small class="hint">Biarkan kosong untuk kode otomatis.</small>
                </div>

                <!-- Kategori -->
                <div class="form-group">
                  <label for="category">Kategori <span class="req">*</span></label>
                  <select
                    id="category"
                    .value=${this.category}
                    @change=${(e: any) => (this.category = e.target.value)}
                  >
                    <option value="Elektronik">Elektronik</option>
                    <option value="Aksesoris">Aksesoris</option>
                    <option value="Pakaian">Pakaian</option>
                    <option value="Makanan & Minuman">Makanan & Minuman</option>
                    <option value="Peralatan Kantor">Peralatan Kantor</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Otomotif">Otomotif</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <!-- Nama Produk -->
              <div class="form-group">
                <label for="name">Nama Produk <span class="req">*</span></label>
                <input
                  id="name"
                  type="text"
                  class=${this.errors.name ? 'is-invalid' : ''}
                  placeholder="Contoh: Laptop ASUS Vivobook 14"
                  .value=${this.name}
                  @input=${(e: any) => (this.name = e.target.value)}
                  required
                />
                ${this.errors.name ? html`<span class="error-msg">${this.errors.name}</span>` : ''}
              </div>

              <div class="grid-3">
                <!-- Harga -->
                <div class="form-group">
                  <label for="price">Harga Satuan (Rp) <span class="req">*</span></label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="1000"
                    class=${this.errors.price ? 'is-invalid' : ''}
                    placeholder="0"
                    .value=${String(this.price)}
                    @input=${(e: any) => (this.price = Number(e.target.value))}
                    required
                  />
                  ${this.errors.price ? html`<span class="error-msg">${this.errors.price}</span>` : ''}
                </div>

                <!-- Stok -->
                <div class="form-group">
                  <label for="stock">Jumlah Stok <span class="req">*</span></label>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    class=${this.errors.stock ? 'is-invalid' : ''}
                    placeholder="0"
                    .value=${String(this.stock)}
                    @input=${(e: any) => (this.stock = Number(e.target.value))}
                    required
                  />
                  ${this.errors.stock ? html`<span class="error-msg">${this.errors.stock}</span>` : ''}
                </div>

                <!-- Satuan -->
                <div class="form-group">
                  <label for="unit">Satuan Barang</label>
                  <input
                    id="unit"
                    type="text"
                    placeholder="Unit / Pcs / Box / Rim"
                    .value=${this.unit}
                    @input=${(e: any) => (this.unit = e.target.value)}
                  />
                </div>
              </div>

              <!-- Deskripsi -->
              <div class="form-group">
                <label for="desc">Deskripsi & Catatan Tambahan</label>
                <textarea
                  id="desc"
                  rows="3"
                  placeholder="Keterangan spesifikasi, warna, atau catatan stok..."
                  .value=${this.description}
                  @input=${(e: any) => (this.description = e.target.value)}
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-cancel" @click=${this.onClose}>
                Batal
              </button>
              <button type="submit" class="btn btn-save">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>${isEdit ? 'Simpan Perubahan' : 'Tambahkan Produk'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 620px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    .header-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-add {
      background: #e0f2fe;
      color: #0284c7;
    }

    .icon-edit {
      background: #fef3c7;
      color: #d97706;
    }

    .header-text {
      flex: 1;
    }

    .header-text h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
    }

    .header-text p {
      margin: 0.2rem 0 0 0;
      font-size: 0.8rem;
      color: #64748b;
    }

    .btn-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.4rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }

    .btn-close:hover {
      background: #e2e8f0;
      color: #334155;
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 70vh;
      overflow-y: auto;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #334155;
    }

    .req {
      color: #ef4444;
    }

    input, select, textarea {
      padding: 0.55rem 0.75rem;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-family: inherit;
      font-size: 0.88rem;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    input:focus, select:focus, textarea:focus {
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
    }

    input.is-invalid {
      border-color: #ef4444;
    }

    input.is-invalid:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }

    .hint {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .error-msg {
      font-size: 0.74rem;
      color: #ef4444;
      font-weight: 500;
    }

    textarea {
      resize: vertical;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.55rem 1.15rem;
      font-size: 0.86rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      font-family: inherit;
      transition: all 0.15s;
    }

    .btn-cancel {
      background: #ffffff;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    .btn-cancel:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .btn-save {
      background: #0284c7;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(2, 132, 199, 0.25);
    }

    .btn-save:hover {
      background: #0369a1;
      box-shadow: 0 4px 6px rgba(2, 132, 199, 0.35);
    }
  `;
}

