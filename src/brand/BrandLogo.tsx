import React from 'react';

interface BrandLogoProps {
  variant?: 'lockup' | 'mark' | 'wordmark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'lockup',
  className = '',
  size = 'md',
  alt = 'NextGen — Leading Today, Shaping Tomorrow',
}) => {
  let sizeClasses = '';

  if (size === 'sm') {
    sizeClasses = variant === 'mark' ? 'h-8 w-8' : variant === 'wordmark' ? 'h-6 w-auto' : 'h-7 sm:h-8 w-auto';
  } else if (size === 'md') {
    sizeClasses = variant === 'mark' ? 'h-9 w-9 sm:h-11 sm:w-11' : variant === 'wordmark' ? 'h-7 sm:h-9 w-auto' : 'h-8 sm:h-10 w-auto';
  } else if (size === 'lg') {
    sizeClasses = variant === 'mark' ? 'h-16 w-16' : variant === 'wordmark' ? 'h-12 w-auto' : 'h-14 w-auto';
  } else if (size === 'xl') {
    sizeClasses = variant === 'mark' ? 'h-24 w-24' : variant === 'wordmark' ? 'h-16 w-auto' : 'h-20 w-auto';
  }

  const src =
    variant === 'mark'
      ? '/brand/logo-mark.png'
      : variant === 'wordmark'
      ? '/brand/logo-wordmark.png'
      : '/brand/logo-lockup.png';

  return (
    <div className={`select-none ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses} object-contain transition-all duration-300 block`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};
