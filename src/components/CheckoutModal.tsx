import React, { useState, useEffect } from 'react';
import { CartItem, OrderReceipt } from '../types';
import { X, Send, ShieldCheck, MapPin, User, Phone, CreditCard, Sparkles, CheckCircle2, Download, Share2 } from 'lucide-react';
import { downloadReceiptImage, shareReceiptImage } from '../utils/receiptGenerator';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderCompleted: (receipt: OrderReceipt) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderCompleted,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<OrderReceipt | null>(null);

  // Automatically reset completed receipt when modal is opened for a new purchase
  useEffect(() => {
    if (isOpen) {
      setCompletedReceipt(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setCompletedReceipt(null);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const giftWrapsTotal = items.reduce((sum, item) => sum + (item.giftWrap ? 1500 : 0), 0);
  const shippingCost = 0; // Envío 100% Gratis en todas las órdenes
  const grandTotal = subtotal + giftWrapsTotal + shippingCost;

  const STORE_WHATSAPP = '5491148882362';

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);

    const orderId = `FS-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toLocaleString('es-AR');

    // Build complete pre-formatted WhatsApp message
    let msg = `*🛒 NUEVO PEDIDO EN FULLSTOCK BAZAR - #${orderId}*\n\n`;
    msg += `*Fecha:* ${dateStr}\n`;
    msg += `*Cliente:* ${customerName}\n`;
    msg += `*Teléfono:* ${customerPhone}\n`;
    msg += `*Dirección de Entrega:* ${shippingAddress}\n`;
    msg += `*Método de Pago:* Pago Contra Entrega en Mano (al recibir)\n\n`;

    msg += `*DESGLOSE DE ÍTEMS:*\n`;
    items.forEach((item, index) => {
      msg += `${index + 1}. *${item.product.name}* x${item.quantity} -> $${(item.product.price * item.quantity).toLocaleString('es-AR')}\n`;
      if (item.giftWrap) {
        msg += `   └ 🎁 Envoltorio de regalo (+ $1.500)${item.giftMessage ? ` - Note: "${item.giftMessage}"` : ''}\n`;
      }
    });

    msg += `\n*RESUMEN TOTAL:*\n`;
    msg += `• Subtotal: $${subtotal.toLocaleString('es-AR')}\n`;
    if (giftWrapsTotal > 0) msg += `• Envoltorios: $${giftWrapsTotal.toLocaleString('es-AR')}\n`;
    msg += `• Envío: ¡GRATIS!\n`;
    msg += `*TOTAL A PAGAR: $${grandTotal.toLocaleString('es-AR')}*\n\n`;
    msg += `Quedo a la espera de la confirmación de despacho. ¡Muchas gracias!`;

    const receipt: OrderReceipt = {
      orderId,
      date: dateStr,
      customerName,
      customerPhone,
      shippingAddress,
      paymentMethod: 'contra_entrega',
      items,
      subtotal,
      shippingCost,
      total: grandTotal,
      whatsappMessage: msg,
    };

    setTimeout(() => {
      onOrderCompleted(receipt);
      setCompletedReceipt(receipt);
      setIsSubmitting(false);

      // Open WhatsApp directly
      const encodedMsg = encodeURIComponent(msg);
      window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodedMsg}`, '_blank');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-fast">
      <div 
        className="relative w-full max-w-xl bg-[#0e101a] border border-[#23273c] rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-[#1a1f33] flex items-center justify-between bg-[#07080a]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
            <h2 className="font-serif-luxury text-lg font-bold text-white">
              {completedReceipt ? '¡Pedido Generado!' : 'Checkout Exclusivo (1 Solo Paso)'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-[#8e95ab] hover:text-white hover:bg-[#181c2d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          
          {completedReceipt ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#182a1e] border border-green-500/50 flex items-center justify-center mx-auto text-green-400">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-serif-luxury font-bold text-white">
                  ¡Gracias {completedReceipt.customerName}!
                </h3>
                <p className="text-xs text-[#a0a8be] mt-1">
                  Tu orden <strong className="text-[#f5e3a9]">#{completedReceipt.orderId}</strong> fue registrada correctamente.
                </p>
              </div>

              <div className="bg-[#121522] border border-[#23283c] p-4 rounded-2xl text-left space-y-2 text-xs text-[#c0c8e0]">
                <p><strong>Dirección:</strong> {completedReceipt.shippingAddress}</p>
                <p><strong>Total a abonar en mano:</strong> ${completedReceipt.total.toLocaleString('es-AR')}</p>
                <p className="text-[11px] text-[#8e95ab]">
                  Se abrió WhatsApp con tu pedido. También podés descargar o compartir tu comprobante oficial en imagen para guardarlo.
                </p>
              </div>

              {/* Action Buttons: WhatsApp and Receipt Image */}
              <div className="space-y-2.5">
                <a
                  href={`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(completedReceipt.whatsappMessage || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Confirmar Pedido por WhatsApp</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => downloadReceiptImage(completedReceipt)}
                    className="py-3 px-3 rounded-2xl bg-[#1a1e2f] hover:bg-[#252b42] text-[#f5e3a9] border border-[#d4af37]/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4 text-[#d4af37]" />
                    <span>Guardar Ticket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => shareReceiptImage(completedReceipt)}
                    className="py-3 px-3 rounded-2xl bg-[#141824] hover:bg-[#1f2436] text-white border border-[#2c3248] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Share2 className="w-4 h-4 text-blue-400" />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-2xl bg-[#181c2d] text-white font-bold text-xs hover:bg-[#20263b] transition-colors"
              >
                Volver al Catálogo
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateOrder} className="space-y-5">
              
              {/* Order Summary Box */}
              <div className="bg-[#131624] border border-[#212638] rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-[#f5e3a9] font-serif-luxury uppercase tracking-wider">
                  Resumen de Compra ({items.length} artículos)
                </p>
                <div className="flex justify-between text-xs text-[#a0a8be]">
                  <span>Subtotal:</span>
                  <span className="font-bold text-white">${subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-xs text-[#a0a8be]">
                  <span>Envío a domicilio:</span>
                  <span className="font-bold text-green-400">
                    ¡GRATIS!
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-[#1f2438]">
                  <span>Total final:</span>
                  <span className="text-[#f5e3a9] text-base">${grandTotal.toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* Step 1 Form Fields */}
              <div className="space-y-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#b5bccf] mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Nombre y Apellido *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: Sofia Martínez"
                    className="w-full bg-[#121522] border border-[#23273a] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#687088] outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#b5bccf] mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Teléfono WhatsApp *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ej: 11 5544 3322"
                    className="w-full bg-[#121522] border border-[#23273a] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#687088] outline-none"
                  />
                </div>

                {/* Shipping Address */}
                <div>
                  <label className="block text-xs font-bold text-[#b5bccf] mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Dirección de Entrega Completa *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Calle, Número, Piso/Depto, Localidad"
                    className="w-full bg-[#121522] border border-[#23273a] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#687088] outline-none"
                  />
                </div>

                {/* Payment Method Badge */}
                <div>
                  <label className="block text-xs font-bold text-[#b5bccf] mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Método de Pago</span>
                  </label>
                  <div className="bg-[#1f1a0e] border border-[#d4af37]/60 rounded-xl p-3.5">
                    <p className="text-xs font-bold text-[#f5e3a9]">Pago Contra Entrega</p>
                    <p className="text-[11px] text-[#8e95ab] mt-0.5">Lo abonás por transferencia o efectivo al momento de la entrega.</p>
                  </div>
                </div>

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gold-gradient text-black font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Procesando Pedido...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirmar y Enviar a WhatsApp</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#8e95ab]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Tu información se procesa de manera segura e inmediata.</span>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
