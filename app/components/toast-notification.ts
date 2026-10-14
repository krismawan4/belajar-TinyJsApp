import { html, css } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Component, TiniComponent } from '@tinijs/core';
import type { ToastMessage } from '../types/product.js';

@Component({
  name: 'app-toast',
})
export class AppToast extends TiniComponent {
  @property({ type: Array })
  toasts: ToastMessage[] = [];

  private dismiss(id: string) {
    this.dispatchEvent(
      new CustomEvent('dismiss-toast', {
        detail: { id },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render() {
    if (!this.toasts || this.toasts.length === 0) return html``;

    return html`
      <div class="toast-container">
        ${this.toasts.map(
          toast => html`
            <div class="toast toast-${toast.type}">
              <div class="toast-icon">
                ${toast.type === 'success'
                  ? html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                  : toast.type === 'error'
                  ? html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
                  : html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`}
              </div>
              <span class="toast-message">${toast.message}</span>
              <button class="toast-close" @click=${() => this.dismiss(toast.id)}>
                &times;
              </button>
            </div>
          `
        )}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      z-index: 2000;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      min-width: 280px;
      max-width: 420px;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      background: #1e293b;
      color: #ffffff;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      border-left: 4px solid #64748b;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .toast-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-success {
      border-left-color: #10b981;
    }
    .toast-success .toast-icon {
      color: #34d399;
    }

    .toast-error {
      border-left-color: #ef4444;
    }
    .toast-error .toast-icon {
      color: #f87171;
    }

    .toast-info {
      border-left-color: #0284c7;
    }
    .toast-info .toast-icon {
      color: #38bdf8;
    }

    .toast-message {
      font-size: 0.85rem;
      font-weight: 500;
      flex: 1;
      line-height: 1.4;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1.25rem;
      line-height: 1;
      padding: 0 0.2rem;
      transition: color 0.15s;
    }

    .toast-close:hover {
      color: #ffffff;
    }
  `;
}

