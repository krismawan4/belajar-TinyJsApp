// TiniCRUD Frontend - Berjalan di dalam WebView bawaan OS (WebView2 di Windows)
// Terhubung dengan backend txiki.js via tiny.api.call

let products = [];
let filter = {
  search: '',
  category: 'all',
  status: 'all',
  sortField: 'createdAt',
  sortOrder: 'desc',
};
let viewMode = 'table'; // 'table' | 'grid'
let editingId = null;

// Helper DOM
const $ = (id) => document.getElementById(id);

function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num || 0);
}

function formatDate(iso) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return iso;
  }
}

function showToast(message, type = 'info') {
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function determineStatus(stock) {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= 10) return 'low';
  return 'available';
}

// Backend RPC
async function loadData() {
  try {
    products = await tiny.api.call('loadProducts');
    updateCategoryDropdown();
    render();
  } catch (err) {
    showToast('Gagal memuat data: ' + err, 'error');
  }
}

async function persistData() {
  try {
    await tiny.api.call('saveProducts', { products });
  } catch (err) {
    showToast('Gagal menyimpan ke file: ' + err, 'error');
  }
}

function updateCategoryDropdown() {
  const catSelect = $('filter-category');
  const cats = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  const current = filter.category;
  catSelect.innerHTML = '<option value="all">Semua Kategori</option>' +
    cats.map(c => `<option value="${c}" ${c === current ? 'selected' : ''}>${c}</option>`).join('');
}

function computeStats() {
  let totalStock = 0;
  let totalValue = 0;
  let lowCount = 0;
  let outCount = 0;

  for (const p of products) {
    totalStock += p.stock;
    totalValue += (p.price || 0) * (p.stock || 0);
    if (p.status === 'out_of_stock') outCount++;
    else if (p.status === 'low') lowCount++;
  }

  $('stat-products').textContent = products.length;
  $('stat-stock').textContent = totalStock.toLocaleString('id-ID');
  $('stat-value').textContent = formatRupiah(totalValue);
  $('stat-critical').textContent = lowCount + outCount;
  $('stat-critical-detail').textContent = `${outCount} Habis • ${lowCount} Menipis`;
}

function filterAndSortProducts() {
  let list = [...products];

  // Search
  if (filter.search.trim()) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  }

  // Category
  if (filter.category !== 'all') {
    list = list.filter(p => p.category === filter.category);
  }

  // Status
  if (filter.status !== 'all') {
    list = list.filter(p => p.status === filter.status);
  }

  // Sort
  list.sort((a, b) => {
    let cmp = 0;
    switch (filter.sortField) {
      case 'name':
        cmp = a.name.localeCompare(b.name, 'id');
        break;
      case 'price':
        cmp = a.price - b.price;
        break;
      case 'stock':
        cmp = a.stock - b.stock;
        break;
      case 'createdAt':
      default:
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return filter.sortOrder === 'desc' ? -cmp : cmp;
  });

  return list;
}

function renderStatusBadge(status) {
  switch (status) {
    case 'available':
      return `<span class="badge-status badge-success">● Tersedia</span>`;
    case 'low':
      return `<span class="badge-status badge-warning">▲ Stok Rendah</span>`;
    case 'out_of_stock':
      return `<span class="badge-status badge-danger">✕ Habis</span>`;
    default:
      return `<span class="badge-status">${status}</span>`;
  }
}

