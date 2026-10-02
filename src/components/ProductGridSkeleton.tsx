import React from 'react';

interface ProductGridSkeletonProps {
  count?: number;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#11131a] rounded-xl sm:rounded-2xl border border-[#1e2233] overflow-hidden flex flex-col animate-pulse"
        >
          {/* Aspect Square Image Skeleton */}
          <div className="aspect-square w-full bg-[#181c28] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#23283b]/30 to-transparent animate-shimmer" />
          </div>

          {/* Details Skeleton */}
          <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
            <div>
              {/* Category pill skeleton */}
              <div className="h-2.5 sm:h-3 w-16 bg-[#1f2436] rounded-md mb-2" />
              {/* Title line 1 */}
              <div className="h-3.5 sm:h-4 w-5/6 bg-[#1f2436] rounded-md mb-1.5" />
              {/* Title line 2 */}
              <div className="h-3.5 sm:h-4 w-3/5 bg-[#1f2436] rounded-md" />
            </div>

            <div className="pt-2 border-t border-[#1e2230] space-y-2">
              {/* Price skeleton */}
              <div className="h-5 sm:h-6 w-24 bg-[#23283a] rounded-md" />
              {/* Button skeleton */}
              <div className="h-8 sm:h-10 w-full bg-[#181c2a] rounded-lg sm:rounded-xl border border-[#262b3d]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
