import { Product } from '../types';

/**
 * Returns complementary cross-selling recommendations based on product characteristics
 * (e.g. whisky glasses -> ice bucket / decanter, vajilla -> cubiertos titanium, difusor -> vela de soja).
 */
export function getCrossSellingRecommendations(
  targetProduct: Product | null,
  allProducts: Product[],
  currentCartProductIds: Set<string> = new Set(),
  limit: number = 3
): Product[] {
  if (!allProducts || allProducts.length === 0) return [];

  const availableProducts = allProducts.filter(p => !currentCartProductIds.has(p.id) && p.price >= 2000);

  if (!targetProduct) {
    return availableProducts.slice(0, limit);
  }

  const targetCategory = targetProduct.category;
  const targetId = targetProduct.id;

  // Filter out the target product itself
  const candidates = availableProducts.filter(p => p.id !== targetId);

  // Pair logic maps
  const scored = candidates.map(p => {
    let score = 0;

    // Cross-category pairing (High value combinations)
    if (targetCategory === 'Cristalería & Bar') {
      if (p.category === 'Cristalería & Bar' && p.id !== targetId) score += 10;
      if (p.id === 'prod-004' || p.id === 'prod-005') score += 8; // Coctelería or Decantador
      if (p.category === 'Mesa & Cocina') score += 5;
    } else if (targetCategory === 'Bazar') {
      if (p.category === 'Mesa & Cocina') score += 10; // Vajilla <-> Cubiertos
      if (p.category === 'Cristalería & Bar') score += 8;
    } else if (targetCategory === 'Regalería') {
      if (p.category === 'Hogar & Deco') score += 10; // Difusor <-> Florero/Vela
      if (p.id === 'prod-007' || p.id === 'prod-003') score += 8;
    } else if (targetCategory === 'Hogar & Deco') {
      if (p.category === 'Regalería') score += 10;
    } else if (targetCategory === 'Mesa & Cocina') {
      if (p.category === 'Bazar') score += 10;
    }

    // Shared tags boost
    const sharedTags = p.tags.filter(tag => targetProduct.tags.includes(tag));
    score += sharedTags.length * 3;

    // Bestseller boost
    if (p.tags.includes('Bestseller') || p.tags.includes('Top Ventas')) {
      score += 2;
    }

    return { product: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map(item => item.product)
    .slice(0, limit);
}
