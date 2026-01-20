'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  zoneId: string;
  size: '300x250' | '728x90' | '300x100' | '468x60';
  className?: string;
}

export function AdBanner({ zoneId, size, className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [width, height] = size.split('x').map(Number);

  useEffect(() => {
    if (!adRef.current || zoneId === 'demo') return;

    // ExoClick ad script
    const script = document.createElement('script');
    script.type = 'application/javascript';
    script.src = 'https://a.exoclick.com/ads.js';
    script.setAttribute('data-idzone', zoneId);
    script.setAttribute('data-type', 'banner');
    script.setAttribute('data-width', width.toString());
    script.setAttribute('data-height', height.toString());
    script.async = true;

    adRef.current.appendChild(script);

    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [zoneId, width, height]);

  return (
    <div
      ref={adRef}
      className={`ad-container flex items-center justify-center bg-gray-800/30 rounded-lg overflow-hidden ${className}`}
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      <span className="text-gray-600 text-xs">Ad</span>
    </div>
  );
}
