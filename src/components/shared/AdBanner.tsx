'use client';

import { cn } from '@/lib/utils';

interface AdBannerProps {
  slot: 'sidebar' | 'banner' | 'footer';
  className?: string;
}

export function AdBanner({ slot, className }: AdBannerProps) {
  const dimensions = {
    sidebar: 'w-full h-[250px]',
    banner: 'w-full h-[90px]',
    footer: 'w-full h-[60px]',
  };

  return (
    <div
      className={cn(
        'bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center',
        dimensions[slot],
        className
      )}
    >
      <div className="text-center text-gray-500">
        <p className="text-xs uppercase tracking-wide">Publicité</p>
        <p className="text-sm mt-1">
          Passez{' '}
          <a href="/subscription" className="text-purple-400 hover:underline">
            Premium
          </a>{' '}
          pour supprimer les pubs
        </p>
      </div>
    </div>
  );
}
