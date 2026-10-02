import { CartItem } from '../types';
import { getStoredCart, saveStoredCart } from './storage';

const CART_BROADCAST_CHANNEL = 'fullstock_cart_sync_v1';

let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CART_BROADCAST_CHANNEL);
  } catch {
    broadcastChannel = null;
  }
}

/**
 * Subscribe to cross-tab cart updates
 */
export function subscribeToCartSync(onSync: (items: CartItem[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === 'fullstock_cart_v1') {
      const freshCart = getStoredCart();
      onSync(freshCart);
    }
  };

  window.addEventListener('storage', handleStorageEvent);

  if (broadcastChannel) {
    const handleBroadcast = (e: MessageEvent) => {
      if (e.data && e.data.type === 'CART_UPDATED' && Array.isArray(e.data.items)) {
        onSync(e.data.items);
      }
    };
    broadcastChannel.addEventListener('message', handleBroadcast);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
    };
  }

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
  };
}

/**
 * Persist cart locally and broadcast to other tabs / cloud listeners
 */
export function syncCartState(items: CartItem[]): void {
  saveStoredCart(items);

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'CART_UPDATED',
        items,
        timestamp: Date.now(),
      });
    } catch {
      // Ignore fallback
    }
  }
}
