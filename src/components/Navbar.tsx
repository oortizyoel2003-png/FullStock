import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  X, 
  ArrowRight,
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { PWAInstallButton } from './PWAInstallButton';
import { TopTrustBar } from './TrustBanner';
import { fuzzySearchProducts } from '../utils/fuzzySearch';

interface NavbarProps {
  activeCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  products?: Product[];
  onQuickViewProduct?: (product: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  cartCount,
  cartTotal,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  searchQuery,
  onSearchChange,
  products = [],
  onQuickViewProduct,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const desktopSearchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  const categories: ProductCategory[] = [
    'Todos',
    'Bazar',
    'Regalería',
    'Hogar & Deco',
    'Cristalería & Bar',
    'Mesa & Cocina'
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopSearchContainerRef.current && 
        !desktopSearchContainerRef.current.contains(e.target as Node) &&
        mobileSearchContainerRef.current && 
        !mobileSearchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products using fuzzy search algorithm (handles typos like "wiski", "difusos", "vajila")
  const matchingProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    return fuzzySearchProducts(products.filter(p => p.price >= 2000), searchQuery).slice(0, 5);
  }, [products, searchQuery]);

  const handleSelectLiveProduct = (prod: Product) => {
    setIsDropdownOpen(false);
    setSearchOpen(false);
    if (onQuickViewProduct) {
      onQuickViewProduct(prod);
    }
  };

  const handleSearchSubmit = (term: string) => {
    onSearchChange(term);
    setIsDropdownOpen(false);
    setSearchOpen(false);
  };

