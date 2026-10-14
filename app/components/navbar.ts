import { html, css } from 'lit';
import { Component, TiniComponent } from '@tinijs/core';

@Component({
  name: 'app-navbar',
})
export class AppNavbar extends TiniComponent {
  private isDesktop = typeof window !== 'undefined' && !!window.desktopApi?.isDesktop;

  private onAddClick() {
    this.dispatchEvent(new CustomEvent('create-product', { bubbles: true, composed: true }));
  }

  private onExportCsv() {
    this.dispatchEvent(new CustomEvent('export-csv', { bubbles: true, composed: true }));
  }

  private onExportJson() {
    this.dispatchEvent(new CustomEvent('export-json', { bubbles: true, composed: true }));
  }

  private onImportJson() {
    this.dispatchEvent(new CustomEvent('import-json', { bubbles: true, composed: true }));
  }

  private onResetData() {
    this.dispatchEvent(new CustomEvent('reset-data', { bubbles: true, composed: true }));
  }

  protected render() {
    return html`
      <header class="navbar">
        <div class="brand">
          <div class="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div class="brand-text">
            <h1 class="title">TiniCRUD Desktop</h1>
            <span class="subtitle">Manajemen Inventaris & Produk</span>
          </div>
          <span class="platform-badge ${this.isDesktop ? 'desktop' : 'web'}">
            ${this.isDesktop ? '🖥️ Desktop (Electron)' : '🌐 Web Mode'}
          </span>
        </div>

        <div class="actions">
          <button class="btn btn-secondary" @click=${this.onResetData} title="Reset kembali ke sampel data awal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            <span>Reset Sampel</span>
          </button>

          <button class="btn btn-secondary" @click=${this.onExportCsv} title="Unduh laporan dalam format CSV">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export CSV</span>
          </button>

          <button class="btn btn-secondary" @click=${this.onExportJson} title="Cadangkan seluruh data ke JSON">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>Backup JSON</span>
          </button>

          <button class="btn btn-secondary" @click=${this.onImportJson} title="Impor data dari berkas JSON">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Impor JSON</span>
          </button>

          <button class="btn btn-primary" @click=${this.onAddClick} title="Tambah data produk baru (Ctrl+N)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Tambah Produk</span>
          </button>
        </div>
      </header>
    `;
  }

  static styles = css`
    :host {
      display: block;
      background: #1e293b;
      color: #f8fafc;
      border-bottom: 1px solid #334155;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    }

    .navbar {
      max-width: 1360px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .logo {
      background: linear-gradient(135deg, #0284c7, #06b6d4);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(6, 182, 212, 0.35);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .title {
      font-size: 1.18rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.02em;
      color: #ffffff;
    }

    .subtitle {
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .platform-badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      letter-spacing: 0.02em;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .platform-badge.desktop {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.4);
    }

    .platform-badge.web {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      border: 1px solid rgba(96, 165, 250, 0.4);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.85rem;
      font-size: 0.82rem;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      font-family: inherit;
      user-select: none;
    }

    .btn:active {
      transform: translateY(1px);
    }

    .btn-primary {
      background: linear-gradient(135deg, #0284c7, #0ea5e9);
      color: white;
      box-shadow: 0 2px 4px rgba(14, 165, 233, 0.25);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #0369a1, #0284c7);
      box-shadow: 0 4px 8px rgba(14, 165, 233, 0.35);
    }

    .btn-secondary {
      background: #334155;
      color: #e2e8f0;
      border: 1px solid #475569;
    }

    .btn-secondary:hover {
      background: #475569;
      color: #ffffff;
      border-color: #64748b;
    }
  `;
}

