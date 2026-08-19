"use client";

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface EnhancedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  fallbackText?: string;
  containerClassName?: string;
  zoomOnHover?: boolean;
  onImageClick?: () => void;
}

export default function EnhancedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.svg',
  fallbackText,
  containerClassName = '',
  zoomOnHover = true,
  className = '',
  onImageClick,
  ...props
}: EnhancedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageSrc = hasError || !src ? fallbackSrc : src;

  return (
    <div
      onClick={onImageClick}
      className={`relative overflow-hidden group select-none ${
        onImageClick ? 'cursor-pointer' : ''
      } ${containerClassName}`}
    >
      {/* Shimmer Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10 animate-shimmer bg-slate-200/80 rounded-inherit" />
      )}

      {/* Fallback View when image fails or missing */}
      {hasError && fallbackText ? (
        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-4 text-slate-500 text-xs font-semibold text-center border border-slate-200 rounded-lg">
          <svg
            className="w-8 h-8 mb-1.5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{fallbackText}</span>
        </div>
      ) : (
        <Image
          {...props}
          src={imageSrc}
          alt={alt || 'Image'}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`transition-all duration-500 ease-out ${
            isLoading ? 'scale-105 blur-sm opacity-0' : 'scale-100 blur-0 opacity-100'
          } ${
            zoomOnHover
              ? 'group-hover:scale-108 transition-transform duration-500 ease-out'
              : ''
          } ${className}`}
        />
      )}

      {/* Subtle Gloss Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
