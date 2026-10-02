import React from 'react';

interface ProductCardSkeletonProps {
  count?: number;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = () => {
  return (
    <div className="bg-[#11131a] rounded-xl sm:rounded-2xl border border-[#d4af37]/20 flex flex-col overflow-hidden animate-pulse">
      {/* Aspect Square Image Placeholder */}
      <div className="relative aspect-square w-full bg-[#181b28] overflow-hidden flex items-center justify-center">
        {/* Shimmer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#222738]/40 to-transparent animate-shimmer" />
        
        {/* Top badge skeleton */}
        <div className="absolute top-3 left-3 w-16 h-4 bg-[#232738] rounded-md" />
        
        {/* Wishlist icon placeholder */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#232738]" />
      </div>

      {/* Content Area */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#11131a]">
        <div>
          {/* Category Pill */}
          <div className="w-14 h-3 bg-[#1e2334] rounded mb-2" />

          {/* Product Title Lines */}
          <div className="w-full h-4 bg-[#23283b] rounded mb-1.5" />
          <div className="w-3/4 h-3.5 bg-[#1b2030] rounded" />
        </div>

        {/* Price & CTA Placeholder */}
        <div className="pt-2 border-t border-[#1d2232] space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-20 h-5 bg-[#252b40] rounded" />
            <div className="w-12 h-3 bg-[#1a1f30] rounded" />
          </div>

          <div className="w-full h-9 bg-[#1b2032] border border-[#2b324a]/50 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};
