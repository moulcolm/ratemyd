'use client';

import { useEffect, useRef } from 'react';

interface AdNativeProps {
  zoneId: string;
  className?: string;
}

export function AdNative({ zoneId, className = '' }: AdNativeProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current || zoneId === 'demo') return;

    const script = document.createElement('script');
    script.type = 'application/javascript';
    script.src = 'https://a.exoclick.com/ads.js';
    script.setAttribute('data-idzone', zoneId);
    script.setAttribute('data-type', 'native');
    script.async = true;

    adRef.current.appendChild(script);

    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [zoneId]);

  return <div ref={adRef} className={`ad-native ${className}`} />;
}
