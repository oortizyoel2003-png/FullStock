import { OrderReceipt } from '../types';

/**
 * Generates an ultra high-resolution visual receipt voucher for FullStock orders using HTML5 Canvas.
 * Returns a Data URL (PNG) that can be downloaded or shared.
 */
export async function generateReceiptCanvas(receipt: OrderReceipt): Promise<string> {
  const canvas = document.createElement('canvas');
  // High-DPI scale factor for ultra sharp retina rendering
  const scale = 2;
  const width = 640;
  const padding = 36;

  // Calculate dynamic height based on number of items
  const itemsCount = receipt.items.length;
  const baseHeight = 520;
  const itemRowHeight = 44;
  const height = baseHeight + (itemsCount * itemRowHeight);

  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.scale(scale, scale);

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0a0c12');
  bgGrad.addColorStop(0.5, '#111420');
  bgGrad.addColorStop(1, '#08090e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Gold Luxury Border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // Subtle Inner Frame
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  let currentY = padding + 10;

  // Header Title
  ctx.textAlign = 'center';
  ctx.font = '900 24px "Cinzel", "Playfair Display", Georgia, serif';
  const goldTextGrad = ctx.createLinearGradient(width / 2 - 100, 0, width / 2 + 100, 0);
  goldTextGrad.addColorStop(0, '#fbf5b7');
  goldTextGrad.addColorStop(0.5, '#d4af37');
  goldTextGrad.addColorStop(1, '#aa771c');
  ctx.fillStyle = goldTextGrad;
  ctx.fillText('FULLSTOCK', width / 2, currentY);

  currentY += 20;
  ctx.font = '600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#a0a8be';
  ctx.letterSpacing = '2px';
  ctx.fillText('COMPROBANTE OFICIAL DE PEDIDO', width / 2, currentY);

  currentY += 18;
  // Divider
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.beginPath();
  ctx.moveTo(padding, currentY);
  ctx.lineTo(width - padding, currentY);
  ctx.stroke();

  currentY += 24;

  // Order Details Box
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Orden: #${receipt.orderId}`, padding, currentY);

  ctx.textAlign = 'right';
  ctx.font = 'normal 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#8e95ac';
  ctx.fillText(`Fecha: ${receipt.date}`, width - padding, currentY);

  currentY += 20;
  ctx.textAlign = 'left';
  ctx.font = 'normal 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#cbd2e4';
  ctx.fillText(`Cliente: ${receipt.customerName}`, padding, currentY);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#25d366';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`WhatsApp: ${receipt.customerPhone}`, width - padding, currentY);

  currentY += 18;
  ctx.textAlign = 'left';
  ctx.font = 'normal 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#8e95ac';
  const addressText = `Entrega: ${receipt.shippingAddress}`;
  ctx.fillText(addressText.length > 55 ? addressText.slice(0, 52) + '...' : addressText, padding, currentY);

  currentY += 22;

  // Items Table Header
  ctx.fillStyle = '#181c2d';
  ctx.fillRect(padding, currentY, width - (padding * 2), 26);
  ctx.strokeStyle = '#272d42';
  ctx.strokeRect(padding, currentY, width - (padding * 2), 26);

  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#d4af37';
  ctx.fillText('PRODUCTO', padding + 10, currentY + 17);
  ctx.textAlign = 'center';
  ctx.fillText('CANT.', width - padding - 130, currentY + 17);
  ctx.textAlign = 'right';
  ctx.fillText('TOTAL', width - padding - 10, currentY + 17);

  currentY += 32;

  // Items List
  receipt.items.forEach((item, index) => {
    // Alternating item bg
    if (index % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(padding, currentY - 6, width - (padding * 2), itemRowHeight - 4);
    }

    ctx.textAlign = 'left';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    const prodName = item.product.name;
    ctx.fillText(prodName.length > 34 ? prodName.slice(0, 31) + '...' : prodName, padding + 10, currentY + 12);

    ctx.font = 'normal 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#8e95ac';
    ctx.fillText(`$${item.product.price.toLocaleString('es-AR')} c/u`, padding + 10, currentY + 26);

    ctx.textAlign = 'center';
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#f5e3a9';
    ctx.fillText(`x${item.quantity}`, width - padding - 130, currentY + 18);

    ctx.textAlign = 'right';
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`$${(item.product.price * item.quantity).toLocaleString('es-AR')}`, width - padding - 10, currentY + 18);

    currentY += itemRowHeight;
  });

  currentY += 10;
  // Summary Divider
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
  ctx.beginPath();
  ctx.moveTo(padding, currentY);
  ctx.lineTo(width - padding, currentY);
  ctx.stroke();

  currentY += 20;

  // Subtotal & Shipping
  ctx.textAlign = 'left';
  ctx.font = 'normal 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#8e95ac';
  ctx.fillText('Subtotal Productos:', padding + 10, currentY);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#cbd2e4';
  ctx.fillText(`$${receipt.subtotal.toLocaleString('es-AR')}`, width - padding - 10, currentY);

  currentY += 18;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#8e95ac';
  ctx.fillText('Costo de Envío:', padding + 10, currentY);
  ctx.textAlign = 'right';
  ctx.fillStyle = receipt.shippingCost === 0 ? '#4ade80' : '#cbd2e4';
  ctx.fillText(receipt.shippingCost === 0 ? '¡GRATIS!' : `$${receipt.shippingCost.toLocaleString('es-AR')}`, width - padding - 10, currentY);

  currentY += 26;

  // Grand Total Highlight Box
  ctx.fillStyle = '#151928';
  ctx.fillRect(padding, currentY - 14, width - (padding * 2), 42);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(padding, currentY - 14, width - (padding * 2), 42);

  ctx.textAlign = 'left';
  ctx.font = 'bold 14px "Cinzel", "Playfair Display", Georgia, serif';
  ctx.fillStyle = '#f5e3a9';
  ctx.fillText('TOTAL A PAGAR AL RECIBIR:', padding + 12, currentY + 13);

  ctx.textAlign = 'right';
  ctx.font = '900 18px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`$${receipt.total.toLocaleString('es-AR')}`, width - padding - 12, currentY + 13);

  currentY += 56;

  // Payment Badge Guarantee
  ctx.textAlign = 'center';
  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#22c55e';
  ctx.fillText('✓ PAGO CONTRA ENTREGA (TRANSFERENCIA O EFECTIVO AL MOMENTO DE LA ENTREGA)', width / 2, currentY);

  currentY += 16;
  ctx.font = 'italic 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#7a8298';
  ctx.fillText('Tu pedido ya está siendo preparado para despacho.', width / 2, currentY);

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Initiates direct download of the order voucher PNG.
 */
export async function downloadReceiptImage(receipt: OrderReceipt): Promise<void> {
  const dataUrl = await generateReceiptCanvas(receipt);
  const link = document.createElement('a');
  link.download = `Comprobante-FullStock-${receipt.orderId}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Shares receipt using native Mobile Web Share API with image file fallback to download.
 */
export async function shareReceiptImage(receipt: OrderReceipt): Promise<boolean> {
  try {
    const dataUrl = await generateReceiptCanvas(receipt);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `Comprobante-FullStock-${receipt.orderId}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Comprobante de Pedido #${receipt.orderId} - FullStock`,
        text: `Hola! Te comparto mi comprobante de pedido en FullStock (#${receipt.orderId}).`,
      });
      return true;
    } else {
      // Fallback to download
      await downloadReceiptImage(receipt);
      return false;
    }
  } catch {
    // If share fails or user cancels, download directly
    await downloadReceiptImage(receipt);
    return false;
  }
}