function render() {
  computeStats();
  const filtered = filterAndSortProducts();
  const container = $('content-area');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
            <path d="m3.3 7 8.7 5 8.7-5"></path>
            <path d="M12 22V12"></path>
          </svg>
        </div>
        <h3 style="margin: 0 0 0.5rem 0;">Tidak ada produk yang cocok</h3>
        <p style="color: #64748b; margin: 0 0 1.25rem 0;">Sesuaikan filter pencarian atau tambahkan produk baru.</p>
        <button class="btn btn-primary" onclick="openCreateModal()">+ Tambah Produk Baru</button>
      </div>
    `;
    return;
  }

  if (viewMode === 'table') {
    container.innerHTML = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 110px;">SKU</th>
              <th>Nama Produk & Deskripsi</th>
              <th style="width: 140px;">Kategori</th>
              <th style="width: 140px; text-align: right;">Harga Satuan</th>
              <th style="width: 110px; text-align: center;">Stok</th>
              <th style="width: 130px; text-align: center;">Status</th>
              <th style="width: 110px;">Diperbarui</th>
              <th style="width: 100px; text-align: center;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(p => `
              <tr>
                <td><span class="badge-sku">${p.sku}</span></td>
                <td>
                  <div class="cell-product-name">
                    <strong>${p.name}</strong>
                    ${p.description ? `<small class="product-desc">${p.description}</small>` : ''}
                  </div>
                </td>
                <td><span class="badge-category">${p.category}</span></td>
                <td style="text-align: right;"><span class="cell-price">${formatRupiah(p.price)}</span></td>
                <td style="text-align: center;"><strong>${p.stock}</strong> <small>${p.unit}</small></td>
                <td style="text-align: center;">${renderStatusBadge(p.status)}</td>
                <td><small style="color: #94a3b8;">${formatDate(p.updatedAt)}</small></td>
                <td style="text-align: center;">
                  <div class="row-actions">
                    <button class="btn-icon btn-edit" onclick="openEditModal('${p.id}')" title="Edit">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct('${p.id}')" title="Hapus">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="table-footer">
          <span>Menampilkan <strong>${filtered.length}</strong> dari <strong>${products.length}</strong> produk</span>
          <span>Penyimpanan lokal: <code>products.json</code></span>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="products-grid">
        ${filtered.map(p => `
          <div class="product-card">
            <div class="card-top">
              <span class="badge-sku">${p.sku}</span>
              ${renderStatusBadge(p.status)}
            </div>
            <span class="badge-category" style="width: fit-content; margin-bottom: 0.35rem;">${p.category}</span>
            <h4 class="card-title">${p.name}</h4>
            <p class="product-desc" style="max-width: none; margin: 0 0 0.5rem 0;">${p.description || 'Tidak ada deskripsi.'}</p>
            <div class="card-stats">
              <div>
                <small style="color: #64748b; font-size: 0.72rem;">HARGA</small><br>
                <strong style="color: #0284c7;">${formatRupiah(p.price)}</strong>
              </div>
              <div style="text-align: right;">
                <small style="color: #64748b; font-size: 0.72rem;">STOK</small><br>
                <strong>${p.stock} ${p.unit}</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 0.75rem;">
              <small style="color: #94a3b8;">${formatDate(p.updatedAt)}</small>
              <div class="row-actions">
                <button class="btn-icon btn-edit" onclick="openEditModal('${p.id}')">Edit</button>
                <button class="btn-icon btn-delete" onclick="deleteProduct('${p.id}')">Hapus</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// Global modal triggers
window.openCreateModal = function() {
  editingId = null;
  $('modal-title').textContent = 'Tambah Produk Baru';
  $('modal-subtitle').textContent = 'Lengkapi formulir data produk di bawah ini';
  $('btn-submit-modal').textContent = 'Tambahkan Produk';
  $('form-id').value = '';
  $('form-sku').value = '';
  $('form-name').value = '';
  $('form-category').value = 'Elektronik';
  $('form-price').value = '';
  $('form-stock').value = '1';
  $('form-unit').value = 'Unit';
  $('form-desc').value = '';
  $('err-name').style.display = 'none';
  $('product-modal').style.display = 'flex';
};

window.openEditModal = function(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  editingId = id;
  $('modal-title').textContent = 'Edit Data Produk';
  $('modal-subtitle').textContent = 'Perbarui rincian produk di bawah ini';
  $('btn-submit-modal').textContent = 'Simpan Perubahan';
  $('form-id').value = p.id;
  $('form-sku').value = p.sku;
  $('form-name').value = p.name;
  $('form-category').value = p.category;
  $('form-price').value = p.price;
  $('form-stock').value = p.stock;
  $('form-unit').value = p.unit;
  $('form-desc').value = p.description || '';
  $('err-name').style.display = 'none';
  $('product-modal').style.display = 'flex';
};

window.deleteProduct = async function(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const ok = await tiny.dialog.confirm(`Apakah Anda yakin ingin menghapus "${p.name}"?`, {
    detail: 'Tindakan ini akan menghapus data secara permanen dari file inventaris.',
    ok: 'Ya, Hapus',
    cancel: 'Batal',
  });

  if (ok) {
    products = products.filter(x => x.id !== id);
    await persistData();
    render();
    showToast(`Produk "${p.name}" berhasil dihapus.`, 'info');
  }
};

// Form submission (Create / Edit)
$('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('form-name').value.trim();
  if (!name) {
    $('err-name').style.display = 'block';
    return;
  }

  const sku = $('form-sku').value.trim() || `PRD-${Math.floor(100 + Math.random() * 900)}`;
  const category = $('form-category').value;
  const price = Number($('form-price').value) || 0;
  const stock = Number($('form-stock').value) || 0;
  const unit = $('form-unit').value.trim() || 'Unit';
  const description = $('form-desc').value.trim();
  const status = determineStatus(stock);
  const now = new Date().toISOString();

  if (editingId) {
    // Update
    const idx = products.findIndex(p => p.id === editingId);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        sku: sku.toUpperCase(),
        name,
        category,
        price,
        stock,
        unit,
        status,
        description,
        updatedAt: now,
      };
      showToast(`Produk "${name}" berhasil diperbarui!`, 'success');
    }
  } else {
    // Create
    const newProduct = {
      id: `PRD-${Date.now()}`,
      sku: sku.toUpperCase(),
      name,
      category,
      price,
      stock,
      unit,
      status,
      description,
      createdAt: now,
      updatedAt: now,
    };
    products.unshift(newProduct);
    showToast(`Produk "${name}" berhasil ditambahkan!`, 'success');
  }

  $('product-modal').style.display = 'none';
  await persistData();
  updateCategoryDropdown();
  render();
});

// Modal close
$('btn-close-modal').addEventListener('click', () => { $('product-modal').style.display = 'none'; });
$('btn-cancel-modal').addEventListener('click', () => { $('product-modal').style.display = 'none'; });
$('btn-add-product').addEventListener('click', openCreateModal);

// Native Dialogs: Export CSV
$('btn-export-csv').addEventListener('click', async () => {
  try {
    const savePath = await tiny.dialog.saveFile({
      name: 'laporan-produk.csv',
      types: ['csv'],
    });
    if (!savePath) return;

    const headers = ['ID', 'SKU', 'Nama Produk', 'Kategori', 'Harga', 'Stok', 'Satuan', 'Status', 'Deskripsi'];
    const rows = products.map(p => [
      `"${p.id}"`, `"${p.sku}"`, `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`, p.price, p.stock, `"${p.unit}"`, `"${p.status}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    await tiny.api.call('writeFile', { path: savePath, content: csvContent });
    await tiny.dialog.alert('Berhasil!', `Laporan CSV berhasil disimpan ke:\n${savePath}`);
  } catch (err) {
    showToast('Gagal mengekspor CSV: ' + err, 'error');
  }
});

