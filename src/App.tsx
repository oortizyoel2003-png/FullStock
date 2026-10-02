/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductGridSkeleton } from './components/ProductCardSkeleton';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Footer } from './components/Footer';
import { OwnerModal } from './components/OwnerModal';

import { 
  CartItem, 
  FilterState, 
  OrderReceipt, 
  Product, 
  ProductCategory,
  OwnerConfig
} from './types';
import { 
  getStoredCart, 
  getStoredWishlist, 
  saveStoredWishlist, 
  getStoredOrders, 
  saveStoredOrder,
  getStoredProducts
} from './utils/storage';
import { 
  initializeOwnerConfig,
  getLocalStoredOwnerConfig,
  getLocalStoredSupplierProducts,
  fetchSupplierProductsFromServer,
  syncSupplierProducts,
  isOwnerSessionActive
} from './utils/supplierSync';
import { 
  subscribeToCartSync,
  syncCartState
} from './utils/cartSync';
import { 
  fuzzySearchProducts 
} from './utils/fuzzySearch';
import { 
  Sparkles, 
  Search,
  ChevronDown,
  Layers,
  ShieldCheck
} from 'lucide-react';

const ITEMS_PER_PAGE = 24;

export default function App() {
  // Store products catalog: combines default luxury catalog with any synced supplier products
  const [products, setProducts] = useState<Product[]>(() => {
    const base = getStoredProducts();
    const supplierProds = getLocalStoredSupplierProducts();
    if (supplierProds && supplierProds.length > 0) {
      const map = new Map<string, Product>();
      supplierProds.forEach(p => map.set(p.id, p));
      base.forEach(p => {
        if (!map.has(p.id)) map.set(p.id, p);
      });
      return Array.from(map.values());
    }
    return base;
  });

  // Owner Configuration State
  const [ownerConfig, setOwnerConfig] = useState<OwnerConfig>(() => getLocalStoredOwnerConfig());
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

  // Background Hourly Supplier Auto-Sync (1 hour = 3600000ms)
  useEffect(() => {
    // 0. Load any cached products from the server immediately
    fetchSupplierProductsFromServer().then(serverProds => {
      if (serverProds && serverProds.length > 0) {
        setProducts(prev => {
          const map = new Map<string, Product>();
          serverProds.forEach(p => map.set(p.id, p));
          prev.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
          return Array.from(map.values());
        });
      }
    });

    // 1. Fetch cloud owner settings on mount
    initializeOwnerConfig().then(cloudConfig => {
      setOwnerConfig(cloudConfig);
      
      // If supplier URL is configured and last sync is older than 1 hour or never synced, run sync
      if (cloudConfig.supplierUrl) {
        const lastSync = cloudConfig.lastSyncTime ? new Date(cloudConfig.lastSyncTime).getTime() : 0;
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        if (!cloudConfig.lastSyncTime || lastSync < oneHourAgo) {
          syncSupplierProducts(cloudConfig.supplierUrl).then(res => {
            if (res.success && res.products.length > 0) {
              setProducts(prev => {
                const map = new Map<string, Product>();
                res.products.forEach(p => map.set(p.id, p));
                prev.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
                return Array.from(map.values());
              });
            }
          });
        }
      }
    });

    // 2. Setup recurring 1-hour interval for automatic background sync
    const ONE_HOUR = 60 * 60 * 1000;
    const interval = setInterval(() => {
      const current = getLocalStoredOwnerConfig();
      if (current.supplierUrl) {
        syncSupplierProducts(current.supplierUrl).then(res => {
          if (res.success && res.products.length > 0) {
            setProducts(prev => {
              const map = new Map<string, Product>();
              res.products.forEach(p => map.set(p.id, p));
              prev.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
              return Array.from(map.values());
            });
          }
        });
      }
    }, ONE_HOUR);

    return () => clearInterval(interval);
  }, []);

  // Dynamic Categories from available products (respects owner hidden categories & out-of-stock hiding)
  const availableCategories = useMemo(() => {
    const catSet = new Set<string>(['Todos']);
    products.forEach(p => {
      // Auto-hide products under 2000 ARS
      if (p.price < 2000) return;
      // Respect hidden categories
      if (ownerConfig.hiddenCategories.includes(p.category)) return;
      // Respect out-of-stock hiding
      if (ownerConfig.autoHideOutOfStock && (!p.inStock || (p.stockCount !== undefined && p.stockCount <= 0))) return;

      if (p.category && typeof p.category === 'string' && p.category.trim()) {
        catSet.add(p.category.trim());
      }
    });
    if (catSet.size === 1) {
      ['Bazar', 'Regalería', 'Hogar & Deco', 'Cristalería & Bar', 'Mesa & Cocina']
        .filter(c => !ownerConfig.hiddenCategories.includes(c))
        .forEach(c => catSet.add(c));
    }
    return Array.from(catSet);
  }, [products, ownerConfig.hiddenCategories, ownerConfig.autoHideOutOfStock]);

  // Filter State
  const [filter, setFilter] = useState<FilterState>({
    category: 'Todos',
    minPrice: 0,
    maxPrice: 150000,
    searchQuery: '',
    sortBy: 'featured',
    inStockOnly: false,
  });

  // Batch Pagination State
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isGridLoading, setIsGridLoading] = useState(false);

  // Reset page & show progressive grid skeleton when any filter changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    setIsGridLoading(true);
    const timer = setTimeout(() => {
      setIsGridLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [filter.category, filter.searchQuery, filter.sortBy, filter.inStockOnly, filter.maxPrice]);

  // Cart State with Cloud Sync & Cross-Tab Storage Persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getStoredCart());

  // Wishlist State with LocalStorage Persistence
  const [wishlist, setWishlist] = useState<Product[]>(() => getStoredWishlist());

  // Completed Orders with LocalStorage Persistence
  const [orders, setOrders] = useState<OrderReceipt[]>(() => getStoredOrders());

  // UI Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Toast Notification (Quiet on mobile screens to prevent WhatsApp button overlap)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    // Only display toasts on desktop / large viewports
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setToastMessage(msg);
      setTimeout(() => {
        setToastMessage(null);
      }, 2500);
    }
  };

  // Sync cart changes across tabs & local storage
  useEffect(() => {
    syncCartState(cartItems);
  }, [cartItems]);

  useEffect(() => {
    const unsubscribe = subscribeToCartSync((newCart) => {
      setCartItems(newCart);
    });
    return unsubscribe;
  }, []);

  // Sync Wishlist to LocalStorage
  useEffect(() => {
    saveStoredWishlist(wishlist);
  }, [wishlist]);

  // Inject Schema.org JSON-LD for Google Shopping SEO
  useEffect(() => {
    const existingScript = document.getElementById('schema-jsonld');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'schema-jsonld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Store',
        'name': 'FullStock - Bazar, Regalería y Hogar Premium',
        'description': 'Tienda boutique exclusiva de artículos de bazar, regalería y decoración con acabados en dorado y negro.',
        'url': typeof window !== 'undefined' ? window.location.origin : 'https://fullstock.com',
        'priceRange': '$$$',
        'currenciesAccepted': 'ARS',
        'paymentAccepted': 'Cash, Bank Transfer',
        'hasOfferCatalog': {
          '@type': 'OfferCatalog',
          'name': 'Catálogo FullStock',
          'itemListElement': products.slice(0, 10).map((p, idx) => ({
            '@type': 'OfferCatalog',
            'position': idx + 1,
            'itemOffered': {
              '@type': 'Product',
              'name': p.name,
              'description': p.description,
              'sku': p.sku,
              'offers': {
                '@type': 'Offer',
                'price': p.price,
                'priceCurrency': 'ARS',
                'availability': p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
              }
            }
          }))
        }
      });
      document.head.appendChild(script);
    }
  }, [products]);

  // Cart Handlers
  const handleAddToCart = (
    product: Product, 
    quantity = 1, 
    giftWrap = false, 
    giftMessage = ''
  ) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, giftWrap, giftMessage }
            : item
        );
      }
      return [...prev, { product, quantity, giftWrap, giftMessage }];
    });
    showToast(`¡"${product.name}" añadido al carrito!`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    showToast('Producto eliminado del carrito');
  };

  // Wishlist Handlers
  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        showToast('Eliminado de favoritos');
        return prev.filter(p => p.id !== product.id);
      } else {
        showToast('¡Guardado en tus favoritos!');
        return [...prev, product];
      }
    });
  };

  const handleMoveWishlistToCart = (product: Product) => {
    handleAddToCart(product, 1);
    setWishlist(prev => prev.filter(p => p.id !== product.id));
  };

  // Checkout Handlers
  const handleOrderCompleted = (receipt: OrderReceipt) => {
    const updatedOrders = saveStoredOrder(receipt);
    setOrders(updatedOrders);
    setCartItems([]);
    showToast(`¡Orden #${receipt.orderId} confirmada con éxito!`);
  };

  // Filtered and Sorted Products with Fuzzy Search and Owner Visibility Rules
  const filteredProducts = useMemo(() => {
    // 1. Initial Filtering
    let list = products.filter(product => {
      // Automatic Rule: Hide any product with price under $2,000 ARS
      if (product.price < 2000) {
        return false;
      }

      // Owner Rule 1: Auto-hide out of stock products
      if (ownerConfig.autoHideOutOfStock && (!product.inStock || (product.stockCount !== undefined && product.stockCount <= 0))) {
        return false;
      }

      // Owner Rule 2: Hidden category
      if (ownerConfig.hiddenCategories.includes(product.category)) {
        return false;
      }

      // Owner Rule 3: Hidden individual product
      if (ownerConfig.hiddenProductIds.includes(product.id)) {
        return false;
      }

      // Category Filter
      if (filter.category !== 'Todos' && product.category !== filter.category) {
        return false;
      }

      // Price Filter
      if (product.price > filter.maxPrice) {
        return false;
      }

      // In Stock Filter
      if (filter.inStockOnly && !product.inStock) {
        return false;
      }

      // Tag Filter
      if (filter.selectedTag && !product.tags.includes(filter.selectedTag)) {
        return false;
      }

      return true;
    });

    // 2. Fuzzy Search Query Filter with Typo Tolerance
    if (filter.searchQuery.trim()) {
      list = fuzzySearchProducts(list, filter.searchQuery);
    } else {
      // 3. Sorting
      list = list.sort((a, b) => {
        if (filter.sortBy === 'price-asc') return a.price - b.price;
        if (filter.sortBy === 'price-desc') return b.price - a.price;
        if (filter.sortBy === 'rating') return b.rating - a.rating;
        // Default: Featured first, then rating
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.rating - a.rating;
      });
    }

    return list;
  }, [products, filter, ownerConfig]);

  // Paginated visible products for high performance
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMoreProducts = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 280);
  };

  const handleCategorySelectFromNavbar = (cat: ProductCategory) => {
    setFilter(prev => ({ ...prev, category: cat, searchQuery: '' }));
    scrollToCatalog();
  };

  const handleSearchFromNavbar = (query: string) => {
    setFilter(prev => ({ ...prev, searchQuery: query }));
    if (query.trim()) {
      scrollToCatalog();
    }
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalogo-fullstock');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-[#e0e4f0] flex flex-col font-sans selection:bg-[#d4af37] selection:text-black">
      
      {/* Offline Status Network Warning */}
      <OfflineIndicator />

      {/* Toast Floating Notification (Desktop only) */}
      {toastMessage && (
        <div className="hidden md:flex fixed bottom-6 right-6 z-50 bg-[#121520] border border-[#d4af37] text-white px-4 py-3 rounded-2xl shadow-2xl shadow-black/80 items-center gap-3 animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
          <span className="text-xs font-semibold text-[#f5e3a9]">{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        cartTotal={cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)}
        wishlistCount={wishlist.length}
        activeCategory={filter.category}
        onSelectCategory={handleCategorySelectFromNavbar}
        searchQuery={filter.searchQuery}
        onSearchChange={handleSearchFromNavbar}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        products={products}
        onQuickViewProduct={(p) => setQuickViewProduct(p)}
      />

      {/* Hero Showcase */}
      <Hero onExploreClick={scrollToCatalog} />

      {/* Main Product Catalog Section */}
      <main id="catalogo-fullstock" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-serif-luxury font-black text-white">
            {filter.category === 'Todos' ? 'Catálogo Exclusivo' : `Selección: ${filter.category}`}
          </h2>
        </div>

        {/* Filter Bar with Categories & Controls */}
        <CategoryFilterBar
          filter={filter}
          onFilterChange={setFilter}
          totalProductsCount={products.length}
          filteredCount={filteredProducts.length}
          availableCategories={availableCategories}
        />

        {/* Products Grid with Progressive Skeleton Screens */}
        {isGridLoading ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length > 0 ? (
          <div className="space-y-10">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {paginatedProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isBestseller={index === 0}
                  onAddToCart={(prod) => handleAddToCart(prod, 1)}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                  isWishlisted={wishlist.some(p => p.id === product.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>

            {/* Load More Pagination Bar */}
            <div className="pt-4 flex flex-col items-center justify-center space-y-3">
              {/* Progress Count */}
              <div className="text-xs text-[#8e95ab] flex items-center gap-2">
                <span>Mostrando <strong>{paginatedProducts.length}</strong> de <strong>{filteredProducts.length}</strong> piezas</span>
              </div>

              {/* Progress bar line */}
              <div className="w-48 sm:w-64 h-1.5 bg-[#171a26] rounded-full overflow-hidden border border-[#232738]">
                <div 
                  className="h-full bg-gold-gradient transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (paginatedProducts.length / filteredProducts.length) * 100)}%` }}
                />
              </div>

              {/* Load More CTA */}
              {hasMoreProducts ? (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="mt-2 px-8 py-3.5 rounded-2xl bg-[#141724] hover:bg-gold-gradient text-[#f7e7a9] hover:text-black border border-[#d4af37]/40 hover:border-[#d4af37] text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xl shadow-black/60 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                      <span>Cargando Piezas...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      <span>Cargar Más Piezas Exclusivas</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                filteredProducts.length > ITEMS_PER_PAGE && (
                  <div className="text-[11px] text-[#788095] flex items-center gap-1.5 pt-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Has explorado todas las piezas de esta colección</span>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#10121b] border border-[#23283a] rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#181a26] border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37]">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-white">
              No encontramos coincidencias
            </h3>
            <p className="text-xs text-[#8c94aa]">
              No hay productos que coincidan con tus filtros actuales o término de búsqueda "{filter.searchQuery}".
            </p>
            <button
              onClick={() => {
                setFilter({
                  category: 'Todos',
                  minPrice: 0,
                  maxPrice: 150000,
                  searchQuery: '',
                  sortBy: 'featured',
                  inStockOnly: false,
                });
              }}
              className="px-6 py-2.5 rounded-xl bg-gold-gradient text-black text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md hover:shadow-[#d4af37]/30 transition-all"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </main>

      {/* Footer with 5-tap owner trigger */}
      <Footer 
        onSelectCategory={handleCategorySelectFromNavbar} 
        onOpenOwnerMode={() => setIsOwnerModalOpen(true)}
      />

      {/* Floating WhatsApp Personal Advisor */}
      <WhatsAppFloat />

      {/* Owner Dashboard Modal */}
      <OwnerModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        products={products}
        ownerConfig={ownerConfig}
        onUpdateOwnerConfig={(cfg) => setOwnerConfig(cfg)}
        onProductsUpdated={(newProducts) => {
          setProducts(prev => {
            const map = new Map<string, Product>();
            newProducts.forEach(p => map.set(p.id, p));
            prev.forEach(p => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            return Array.from(map.values());
          });
          showToast(`¡Catálogo actualizado con ${newProducts.length} piezas del proveedor!`);
        }}
      />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        allProducts={products}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onAddProduct={handleAddToCart}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => {
          setWishlist(prev => prev.filter(p => p.id !== id));
          showToast('Producto quitado de favoritos');
        }}
        onMoveToCart={handleMoveWishlistToCart}
      />

      {/* Secure Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderCompleted={handleOrderCompleted}
      />

    </div>
  );
}
