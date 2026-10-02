import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Check,
  Layers,
  Flame,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { trackEvent } from '../utils/analytics';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  isBestseller?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  isWishlisted,
  onToggleWishlist,
  isBestseller = false,
}) => {
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnimation(true);
    trackEvent({
      eventName: 'add_to_cart',
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
    });
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const hasMultipleImages = (product.images && product.images.length > 1) || 
                            (product.additionalImages && product.additionalImages.length > 0);
  const secondaryImage = product.images?.[1] || product.additionalImages?.[0];

  // Dynamic urgency / stock logic
  const isLowStock = Boolean(product.stockCount && product.stockCount > 0 && product.stockCount <= 8);
  const isNewArrival = product.isNew || product.tags?.includes('Novedad') || product.tags?.includes('Nuevo');

  return (
    <div 
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#11131a] rounded-xl sm:rounded-2xl border border-[#d4af37]/20 hover:border-[#d4af37]/65 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-[#d4af37]/10 cursor-pointer will-change-transform transform-gpu"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#0a0b0e]">
        <ImageWithSkeleton
          src={isHovered && secondaryImage ? secondaryImage : product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Dark subtle overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#11131a] via-transparent to-black/30 pointer-events-none"></div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5 z-10">
          {isBestseller && (
            <span className="bg-gradient-to-r from-[#d4af37] via-[#f7e7a9] to-[#d4af37] text-black text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase flex items-center gap-1 shadow-lg shadow-black/80 border border-yellow-200/60">
              <Flame className="w-3 h-3 fill-black text-black" />
              <span>Más Vendido</span>
            </span>
          )}
          {isNewArrival && !isBestseller && (
            <span className="bg-gradient-to-r from-teal-500 to-emerald-600 text-black text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase flex items-center gap-1 shadow-lg shadow-black/80 border border-emerald-300/60">
              <Sparkles className="w-2.5 h-2.5 fill-black text-black" />
              <span>Novedad</span>
            </span>
          )}
        </div>

        {/* Dynamic Stock Urgency Badge */}
        {isLowStock && (
          <div className="absolute bottom-2 left-2 z-10 bg-[#7f1d1d]/90 text-red-200 border border-red-500/50 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 backdrop-blur-sm shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            <span>¡Solo quedan {product.stockCount} en depósito!</span>
          </div>
        )}

        {/* Multi-images indicator badge */}
        {hasMultipleImages && !isLowStock && (
          <div className="absolute bottom-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/75 backdrop-blur-sm border border-[#d4af37]/40 px-2 py-0.5 rounded text-[9px] text-[#f5e3a9] flex items-center gap-1">
            <Layers className="w-2.5 h-2.5 text-[#d4af37]" />
            <span>Fotos</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
            trackEvent({
              eventName: 'toggle_wishlist',
              productId: product.id,
              productName: product.name,
            });
          }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 z-10 backdrop-blur-md cursor-pointer ${
            isWishlisted
              ? 'bg-[#b91c1c] text-white'
              : 'bg-[#0a0b0e]/70 text-[#9ba1b5] hover:text-[#d4af37] hover:bg-[#0a0b0e]'
          }`}
          aria-label={isWishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <div className="mb-1 sm:mb-2 flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#d4af37]">
              {product.category}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif-luxury text-xs sm:text-base font-bold text-white group-hover:text-[#f7e7a9] transition-colors line-clamp-2 leading-snug mb-2 sm:mb-3 min-h-[2rem] sm:min-h-[2.5rem]">
            {product.name}
          </h3>
        </div>

        <div>
          {/* Price section */}
          <div className="pt-1.5 sm:pt-2 border-t border-[#1e2230] mb-2 sm:mb-3">
            <span className="text-sm sm:text-xl font-bold font-serif-luxury text-white">
              {formatCurrency(product.price)}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-md ${
              addedAnimation
                ? 'bg-[#15803d] text-white border border-[#22c55e] scale-105 animate-quickPulse'
                : 'bg-[#181b26] hover:bg-gold-gradient text-[#f5e3a9] hover:text-[#0a0b0e] border border-[#d4af37]/30 hover:border-[#d4af37] active:scale-95'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                <span>¡Agregado!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
