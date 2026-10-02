import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { CartItem } from '../types';
import { sanitizeProduct } from './storage';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if available
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Helper to get or create a persistent sync device ID
const DEVICE_ID_KEY = 'fullstock_cloud_device_id';

export function getDeviceSyncId(): string {
  if (typeof window === 'undefined') return 'server_session';
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    try {
      localStorage.setItem(DEVICE_ID_KEY, id);
    } catch {
      // Ignore quota errors
    }
  }
  return id;
}

// Anonymous Authentication handler
export async function ensureCloudAuth(): Promise<User | null> {
  try {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.warn('Firebase anonymous auth warning (falling back to device ID):', error);
    return null;
  }
}

/**
 * Persists the user cart to Firestore document: carts/{userId}
 */
export async function syncCartToCloud(userId: string, items: CartItem[]): Promise<boolean> {
  if (!userId) return false;
  try {
    const cartRef = doc(db, 'carts', userId);
    // Sanitize items before sending to Firestore
    const cleanItems = items.map(item => ({
      quantity: item.quantity,
      giftWrap: Boolean(item.giftWrap),
      giftMessage: item.giftMessage || '',
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        category: item.product.category,
        image: item.product.image,
        inStock: item.product.inStock,
        sku: item.product.sku,
        rating: item.product.rating,
      }
    }));

    await setDoc(cartRef, {
      userId,
      items: cleanItems,
      updatedAt: new Date().toISOString(),
      updatedTimestamp: serverTimestamp(),
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error syncing cart to cloud:', error);
    return false;
  }
}

/**
 * Fetches cart items from Firestore
 */
export async function fetchCartFromCloud(userId: string): Promise<CartItem[] | null> {
  if (!userId) return null;
  try {
    const cartRef = doc(db, 'carts', userId);
    const snap = await getDoc(cartRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items)) {
        const mapped: (CartItem | null)[] = data.items.map((item: any) => {
          if (!item || !item.product) return null;
          const sanitizedProd = sanitizeProduct(item.product);
          if (!sanitizedProd) return null;
          return {
            product: sanitizedProd,
            quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
            giftWrap: Boolean(item.giftWrap),
            giftMessage: item.giftMessage || '',
          };
        });
        return mapped.filter((item): item is CartItem => item !== null);
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching cart from cloud:', error);
    return null;
  }
}

/**
 * Real-time listener for Cloud Cart (syncs multi-tab or multi-device)
 */
export function subscribeToCloudCart(userId: string, onUpdate: (items: CartItem[]) => void): () => void {
  if (!userId) return () => {};
  const cartRef = doc(db, 'carts', userId);
  
  return onSnapshot(cartRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items)) {
        const mapped: (CartItem | null)[] = data.items.map((item: any) => {
          if (!item || !item.product) return null;
          const sanitizedProd = sanitizeProduct(item.product);
          if (!sanitizedProd) return null;
          return {
            product: sanitizedProd,
            quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
            giftWrap: Boolean(item.giftWrap),
            giftMessage: item.giftMessage || '',
          };
        });

        const cleanItems = mapped.filter((item): item is CartItem => item !== null);
        onUpdate(cleanItems);
      }
    }
  }, (err) => {
    console.warn('Cloud cart subscription notice:', err);
  });
}

// CUSTOMER REVIEWS WITH REAL PHOTOS

export interface CustomerReview {
  id?: string;
  productId?: string;
  productName: string;
  customerName: string;
  city?: string;
  rating: number;
  comment: string;
  photoUrl?: string;
  verifiedPurchase: boolean;
  createdAt: string;
  tags?: string[];
}

/**
 * Fetches real customer reviews with photos from Firestore
 */
export async function fetchCustomerReviewsFromCloud(): Promise<CustomerReview[]> {
  try {
    const reviewsRef = collection(db, 'customer_reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'), limit(30));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      return snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<CustomerReview, 'id'>)
      }));
    }
  } catch (error) {
    console.warn('Falling back to local curated reviews:', error);
  }
  return [];
}

/**
 * Adds a new review with customer photo to Firestore
 */
