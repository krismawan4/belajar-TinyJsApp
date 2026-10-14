export type StockStatus = 'available' | 'low' | 'out_of_stock';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  status: StockStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
  id?: string;
  status?: StockStatus;
};

export type SortField = 'createdAt' | 'name' | 'price' | 'stock';
export type SortOrder = 'asc' | 'desc';

export interface ProductFilter {
  search: string;
  category: string;
  status: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

export interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface DesktopApi {
  isDesktop: boolean;
  getProducts: () => Promise<Product[]>;
  saveProducts: (products: Product[]) => Promise<boolean>;
  exportData: (content: string, defaultName: string) => Promise<{ success: boolean; filePath?: string }>;
  importData: () => Promise<{ success: boolean; data?: any }>;
  getSystemInfo: () => Promise<{ platform: string; version: string }>;
}

declare global {
  interface Window {
    desktopApi?: DesktopApi;
  }
}

