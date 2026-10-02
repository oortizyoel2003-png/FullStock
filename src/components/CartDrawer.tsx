import React, { useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Truck
} from 'lucide-react';
import { CartItem, Product } from '../types';
import { formatCurrency, safeOpenUrl } from '../utils/formatters';
import { INITIAL_PRODUCTS } from '../data/products';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { getCrossSellingRecommendations } from '../utils/recommendations';
import { trackEvent } from '../utils/analytics';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onAddProduct?: (product: Product, quantity?: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onAddProduct,
}) => {
  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const finalTotal = subtotal;

  // Cross-selling recommendations
  const cartProductIds = new Set(items.map((i) => i.product.id));
  const leadProduct = items.length > 0 ? items[0].product : null;
  const recommendations = getCrossSellingRecommendations(leadProduct, INITIAL_PRODUCTS, cartProductIds, 3);

  const handleAddRecommended = (product: Product) => {
    trackEvent({
      eventName: 'add_to_cart',
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
    });
    if (onAddProduct) {
      onAddProduct(product, 1);
    } else {
      onUpdateQuantity(product.id, 1);
    }
  };

  const handleWhatsAppBuyCart = () => {
    if (items.length === 0) return;
    const itemsFormatted = items
      .map((item, index) => `${index + 1}. ${item.product.name} (Cantidad: ${item.quantity}) - ${formatCurrency(item.product.price * item.quantity)}`)
      .join('\n');

    const message = `👑 *PEDIDO FULLSTOCK* 👑\n\n` +
      `¡Hola! Quiero solicitar los siguientes productos:\n\n${itemsFormatted}\n\n` +
      `*Total:* ${formatCurrency(finalTotal)}\n\n` +
      `¿Cómo coordinamos el pago y el envío?`;

    trackEvent({
      eventName: 'begin_checkout',
      totalValue: finalTotal,
      itemCount: items.length,
    });

    safeOpenUrl(`https://wa.me/5491138402919?text=${encodeURIComponent(message)}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:w-screen max-w-md bg-[#0d0e14] border-l border-[#d4af37]/30 shadow-2xl flex flex-col justify-between h-full will-change-transform transform-gpu">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#d4af37]/20 flex items-center justify-between bg-[#11131b]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div>
                <h3 className="font-serif-luxury font-bold text-white text-base">
                  Bolsa de Compras
                </h3>
                <span className="text-[11px] text-[#8e95ab]">
                  {items.reduce((c, i) => c + i.quantity, 0)} artículos seleccionados
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#1a1d28] text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar bolsa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List & Cross-selling (Single fluid scroll container) */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#151722] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif-luxury text-lg font-bold text-white">Tu carrito está vacío</h4>
                <p className="text-xs text-[#8c94aa] max-w-xs">
                  Explora nuestras colecciones exclusivas de bazar, regalería y objetos para el hogar.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-gold-gradient text-[#0a0b0e] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md hover:shadow-[#d4af37]/30 transition-all"
                >
                  Ver Catálogo Ahora
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div 
                      key={item.product.id}
                      className="bg-[#12141d] border border-[#d4af37]/20 rounded-xl p-3 flex gap-3.5 relative group hover:border-[#d4af37]/50 transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="w-18 h-18 rounded-lg overflow-hidden bg-[#090a0e] shrink-0 border border-[#272b3b]">
                        <ImageWithSkeleton 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-serif-luxury text-xs font-bold text-white line-clamp-1">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => {
                                onRemoveItem(item.product.id);
                                trackEvent({
                                  eventName: 'remove_from_cart',
                                  productId: item.product.id,
                                  productName: item.product.name,
                                });
                              }}
                              className="text-gray-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="text-[10px] text-[#d4af37] font-medium uppercase mt-0.5">
                            <span>{item.product.category}</span>
                          </div>
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#1c1f2e]">
                          <div className="flex items-center bg-[#090a0e] border border-[#d4af37]/30 rounded-lg overflow-hidden">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-[#1a1d29] text-[#d4af37] transition-colors cursor-pointer"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-[#1a1d29] text-[#d4af37] transition-colors cursor-pointer"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-bold font-serif-luxury text-white">
                              {formatCurrency(item.product.price * item.quantity)}
                            </span>
                            {item.quantity > 1 && (
                              <div className="text-[9px] text-[#71788d]">
                                {formatCurrency(item.product.price)} c/u
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cross-Selling Recommendations */}
                {recommendations.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#1f2334]">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                      <h4 className="text-xs font-serif-luxury font-bold text-[#f5e3a9] uppercase tracking-wider">
                        Combina Perfecto Con
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-[#0f1118] border border-[#232738] hover:border-[#d4af37]/40 rounded-xl p-2.5 flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-[#232738]">
                              <ImageWithSkeleton
                                src={rec.image}
                                alt={rec.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-medium text-white line-clamp-1">
                                {rec.name}
                              </h5>
                              <div className="text-[11px] font-serif-luxury font-bold text-gold-gradient">
                                {formatCurrency(rec.price)}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddRecommended(rec)}
                            className="bg-[#181c2b] hover:bg-gold-gradient text-[#f5e3a9] hover:text-[#0a0b0e] border border-[#d4af37]/35 hover:border-[#d4af37] px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Agregar</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer with totals and actions */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-[#0e1017] border-t border-[#d4af37]/25 space-y-3">
              
              {/* Price Breakdown */}
              <div className="space-y-1 text-xs text-[#959eb4]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-mono">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Envío asegurado a domicilio</span>
                  <span className="font-mono text-[#86efac] font-bold text-xs">
                    GRATIS
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#1f2334]">
                  <span className="font-serif-luxury text-base sm:text-lg">Total</span>
                  <span className="font-serif-luxury text-lg sm:text-xl text-gold-gradient font-black">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                {/* Proceed to Checkout Button */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gold-gradient hover:bg-gold-gradient-hover text-[#0a0b0e] font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/35"
                >
                  <span>Finalizar Compra</span>
                  <ArrowRight className="w-4 h-4 text-[#0a0b0e] shrink-0" />
                </button>

                {/* Direct WhatsApp 1-Click Buy Button */}
                <button
                  type="button"
                  onClick={handleWhatsAppBuyCart}
                  className="p-3.5 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-[#061e0e] flex items-center justify-center transition-all duration-300 shadow-lg shadow-[#25d366]/25 hover:shadow-[#25d366]/40 hover:scale-105 shrink-0 cursor-pointer"
                  title="Comprar por WhatsApp contra entrega"
                  aria-label="Comprar por WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 text-[10px] text-[#71798f] pt-0.5">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#d4af37]" />
                  Pagas al Recibir
                </span>
                <span>•</span>
                <span>Atención Personalizada</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
