import { html, css } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Component, TiniComponent } from '@tinijs/core';
import type { InventoryStats } from '../types/product.js';
import { productService } from '../services/product.service.js';

@Component({
  name: 'app-stats',
})
export class AppStats extends TiniComponent {
  @property({ type: Object })
  stats: InventoryStats = {
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  };

  protected render() {
    const criticalCount = (this.stats.lowStockCount || 0) + (this.stats.outOfStockCount || 0);

    return html`
      <div class="stats-grid">
        <!-- Card 1: Total Products -->
        <div class="card card-blue">
          <div class="icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div class="card-content">
            <span class="card-label">Total Produk</span>
            <span class="card-value">${this.stats.totalProducts}</span>
            <span class="card-desc">Item terdaftar</span>
          </div>
        </div>

        <!-- Card 2: Total Stock -->
        <div class="card card-emerald">
          <div class="icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div class="card-content">
            <span class="card-label">Total Unit Stok</span>
            <span class="card-value">${this.stats.totalStock.toLocaleString('id-ID')}</span>
            <span class="card-desc">Kuantitas tersedia di gudang</span>
          </div>
        </div>

        <!-- Card 3: Total Asset Value -->
        <div class="card card-indigo">
          <div class="icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="card-content">
            <span class="card-label">Total Nilai Inventaris</span>
            <span class="card-value">${productService.formatRupiah(this.stats.totalValue)}</span>
            <span class="card-desc">Estimasi nilai aset stok</span>
          </div>
        </div>

        <!-- Card 4: Critical Stock Alert -->
        <div class="card ${criticalCount > 0 ? 'card-amber' : 'card-slate'}">
          <div class="icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div class="card-content">
            <span class="card-label">Perhatian Stok</span>
            <span class="card-value">${criticalCount}</span>
            <span class="card-desc">
              ${this.stats.outOfStockCount} Habis &bull; ${this.stats.lowStockCount} Menipis
            </span>
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      margin-bottom: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1rem;
    }

    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 1.15rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .card-label {
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
    }

    .card-value {
      font-size: 1.45rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.25;
      margin: 0.2rem 0;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .card-desc {
      font-size: 0.74rem;
      color: #94a3b8;
    }

    /* Color Variants */
    .card-blue .icon-box {
      background: #e0f2fe;
      color: #0284c7;
    }
    .card-blue {
      border-left: 4px solid #0284c7;
    }

    .card-emerald .icon-box {
      background: #d1fae5;
      color: #059669;
    }
    .card-emerald {
      border-left: 4px solid #059669;
    }

    .card-indigo .icon-box {
      background: #e0e7ff;
      color: #4f46e5;
    }
    .card-indigo {
      border-left: 4px solid #4f46e5;
    }

    .card-amber .icon-box {
      background: #fef3c7;
      color: #d97706;
    }
    .card-amber {
      border-left: 4px solid #d97706;
    }

    .card-slate .icon-box {
      background: #f1f5f9;
      color: #64748b;
    }
    .card-slate {
      border-left: 4px solid #94a3b8;
    }
  `;
}

