import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface VirtualizedProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  wishlistIds: Set<string>;
  onToggleWishlist: (product: Product) => void;
}

export const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  onAddToCart,
  onQuickView,
  wishlistIds,
  onToggleWishlist,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<number>(2);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [containerTop, setContainerTop] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number>(800);

  // Dynamic Responsive Column calculation & Viewport listener
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(2);
      } else if (width < 1024) {
        setColumns(3);
      } else {
        setColumns(4);
      }
      setViewportHeight(window.innerHeight || 800);

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerTop(rect.top + window.scrollY);
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // Optimized Scroll Listener using RAF for 60 FPS performance
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollTop(window.scrollY);
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setContainerTop(rect.top + window.scrollY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Estimated row height based on screen size (aspect-square image + details card)
  const rowHeight = useMemo(() => {
    if (columns === 2) return 380; // Mobile card height
    if (columns === 3) return 440; // Tablet card height
    return 480; // Desktop card height
  }, [columns]);

  // Group products into row chunks
  const rows = useMemo(() => {
    const chunks: Product[][] = [];
    for (let i = 0; i < products.length; i += columns) {
      chunks.push(products.slice(i, i + columns));
    }
    return chunks;
  }, [products, columns]);

  const totalRows = rows.length;
  const totalHeight = totalRows * rowHeight;

  // Calculate visible row indices
  const relativeScrollTop = Math.max(0, scrollTop - containerTop);
  const buffer = 2; // Buffer rows above & below viewport

  const startRowIndex = Math.max(0, Math.floor(relativeScrollTop / rowHeight) - buffer);
  const endRowIndex = Math.min(
    totalRows,
    Math.ceil((relativeScrollTop + viewportHeight) / rowHeight) + buffer
  );

  const visibleRows = useMemo(() => {
    return rows.slice(startRowIndex, endRowIndex).map((rowItems, offset) => {
      const rowIndex = startRowIndex + offset;
      return {
        rowIndex,
        top: rowIndex * rowHeight,
        items: rowItems,
      };
    });
  }, [rows, startRowIndex, endRowIndex, rowHeight]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full" 
      style={{ minHeight: `${totalHeight}px` }}
    >
      {visibleRows.map(({ rowIndex, top, items }) => (
        <div
          key={`row-${rowIndex}`}
          className="absolute left-0 right-0 grid gap-3 sm:gap-6"
          style={{
            top: `${top}px`,
            height: `${rowHeight}px`,
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
              isWishlisted={wishlistIds.has(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
