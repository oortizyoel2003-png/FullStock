export type ProductCategory = 'Todos' | 'Bazar' | 'Regalería' | 'Hogar & Deco' | 'Cristalería & Bar' | 'Mesa & Cocina' | string;

export interface ProductSpecifications {
  material?: string;
  dimensions?: string;
  weight?: string;
  color?: string;
  care?: string;
  origin?: string;
  capacity?: string;
  duration?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  originalPrice?: number;
  discountPct?: number;
  category: string;
  image: string;
  images?: string[];
  additionalImages?: string[];
  gallery?: string[];
  description: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockCount?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  tags: string[];
  sku: string;
  features?: string[];
  specifications?: ProductSpecifications;
  complementaryIds?: string[];
  dimensions?: string;
  material?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  giftWrap?: boolean;
  giftMessage?: string;
}

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  searchQuery: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount';
  inStockOnly: boolean;
  selectedTag?: string;
}

export interface OrderReceipt {
  orderId: string;
  date: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  whatsappMessage?: string;
}

export interface OwnerConfig {
  supplierUrl: string;
  lastSyncTime: string | null;
  syncIntervalMinutes: number;
  hiddenProductIds: string[];
  hiddenCategories: string[];
  autoHideOutOfStock: boolean;
}
