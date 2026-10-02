/**
 * Fuzzy search utility with Levenshtein distance, diacritics normalization,
 * and Spanish e-commerce synonym mapping for FullStock.
 */

// Synonym & typo mapping table for shop queries
const SYNONYMS: Record<string, string[]> = {
  whisky: ['wiski', 'whiskey', 'visqui', 'visky', 'vasso', 'vaso'],
  vajilla: ['vajila', 'bajilla', 'platos', 'porcelana', 'platito', 'vajila'],
  cubiertos: ['cubierto', 'cuchillo', 'tenedor', 'cuchara', 'cubierro'],
  difusor: ['difusores', 'humificador', 'aroma', 'esencia', 'aromatizador', 'difusos'],
  cocteleria: ['coctel', 'cocktail', 'shaker', 'coctelera', 'bar', 'trago', 'mixologia'],
  cristaleria: ['cristal', 'copa', 'copas', 'vasos', 'vaso', 'vidrio'],
  florero: ['flore', 'jarron', 'floreros', 'maceta'],
  vela: ['velas', 'ceras', 'soja', 'soya', 'aromatica'],
  regalo: ['regalos', 'box', 'caja', 'presente', 'obsequio'],
};

/**
 * Remove accents and normalize text to lowercase
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Calculates Levenshtein distance between two short strings
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if a query token fuzzy-matches a target string
 */
export function fuzzyMatchToken(token: string, target: string): boolean {
  const normToken = normalizeText(token);
  const normTarget = normalizeText(target);

  if (!normToken) return true;
  if (normTarget.includes(normToken)) return true;

  // Check synonym map
  for (const [canonical, aliases] of Object.entries(SYNONYMS)) {
    if (canonical.includes(normToken) || aliases.some(a => a.includes(normToken))) {
      if (normTarget.includes(canonical)) return true;
    }
  }

  // Token fuzzy match for typos (distance threshold proportional to length)
  const words = normTarget.split(/\s+/);
  for (const word of words) {
    if (Math.abs(word.length - normToken.length) <= 3) {
      const dist = levenshteinDistance(normToken, word);
      const maxAllowedDist = normToken.length <= 4 ? 1 : normToken.length <= 7 ? 2 : 3;
      if (dist <= maxAllowedDist) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Score and rank products matching a search query with typo tolerance
 */
export function fuzzySearchProducts<T extends { name: string; subtitle?: string; category: string; tags: string[]; sku: string; description: string }>(
  products: T[],
  query: string
): T[] {
  const normQuery = normalizeText(query);
  if (!normQuery) return products;

  const tokens = normQuery.split(/\s+/).filter(Boolean);

  return products
    .map(product => {
      const name = normalizeText(product.name || '');
      const sub = normalizeText(product.subtitle || '');
      const cat = normalizeText(product.category || '');
      const tags = Array.isArray(product.tags) ? product.tags.map(normalizeText).join(' ') : '';
      const sku = normalizeText(product.sku || '');
      const desc = normalizeText(product.description || '');

      const targetText = `${name} ${sub} ${cat} ${tags} ${sku} ${desc}`;

      let matchedTokensCount = 0;
      let score = 0;

      for (const token of tokens) {
        if (fuzzyMatchToken(token, targetText)) {
          matchedTokensCount++;
          if (name.includes(token)) score += 10;
          if (sub.includes(token)) score += 5;
          if (cat.includes(token)) score += 8;
          if (tags.includes(token)) score += 6;
          if (sku.includes(token)) score += 12;
        }
      }

      const matchRatio = matchedTokensCount / tokens.length;
      return { product, matchRatio, score };
    })
    .filter(item => item.matchRatio >= 0.5) // At least 50% of search terms match
    .sort((a, b) => b.score - a.score || b.matchRatio - a.matchRatio)
    .map(item => item.product);
}
