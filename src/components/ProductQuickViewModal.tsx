import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Check, 
  Minus, 
  Plus, 
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, safeOpenUrl } from '../utils/formatters';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { getCrossSellingRecommendations } from '../utils/recommendations';
import { INITIAL_PRODUCTS } from '../data/products';
import { trackEvent } from '../utils/analytics';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, giftWrap: boolean, giftMessage?: string) => void;
  allProducts?: Product[];
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  allProducts,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
      trackEvent({
        eventName: 'view_product',
        productId: product.id,
        productName: product.name,
        category: product.category,
        price: product.price,
      });
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [product]);

  // Reset states when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setAdded(false);
  }, [product?.id]);

  if (!product) return null;

  // Resolve all images for this product
  const productImages = product.images && product.images.length > 0
    ? product.images
    : product.additionalImages && product.additionalImages.length > 0
    ? [product.image, ...product.additionalImages]
    : [product.image];

  const currentImage = productImages[activeImageIndex] || product.image;

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, false, '');
    setAdded(true);
    trackEvent({
      eventName: 'add_to_cart',
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price * quantity,
    });
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 850);
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `¡Hola FullStock! Quiero consultar por: ${product.name} (Cantidad: ${quantity}) - Total: ${formatCurrency(product.price * quantity)}.\n\n¿Cómo coordinamos la compra y el envío?`
    );
    safeOpenUrl(`https://wa.me/5491148882362?text=${text}`);
  };

  // Cross selling items: up to 3 smart complementary recommendations
  const catalogPool = allProducts && allProducts.length > 0 ? allProducts : INITIAL_PRODUCTS;
  const recommendations = getCrossSellingRecommendations(product, catalogPool, new Set([product.id]), 3);
  const isLowStock = Boolean(product.stockCount && product.stockCount > 0 && product.stockCount <= 8);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog: Single Unified Fluid Scroll Container so images and details scroll naturally together */}
      <div className="relative z-10 w-full max-w-4xl bg-[#0e1017] border border-[#d4af37]/40 rounded-2xl sm:rounded-3xl shadow-2xl shadow-[#d4af37]/15 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto overscroll-contain will-change-transform transform-gpu">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky top-3 right-3 self-end md:absolute md:top-4 md:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#161822]/90 hover:bg-[#d4af37] text-white hover:text-black flex items-center justify-center transition-all cursor-pointer border border-[#d4af37]/30 shadow-lg"
          aria-label="Cerrar ventana"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Left: Multi-Image Gallery Column */}
        <div className="md:w-1/2 bg-[#07080b] p-4 sm:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#d4af37]/20">
          
          {/* Main Display Image */}
          <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-[#d4af37]/30 bg-[#0c0d12]">
            <ImageWithSkeleton
              src={currentImage}
              alt={`${product.name} - Vista ${activeImageIndex + 1}`}
              priority
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Dynamic Low Stock Warning */}
            {isLowStock && (
              <div className="absolute top-3 right-3 z-10 bg-[#7f1d1d]/90 text-red-200 border border-red-500/50 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-sm shadow-lg">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <span>¡Últimas {product.stockCount} unidades!</span>
              </div>
            )}

            {/* Image Navigation Arrows */}
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-black border border-[#d4af37]/30 flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-black border border-[#d4af37]/30 flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Counter indicator */}
                <div className="absolute bottom-3 right-3 z-10 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-[#f5e3a9] border border-[#d4af37]/30">
                  {activeImageIndex + 1} / {productImages.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Selector Strip */}
          {productImages.length > 1 && (
            <div className="flex items-center gap-2 mt-3 sm:mt-4 w-full justify-center overflow-x-auto pb-1 scrollbar-none">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-13 h-13 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40 scale-105 shadow-md shadow-[#d4af37]/20'
                      : 'border-[#222638] opacity-60 hover:opacity-100 hover:border-[#d4af37]/50'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ángulo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Purchasing Column */}
        <div className="md:w-1/2 p-4 sm:p-7 flex flex-col justify-between">
          <div>
            {/* Category */}
            <div className="mb-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#d4af37]">
                {product.category}
              </span>
            </div>

            {/* Name */}
            <h2 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white mb-3 leading-snug">
              {product.name}
            </h2>

            {/* Price Box */}
            <div className="bg-[#141620] border border-[#d4af37]/25 p-3.5 sm:p-4 rounded-xl mb-4 flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-serif-luxury font-extrabold text-white">
                {formatCurrency(product.price)}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#cbd1e1] leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Cross-Selling Recommendations ("Combina Perfecto Con...") */}
            {recommendations.length > 0 && (
              <div className="mb-4 bg-[#121522] border border-[#d4af37]/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#f5e3a9]">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Combina Perfecto Con:</span>
                </div>
                <div className="space-y-2">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between gap-2 bg-[#0a0c14] border border-[#232738] p-2 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded overflow-hidden bg-black shrink-0 border border-[#222638]">
                          <ImageWithSkeleton src={rec.image} alt={rec.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[11px] font-medium text-white truncate">{rec.name}</h5>
                          <span className="text-[10px] text-gold-gradient font-bold">{formatCurrency(rec.price)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onAddToCart(rec, 1, false)}
                        className="bg-[#1d2234] hover:bg-gold-gradient text-[#f5e3a9] hover:text-black px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer border border-[#d4af37]/40"
                      >
                        + Agregar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="pt-3 border-t border-[#1f2334] space-y-2.5 mt-2">
            <div className="flex items-center gap-3">
              {/* Counter */}
              <div className="flex items-center bg-[#151722] border border-[#d4af37]/30 rounded-xl overflow-hidden shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-[#202434] text-[#d4af37] transition-colors cursor-pointer"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-sm font-bold text-white font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockCount ?? 99, quantity + 1))}
                  className="p-3 hover:bg-[#202434] text-[#d4af37] transition-colors cursor-pointer"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAdd}
                className={`flex-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  added
                    ? 'bg-[#15803d] text-white'
                    : 'bg-gold-gradient hover:bg-gold-gradient-hover text-[#0a0b0e] shadow-[#d4af37]/30'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 text-white" />
                    <span>¡Añadido!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Añadir al Carrito ({formatCurrency(product.price * quantity)})</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct WhatsApp Purchase in 1 click */}
            <button
              onClick={handleWhatsAppInquiry}
              className="w-full py-2.5 rounded-xl border border-[#25d366]/40 hover:bg-[#25d366]/10 text-[#25d366] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Consultar / Pedir por WhatsApp en 1 Clic</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
