'use client';

import { CheckCircle } from 'lucide-react';
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

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-green-400',
        className
      )}
      title="Taille vérifiée"
    >
      <CheckCircle className={sizes[size]} />
      {showText && <span className="text-sm font-medium">Vérifié</span>}
    </span>
  );
}
