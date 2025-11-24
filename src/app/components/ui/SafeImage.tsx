"use client";

import { useState, useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError" | "placeholder"> {
  maxRetries?: number;
  retryDelay?: number;
  fallbackSrc?: string;
  fallbackPlaceholder?: React.ReactNode;
}

export default function SafeImage({
  src,
  maxRetries = 4,
  retryDelay = 1000,
  fallbackSrc,
  fallbackPlaceholder,
  alt,
  ...props
}: SafeImageProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when src changes
  useEffect(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setHasFailed(false);
    setImageKey(0);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, [src]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleError = () => {
    if (retryCount < maxRetries) {
      setIsRetrying(true);
      const delay = retryDelay * Math.pow(2, retryCount);

      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setImageKey((prev) => prev + 1); // Force re-render by changing key
        setIsRetrying(false);
      }, delay);
    } else {
      setHasFailed(true);
      setIsRetrying(false);
    }
  };

  // If all retries failed, show fallback
  if (hasFailed) {
    if (fallbackPlaceholder) {
      return <>{fallbackPlaceholder}</>;
    }

    // Default fallback placeholder
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
        <span className="text-4xl mb-2">🎮</span>
        <span className="text-xs text-gray-500 text-center px-2">
          Image not available
        </span>
      </div>
    );
  }

  // If retrying, show the image with a subtle loading indicator
  // For fill prop, we need to ensure parent has relative positioning
  const hasFill = "fill" in props && props.fill;

  if (hasFill) {
    return (
      <>
        <Image
          key={imageKey}
          src={src || fallbackSrc || ""}
          alt={alt || "Image"}
          onError={handleError}
          {...props}
        />
        {isRetrying && (
          <div className="absolute inset-0 bg-black bg-opacity-5 flex items-center justify-center z-10">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        key={imageKey}
        src={src || fallbackSrc || ""}
        alt={alt || "Image"}
        onError={handleError}
        {...props}
      />
      {isRetrying && (
        <div className="absolute inset-0 bg-black bg-opacity-5 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
