'use client';

import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function VerifiedBadge({ size = 'md', showText = false, className }: VerifiedBadgeProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const containerSizes = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 bg-green-500 text-white rounded-full shadow-lg shadow-green-500/50',
        containerSizes[size],
        className
      )}
      title="Taille vérifiée"
    >
      <BadgeCheck className={cn(sizes[size], 'fill-white stroke-green-500')} />
      {showText && <span className="text-sm font-bold pr-1">Vérifié</span>}
    </span>
  );
}
