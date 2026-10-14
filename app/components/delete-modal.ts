import { html, css } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Component, TiniComponent } from '@tinijs/core';

@Component({
  name: 'app-delete-modal',
})
export class AppDeleteModal extends TiniComponent {
  @property({ type: Boolean })
  isOpen = false;

  @property({ type: String })
  productId = '';

  @property({ type: String })
  productName = '';

  private onClose() {
    this.dispatchEvent(new CustomEvent('close-delete-modal', { bubbles: true, composed: true }));
  }

  private onConfirm() {
    this.dispatchEvent(
      new CustomEvent('confirm-delete', {
        detail: { id: this.productId },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render() {
    if (!this.isOpen) return html``;

    return html`
      <div class="backdrop" @click=${(e: Event) => e.target === e.currentTarget && this.onClose()}>
        <div class="modal">
          <div class="modal-body">
            <div class="icon-danger">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <h3>Hapus Produk?</h3>
            <p>
              Apakah Anda yakin ingin menghapus <strong>"${this.productName}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" @click=${this.onClose}>
              Batal
            </button>
            <button class="btn btn-delete" @click=${this.onConfirm}>
              Ya, Hapus Produk
            </button>
          </div>
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
      max-width: 440px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      animation: scaleUp 0.18s ease-out;
    }

    @keyframes scaleUp {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .modal-body {
      padding: 1.75rem 1.5rem 1.25rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .icon-danger {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #fee2e2;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: #0f172a;
    }

    p {
      margin: 0.5rem 0 0 0;
      font-size: 0.88rem;
      color: #64748b;
      line-height: 1.5;
    }

    strong {
      color: #1e293b;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .btn {
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

    .btn-delete {
      background: #ef4444;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.25);
    }

    .btn-delete:hover {
      background: #dc2626;
      box-shadow: 0 4px 6px rgba(239, 68, 68, 0.35);
    }
  `;
}

