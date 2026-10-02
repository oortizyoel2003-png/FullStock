/**
 * Lightweight Zero-Overhead Event Analytics Tracker
 * Replaces heavy 3rd party scripts with fast native event dispatchers.
 */

export interface ECommerceEvent {
  eventName: 'view_product' | 'add_to_cart' | 'remove_from_cart' | 'begin_checkout' | 'order_completed' | 'toggle_wishlist';
  productId?: string;
  productName?: string;
  category?: string;
  price?: number;
  totalValue?: number;
  itemCount?: number;
  orderId?: string;
  timestamp?: number;
}

export function trackEvent(event: ECommerceEvent): void {
  const payload = {
    ...event,
    timestamp: event.timestamp || Date.now(),
  };

  // Log quietly in non-production or for debugging without visual lag
  if (typeof window !== 'undefined' && (window as unknown as { __DEBUG_ANALYTICS__?: boolean }).__DEBUG_ANALYTICS__) {
    console.log('[FullStock Analytics Event]', payload);
  }

  // Dispatch custom event for in-app listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fullstock_analytics', { detail: payload }));
  }
}