  const renderSearchDropdown = () => {
    if (!isDropdownOpen) return null;

    const trimmed = searchQuery.trim();
    if (!trimmed) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0f17] border border-[#d4af37]/45 rounded-2xl shadow-2xl shadow-black/90 backdrop-blur-xl overflow-hidden z-50 animate-fadeIn">
        <div className="p-3 space-y-3">
          {/* Matching Products Live Preview List */}
          {matchingProducts.length > 0 ? (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] px-1 flex items-center justify-between">
                <span>Resultados ({matchingProducts.length}):</span>
              </div>

              <div className="space-y-1.5">
                {matchingProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectLiveProduct(product)}
                    className="group/item bg-[#12141e] hover:bg-[#181b28] border border-[#202436] hover:border-[#d4af37]/60 rounded-xl p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#262b3d] bg-black">
                        <ImageWithSkeleton
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                        />
                      </div>

                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-[#d4af37] tracking-wider block">
                          {product.category}
                        </span>
                        <h5 className="text-xs font-serif-luxury font-bold text-white group-hover/item:text-[#f7e7a9] transition-colors truncate">
                          {product.name}
                        </h5>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-serif-luxury font-bold text-gold-gradient">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View all search matches in catalog footer */}
              <div className="pt-2 border-t border-[#1d2232] text-center">
                <button
                  type="button"
                  onClick={() => handleSearchSubmit(searchQuery)}
                  className="w-full py-2 bg-[#171a26] hover:bg-gold-gradient text-[#f7e7a9] hover:text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Ver todos los resultados para "{searchQuery}"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* No matching products */
            <div className="py-6 px-4 text-center space-y-2">
              <Search className="w-7 h-7 text-[#d4af37]/60 mx-auto" />
              <h5 className="text-xs font-bold text-white">No encontramos resultados para "{searchQuery}"</h5>
              <p className="text-[11px] text-[#8e95ab]">
                Intentá con otra palabra clave como plato, copa, termo, taza o mate.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090a0e]/95 backdrop-blur-md border-b border-[#d4af37]/20 transition-all">
      {/* Top Banner de Confianza */}
      <TopTrustBar />

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => {
              onSelectCategory('Todos');
              onSearchChange('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
          >
            {/* Crest Emblem */}
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-[#d4af37] via-[#aa820a] to-[#2a2004] p-0.5 shadow-lg shadow-[#d4af37]/20 group-hover:shadow-[#d4af37]/40 transition-all duration-300 shrink-0">
              <div className="w-full h-full bg-[#0a0b0e] rounded-[6px] sm:rounded-[7px] flex items-center justify-center">
                <span className="font-serif-luxury font-black text-base sm:text-xl text-[#f5e3a9] tracking-tighter">FS</span>
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-serif-luxury tracking-[0.16em] sm:tracking-[0.25em] text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f7e4a6] to-[#d4af37] leading-none">
                FULLSTOCK
              </span>
              <span className="text-[8px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.22em] text-[#9ba1b5] uppercase font-medium mt-0.5 truncate">
                Bazar • Regalería • Hogar
              </span>
            </div>
          </div>

          {/* Desktop Smart Search Bar with Autocomplete */}
          <div ref={desktopSearchContainerRef} className="hidden lg:flex flex-1 max-w-lg mx-6 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(searchQuery);
                  }
                  if (e.key === 'Escape') {
                    setIsDropdownOpen(false);
                  }
                }}
                placeholder="Buscar por artículo, porcelana, cristal, fragancias..."
                className="w-full bg-[#12141d] border border-[#d4af37]/25 focus:border-[#d4af37] text-sm text-[#e6e8ee] placeholder-[#6b7280] rounded-full py-2.5 pl-11 pr-10 outline-none transition-all duration-300 focus:ring-2 focus:ring-[#d4af37]/20 focus:bg-[#161924]"
              />
              <Search className="w-4 h-4 text-[#d4af37] absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    setIsDropdownOpen(false);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#d4af37] transition-colors cursor-pointer"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown with live preview */}
            {renderSearchDropdown()}
          </div>

          {/* User Action Center */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Mobile search button */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                setIsDropdownOpen(true);
              }}
              className="lg:hidden p-2 rounded-full text-[#c7cbd9] hover:text-[#d4af37] hover:bg-[#161822] transition-colors cursor-pointer"
              aria-label="Buscar productos"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 rounded-full text-[#c7cbd9] hover:text-[#d4af37] hover:bg-[#161822] transition-colors cursor-pointer group"
              aria-label="Ver lista de deseos"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-[#c23b38] text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center border border-[#090a0e]">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button with Total */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-gradient-to-r from-[#1c1708] to-[#2b2108] hover:from-[#2e240a] hover:to-[#42330e] border border-[#d4af37]/40 hover:border-[#d4af37] text-[#f7e7a9] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full transition-all duration-150 shadow-md shadow-[#d4af37]/10 cursor-pointer group active:scale-95"
              aria-label="Abrir carrito"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span key={cartCount} className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#e5c358] to-[#b89122] text-[#000] text-[9px] sm:text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-[#1c1708] animate-cartBump">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] uppercase tracking-wider text-[#a89872]">Mi Carrito</span>
                <span className="text-xs font-bold text-[#fff]">{formatCurrency(cartTotal)}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay with Live Preview Dropdown */}
        {searchOpen && (
          <div ref={mobileSearchContainerRef} className="lg:hidden pb-3 pt-1 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit(searchQuery);
                }}
                placeholder="Buscar por artículo o categoría..."
                className="w-full bg-[#12141d] border border-[#d4af37]/35 text-xs sm:text-sm text-[#e6e8ee] placeholder-[#6b7280] rounded-xl py-2 pl-9 pr-9 outline-none"
                autoFocus
              />
              <Search className="w-4 h-4 text-[#d4af37] absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    setIsDropdownOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile dropdown */}
            {renderSearchDropdown()}
          </div>
        )}

        {/* Category Navigation Bar (Desktop) */}
        <nav className="hidden lg:flex items-center justify-center gap-1 py-2 border-t border-[#d4af37]/10 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`relative px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer rounded-full ${
                  isActive
                    ? 'text-[#0a0b0e] bg-gradient-to-r from-[#f0d479] via-[#d4af37] to-[#b89122] font-bold shadow-md shadow-[#d4af37]/20'
                    : 'text-[#bcc1d1] hover:text-[#f7e7a9] hover:bg-[#151722]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