// Native Dialogs: Export JSON
$('btn-export-json').addEventListener('click', async () => {
  try {
    const savePath = await tiny.dialog.saveFile({
      name: 'backup-produk.json',
      types: ['json'],
    });
    if (!savePath) return;

    const jsonStr = JSON.stringify(products, null, 2);
    await tiny.api.call('writeFile', { path: savePath, content: jsonStr });
    await tiny.dialog.alert('Berhasil!', `Cadangan JSON berhasil disimpan ke:\n${savePath}`);
  } catch (err) {
    showToast('Gagal mencadangkan JSON: ' + err, 'error');
  }
});

// Native Dialogs: Import JSON
$('btn-import-json').addEventListener('click', async () => {
  try {
    const openPath = await tiny.dialog.openFile({ types: ['json'] });
    if (!openPath) return;

    const raw = await tiny.api.call('readFile', { path: openPath });
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      await tiny.dialog.alert('Gagal', 'Berkas JSON harus berupa array data produk.');
      return;
    }

    products = parsed;
    await persistData();
    updateCategoryDropdown();
    render();
    showToast(`Berhasil mengimpor ${products.length} data produk!`, 'success');
  } catch (err) {
    showToast('Gagal mengimpor JSON: ' + err, 'error');
  }
});

// Reset Sample Data
$('btn-reset').addEventListener('click', async () => {
  const ok = await tiny.dialog.confirm('Kembalikan ke data sampel?', {
    detail: 'Seluruh data saat ini akan digantikan dengan 8 data contoh bawaan.',
    ok: 'Ya, Reset',
    cancel: 'Batal',
  });
  if (ok) {
    products = await tiny.api.call('resetProducts');
    updateCategoryDropdown();
    render();
    showToast('Data berhasil direset ke sampel awal.', 'info');
  }
});

// Filter & Search events
$('search-input').addEventListener('input', (e) => {
  filter.search = e.target.value;
  $('btn-clear-search').style.display = filter.search ? 'inline' : 'none';
  render();
});
$('btn-clear-search').addEventListener('click', () => {
  $('search-input').value = '';
  filter.search = '';
  $('btn-clear-search').style.display = 'none';
  render();
});

$('filter-category').addEventListener('change', (e) => {
  filter.category = e.target.value;
  render();
});

document.querySelectorAll('.status-pills .pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.status-pills .pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filter.status = btn.dataset.status;
    render();
  });
});

$('sort-select').addEventListener('change', (e) => {
  const [f, o] = e.target.value.split(':');
  filter.sortField = f;
  filter.sortOrder = o;
  render();
});

// View switchers
$('btn-view-table').addEventListener('click', () => {
  viewMode = 'table';
  $('btn-view-table').classList.add('active');
  $('btn-view-grid').classList.remove('active');
  render();
});
$('btn-view-grid').addEventListener('click', () => {
  viewMode = 'grid';
  $('btn-view-grid').classList.add('active');
  $('btn-view-table').classList.remove('active');
  render();
});

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
    e.preventDefault();
    openCreateModal();
  }
  if (e.key === 'Escape') {
    $('product-modal').style.display = 'none';
  }
});

// Start app
loadData();

