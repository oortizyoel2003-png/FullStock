import { CartItem, Product, OrderReceipt } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

const STORAGE_KEYS = {
  CART: 'fullstock_cart_v1',
  WISHLIST: 'fullstock_wishlist_v1',
  ORDERS: 'fullstock_orders_v1',
  PRODUCTS: 'fullstock_products_v1',
};

// Safe JSON parse helper
function safeParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Sanitizes a product object to ensure all required arrays and nested fields exist,
 * preventing runtime TypeErrors when accessing features, specifications, or tags.
 */
export function sanitizeProduct(p: Partial<Product> | null | undefined): Product | null {
  if (!p || typeof p !== 'object' || !p.id || !p.name) return null;

  return {
    id: String(p.id),
    name: String(p.name || 'Producto FullStock'),
    subtitle: String(p.subtitle || ''),
    price: typeof p.price === 'number' && !isNaN(p.price) ? p.price : 0,
    originalPrice: typeof p.originalPrice === 'number' ? p.originalPrice : undefined,
    category: (p.category || 'Bazar') as Product['category'],
    image: String(p.image || ''),
    images: Array.isArray(p.images) ? p.images.filter(Boolean) : (p.image ? [p.image] : []),
    additionalImages: Array.isArray(p.additionalImages) ? p.additionalImages.filter(Boolean) : [],
    description: String(p.description || ''),
    features: Array.isArray(p.features) ? p.features.filter(Boolean) : ['Garantía oficial FullStock', 'Materiales seleccionados'],
    specifications: {
      material: p.specifications?.material || 'Material de Alta Calidad',
      dimensions: p.specifications?.dimensions || 'Medidas Estándar',
      color: p.specifications?.color || 'Exclusivo',
      care: p.specifications?.care || 'Apto uso diario',
    },
    inStock: p.inStock ?? true,
    stockCount: typeof p.stockCount === 'number' ? p.stockCount : 10,
    rating: typeof p.rating === 'number' ? p.rating : 4.9,
    reviewsCount: typeof p.reviewsCount === 'number' ? p.reviewsCount : 12,
    isFeatured: Boolean(p.isFeatured),
    discountPct: typeof p.discountPct === 'number' ? p.discountPct : undefined,
    tags: Array.isArray(p.tags) ? p.tags.filter(Boolean) : ['Exclusivo'],
    sku: String(p.sku || `FS-${p.id}`),
  };
}

// PRODUCTS STORAGE
export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const parsed = safeParse<Product[] | null>(data, null);
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      const sanitized = parsed.map(sanitizeProduct).filter((p): p is Product => p !== null);
      const existingIds = new Set(sanitized.map(p => p.id));
      const missingInitial = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
      return [...sanitized, ...missingInitial];
    }
    return INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to storage:', error);
  }
}

export function resetStoredProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    return INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

// CART STORAGE
export function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CART);
    const parsed = safeParse<CartItem[]>(data, []);
    return parsed
      .map(item => {
        if (!item || !item.product) return null;
        const sanitizedProd = sanitizeProduct(item.product);
        if (!sanitizedProd) return null;
        return {
          ...item,
          product: sanitizedProd,
          quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
        };
      })
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

export function saveStoredCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
}

// WISHLIST STORAGE
export function getStoredWishlist(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    const parsed = safeParse<Product[]>(data, []);
    return parsed
      .map(sanitizeProduct)
      .filter((p): p is Product => p !== null);
  } catch {
    return [];
  }
}

export function saveStoredWishlist(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving wishlist to storage:', error);
  }
}

// ORDERS HISTORY STORAGE
export function getStoredOrders(): OrderReceipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const parsed = safeParse<OrderReceipt[]>(data, []);
    return parsed.filter(o => o && o.orderId && o.total >= 0);
  } catch {
    return [];
  }
}

export function saveStoredOrder(order: OrderReceipt): OrderReceipt[] {
  if (typeof window === 'undefined') return [order];
  try {
    const current = getStoredOrders();
    const updated = [order, ...current.filter(o => o.orderId !== order.orderId)];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving order to storage:', error);
    return [order];
  }
}