export async function addCustomerReviewToCloud(review: Omit<CustomerReview, 'id'>): Promise<string | null> {
  try {
    const reviewsRef = collection(db, 'customer_reviews');
    const docRef = await addDoc(reviewsRef, {
      ...review,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving review to Firestore:', error);
    return null;
  }
}

// LIGHTWEIGHT PRIVACY-FRIENDLY SERVER/CLIENT ANALYTICS TRACKER

export function logAnalyticsEvent(eventName: string, payload: Record<string, any> = {}) {
  // Fire-and-forget, zero blocking, privacy safe
  try {
    if (typeof window === 'undefined') return;
    
    // Light console log for development inspection
    if (import.meta.env.MODE !== 'production') {
      console.log(`[Analytics Event]: ${eventName}`, payload);
    }

    // Persist event to Firestore asynchronously without awaiting
    const eventsRef = collection(db, 'analytics_events');
    addDoc(eventsRef, {
      eventName,
      payload,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent ? navigator.userAgent.substring(0, 100) : 'unknown',
    }).catch(() => {
      // Ignore background errors
    });
  } catch {
    // Non-critical, ignore
  }
}

// OWNER CONFIG & SUPPLIER PRODUCTS FIRESTORE STORAGE

import { OwnerConfig, Product } from '../types';

const OWNER_CONFIG_DOC = 'current_settings';

export async function saveOwnerConfigToCloud(config: OwnerConfig): Promise<boolean> {
  try {
    const configRef = doc(db, 'owner_config', OWNER_CONFIG_DOC);
    await setDoc(configRef, {
      ...config,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Could not save owner config to cloud (using local cache):', error);
    return false;
  }
}

export async function fetchOwnerConfigFromCloud(): Promise<OwnerConfig | null> {
  try {
    const configRef = doc(db, 'owner_config', OWNER_CONFIG_DOC);
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        supplierUrl: data.supplierUrl || '',
        lastSyncTime: data.lastSyncTime || null,
        syncIntervalMinutes: typeof data.syncIntervalMinutes === 'number' ? data.syncIntervalMinutes : 60,
        hiddenProductIds: Array.isArray(data.hiddenProductIds) ? data.hiddenProductIds : [],
        hiddenCategories: Array.isArray(data.hiddenCategories) ? data.hiddenCategories : [],
        autoHideOutOfStock: typeof data.autoHideOutOfStock === 'boolean' ? data.autoHideOutOfStock : true,
      };
    }
  } catch (error) {
    console.warn('Could not fetch owner config from cloud:', error);
  }
  return null;
}

export async function saveSupplierProductsToCloud(products: Product[]): Promise<boolean> {
  try {
    // Save up to 100 products efficiently in Firestore supplier_products collection or batch
    const batchPromises = products.slice(0, 60).map(async (p) => {
      const pRef = doc(db, 'supplier_products', p.id);
      return setDoc(pRef, {
        id: p.id,
        name: p.name,
        subtitle: p.subtitle || '',
        price: p.price,
        originalPrice: p.originalPrice || null,
        discountPct: p.discountPct || 0,
        category: p.category,
        image: p.image,
        images: p.images || [p.image],
        description: p.description,
        rating: p.rating || 4.9,
        reviewsCount: p.reviewsCount || 10,
        inStock: p.inStock,
        stockCount: p.stockCount ?? 15,
        sku: p.sku || `SUP-${p.id}`,
        tags: p.tags || ['Proveedor'],
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    });
    await Promise.all(batchPromises);
    return true;
  } catch (error) {
    console.warn('Could not save supplier products to cloud (using local cache):', error);
    return false;
  }
}

export async function fetchSupplierProductsFromCloud(): Promise<Product[] | null> {
  try {
    const ref = collection(db, 'supplier_products');
    const snap = await getDocs(ref);
    if (!snap.empty) {
      const prods: Product[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        const sanitized = sanitizeProduct(d as any);
        if (sanitized) prods.push(sanitized);
      });
      if (prods.length > 0) return prods;
    }
  } catch (error) {
    console.warn('Could not fetch supplier products from cloud:', error);
  }
  return null;
}
