import React, { useState, useMemo, useEffect } from 'react';
import { ImageOff, Sparkles } from 'lucide-react';

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatioClass?: string;
  priority?: boolean;
}

// Global in-memory cache registry for loaded image URLs to prevent repeated skeletons
const loadedImagesCache = new Set<string>();

/**
 * Optimizes image URLs to enforce modern progressive formats (WebP/AVIF)
 * and optimal quality/compression for lightning-fast rendering over 3G/4G mobile networks.
 */
function getOptimizedImageUrl(url: string, width: number = 600): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  // Unsplash progressive webp optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format,compress');
      urlObj.searchParams.set('fm', 'webp');
      urlObj.searchParams.set('q', '75');
      urlObj.searchParams.set('w', width.toString());
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  // CloudFront / Empretienda CDN images: pass-through with browser-cached header affinity
  return url;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatioClass = 'aspect-square',
  priority = false,
  ...rest
}) => {
  // Generate WebP optimized source for mobile 3G/4G efficiency
  const optimizedSrc = useMemo(() => getOptimizedImageUrl(src, 600), [src]);

  // If already in global cache, initialize as loaded to eliminate flash
  const isPrecached = loadedImagesCache.has(optimizedSrc) || loadedImagesCache.has(src);
  const [isLoaded, setIsLoaded] = useState(isPrecached);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (loadedImagesCache.has(optimizedSrc) || loadedImagesCache.has(src)) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
    setHasError(false);
  }, [optimizedSrc, src]);

  const handleLoad = () => {
    loadedImagesCache.add(optimizedSrc);
    loadedImagesCache.add(src);
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden bg-[#0c0e17] ${aspectRatioClass} ${containerClassName}`}>
      {/* Skeleton Shimmer while loading for NEW images only */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 bg-[#0e111a] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/10 to-transparent animate-pulse" />
          <div className="flex flex-col items-center gap-1.5 opacity-20">
            <Sparkles className="w-5 h-5 text-[#d4af37] animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111420] text-gray-500 p-4 text-center">
          <ImageOff className="w-6 h-6 mb-1 text-[#d4af37]/40" />
          <span className="text-[10px] text-gray-400">Imagen no disponible</span>
        </div>
      ) : (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ease-out ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
          } ${className}`}
          {...rest}
        />
      )}
    </div>
  );
};
