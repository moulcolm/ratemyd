'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AdInterstitialProps {
  zoneId: string;
  onClose: () => void;
  autoCloseSeconds?: number;
}

export function AdInterstitial({
  zoneId,
  onClose,
  autoCloseSeconds = 5,
}: AdInterstitialProps) {
  const [countdown, setCountdown] = useState(autoCloseSeconds);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (zoneId === 'demo') return;

    // Load ExoClick interstitial
    const script = document.createElement('script');
    script.type = 'application/javascript';
    script.src = 'https://a.exoclick.com/ads.js';
    script.setAttribute('data-idzone', zoneId);
    script.setAttribute('data-type', 'interstitial');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [zoneId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="relative bg-gray-900 rounded-xl p-4 max-w-lg w-full mx-4">
        {/* Close button */}
        <button
          onClick={canClose ? onClose : undefined}
          disabled={!canClose}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            canClose
              ? 'bg-gray-700 hover:bg-gray-600 text-white cursor-pointer'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canClose ? <X className="w-4 h-4" /> : countdown}
        </button>

        {/* Ad container */}
        <div
          id={`interstitial-${zoneId}`}
          className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center"
        >
          <span className="text-gray-600">Loading ad...</span>
        </div>

        {/* Skip text */}
        <p className="text-center text-gray-500 text-sm mt-4">
          {canClose ? 'Click X to continue' : `Ad closes in ${countdown}s`}
        </p>
      </div>
    </div>
  );
}
