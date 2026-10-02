import { OwnerConfig, Product } from '../types';
import { 
  saveOwnerConfigToCloud, 
  fetchOwnerConfigFromCloud, 
  saveSupplierProductsToCloud, 
  fetchSupplierProductsFromCloud 
} from './firebase';

export const OWNER_PASSWORD = 'riverplate2003';

export const DEFAULT_OWNER_CONFIG: OwnerConfig = {
  supplierUrl: '',
  lastSyncTime: null,
  syncIntervalMinutes: 60, // 1 hour sync
  hiddenProductIds: [],
  hiddenCategories: [],
  autoHideOutOfStock: true, // Auto-hide out of stock products by default
};

const STORAGE_KEYS = {
  CONFIG: 'fullstock_owner_config_v2',
  PRODUCTS: 'fullstock_supplier_products_v2',
  SESSION: 'fullstock_owner_session_v2',
};

export function verifyOwnerPassword(password: string): boolean {
  return password.trim() === OWNER_PASSWORD;
}

export function isOwnerSessionActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(STORAGE_KEYS.SESSION) === 'active_owner';
  } catch {
    return false;
  }
}

export function setOwnerSessionActive(active: boolean) {
  if (typeof window === 'undefined') return;
  try {
    if (active) {
      sessionStorage.setItem(STORAGE_KEYS.SESSION, 'active_owner');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  } catch {
    // Ignore quota errors
  }
}

export function getLocalStoredOwnerConfig(): OwnerConfig {
  if (typeof window === 'undefined') return DEFAULT_OWNER_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        supplierUrl: parsed.supplierUrl || '',
        lastSyncTime: parsed.lastSyncTime || null,
        syncIntervalMinutes: typeof parsed.syncIntervalMinutes === 'number' ? parsed.syncIntervalMinutes : 60,
        hiddenProductIds: Array.isArray(parsed.hiddenProductIds) ? parsed.hiddenProductIds : [],
        hiddenCategories: Array.isArray(parsed.hiddenCategories) ? parsed.hiddenCategories : [],
        autoHideOutOfStock: typeof parsed.autoHideOutOfStock === 'boolean' ? parsed.autoHideOutOfStock : true,
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_OWNER_CONFIG;
}

export function saveLocalStoredOwnerConfig(config: OwnerConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch {
    // Ignore
  }
}

export function getLocalStoredSupplierProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveLocalStoredSupplierProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    try {
      // Quota exceeded protection: save lightweight version
      const lightweight = products.slice(0, 500).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        image: p.image,
        images: p.images ? p.images.slice(0, 3) : [p.image],
        inStock: p.inStock,
        stockCount: p.stockCount,
        sku: p.sku,
        description: p.description ? p.description.slice(0, 100) : '',
        rating: p.rating || 4.9,
        reviewsCount: p.reviewsCount || 10,
        tags: p.tags || ['Proveedor'],
      }));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(lightweight));
    } catch {
      // In-memory fallback
    }
  }
}

/**
 * Loads supplier products from server API cache
 */
export async function fetchSupplierProductsFromServer(): Promise<Product[]> {
  try {
    const res = await fetch('/api/supplier/products');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        saveLocalStoredSupplierProducts(data.products);
        return data.products;
      }
    }
  } catch (err) {
    console.warn('Could not fetch supplier products from server API:', err);
  }
  return [];
}

/**
 * Initializes and synchronizes owner config with Firestore + LocalStorage
 */
export async function initializeOwnerConfig(): Promise<OwnerConfig> {
  const local = getLocalStoredOwnerConfig();
  try {
    const cloud = await fetchOwnerConfigFromCloud();
    if (cloud) {
      saveLocalStoredOwnerConfig(cloud);
      return cloud;
    }
  } catch {
    // Ignore
  }
  return local;
}

/**
 * Saves owner config to both Cloud and Local storage
 */
export async function persistOwnerConfig(config: OwnerConfig): Promise<void> {
  saveLocalStoredOwnerConfig(config);
  await saveOwnerConfigToCloud(config);

  // Inform backend of updated config so background scheduler runs
  try {
    await fetch('/api/supplier/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
  } catch {
    // Backend will receive it on next poll
  }
}

/**
 * Triggers scraping / sync of supplier products via server API
 */
export async function syncSupplierProducts(url: string): Promise<{ success: boolean; products: Product[]; message: string }> {
  if (!url || !url.trim()) {
    return { success: false, products: [], message: 'Por favor ingresa una URL válida de proveedor.' };
  }

  try {
    const response = await fetch('/api/supplier/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error del servidor (${response.status})`);
    }

    const data = await response.json();
    const products: Product[] = Array.isArray(data.products) ? data.products : [];

    // Save locally and to cloud
    saveLocalStoredSupplierProducts(products);
    saveSupplierProductsToCloud(products).catch(() => {});

    // Update config lastSyncTime
    const currentConfig = getLocalStoredOwnerConfig();
    const updatedConfig: OwnerConfig = {
      ...currentConfig,
      supplierUrl: url.trim(),
      lastSyncTime: data.lastSyncTime || new Date().toISOString(),
    };
    saveLocalStoredOwnerConfig(updatedConfig);
    saveOwnerConfigToCloud(updatedConfig).catch(() => {});

    return {
      success: true,
      products,
      message: `¡Sincronización exitosa! Se importaron ${products.length} productos con fotos, precios y stock.`,
    };
  } catch (error: any) {
    console.error('Error syncing supplier products:', error);
    return {
      success: false,
      products: [],
      message: error?.message || 'Error al conectar con la página del proveedor.',
    };
  }
}
