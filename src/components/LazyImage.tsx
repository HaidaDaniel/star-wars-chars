import React, { useState, useEffect, useRef } from "react";
import { CHARACTER_IMAGE_URL, FALLBACK_CHARACTER_IMAGE, IMAGES_ENABLED } from "~/constants/api";

interface LazyImageProps {
  characterId: number;
  alt: string;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ characterId, alt, className = "" }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(
    IMAGES_ENABLED ? null : FALLBACK_CHARACTER_IMAGE
  );
  const [isLoading, setIsLoading] = useState(IMAGES_ENABLED);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!IMAGES_ENABLED) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !imageSrc && !hasError) {
            const imageUrl = `${CHARACTER_IMAGE_URL}/${characterId}.jpg`;
            setImageSrc(imageUrl);
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [characterId, imageSrc, hasError]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(FALLBACK_CHARACTER_IMAGE);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc || FALLBACK_CHARACTER_IMAGE}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        loading="lazy"
      />
    </div>
  );
};

export default LazyImage;

