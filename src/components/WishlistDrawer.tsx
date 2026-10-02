import React from 'react';
import { Product } from '../types';
import { X, Trash2, Heart, ShoppingBag } from 'lucide-react';
import { ImageWithSkeleton } from './ImageWithSkeleton';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToCart: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onMoveToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs transition-fast">
      <div 
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-[#0d0f18] border-l border-[#212638] shadow-2xl flex flex-col justify-between transition-fast">
          
          {/* Header */}
          <div className="p-5 border-b border-[#1a1e2f] flex items-center justify-between bg-[#07080a]">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400 fill-current" />
              <h2 className="font-serif-luxury text-lg font-bold text-white">Tus Favoritos</h2>
              <span className="text-xs bg-[#1a1f33] text-[#d4af37] px-2 py-0.5 rounded-full font-extrabold">
                {wishlist.length}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#8e95ab] hover:text-white hover:bg-[#181c2d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {wishlist.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#141726] border border-[#23293e] flex items-center justify-center mx-auto text-[#6a7288]">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="font-serif-luxury text-base font-bold text-white">No tienes piezas guardadas</h3>
                <p className="text-xs text-[#828a9e] max-w-xs mx-auto">
                  Guarda las piezas que más te gusten haciendo clic en el corazón para consultarlas o comprarlas más tarde.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-gold-gradient text-black text-xs font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlist.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#121522] border border-[#212638] rounded-2xl p-3 flex gap-3 relative group"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#181a28] shrink-0">
                      <ImageWithSkeleton
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0 pr-6">
                      <div>
                        <h4 className="text-xs font-bold text-white font-serif-luxury truncate">
                          {product.name}
                        </h4>
                        <p className="text-[11px] font-extrabold text-[#f5e3a9] mt-0.5">
                          ${product.price.toLocaleString('es-AR')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onMoveToCart(product)}
                        className="mt-2 py-1.5 px-3 rounded-xl bg-gold-gradient text-black text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 transition-all cursor-pointer shadow-md"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Mover al Carrito</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveFromWishlist(product.id)}
                      className="absolute top-2.5 right-2.5 text-[#6c748c] hover:text-red-400 p-1"
                      title="Quitar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1a1e2f] bg-[#07080a] text-center">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-[#181c2d] text-white text-xs font-bold hover:bg-[#20263b] transition-colors"
            >
              Continuar Navegando
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
