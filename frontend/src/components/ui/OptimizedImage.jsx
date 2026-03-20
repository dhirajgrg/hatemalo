import { useState, useRef, useEffect, useCallback } from "react";
import { optimizeImage } from "../../utils/imagekit";

/**
 * Optimized image component with:
 * - ImageKit URL transformations (resize, quality, format)
 * - Native lazy loading
 * - IntersectionObserver for deferred src loading
 * - Skeleton placeholder while loading
 */
export default function OptimizedImage({
  src,
  alt = "",
  width,
  height,
  quality,
  className = "",
  containerClassName = "",
  skeletonClassName = "",
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const observerRef = useRef(null);

  const optimizedSrc = optimizeImage(src, { width, height, quality });

  const containerRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      {/* Skeleton pulse placeholder */}
      {!loaded && (
        <div
          className={`absolute inset-0 bg-surface-alt animate-pulse ${skeletonClassName}`}
        />
      )}

      {inView && (
        <img
          src={optimizedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
