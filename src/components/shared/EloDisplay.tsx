'use client';

import { cn } from '@/lib/utils';
import { getEloTier } from '@/lib/elo';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EloDisplayProps {
  elo: number;
  change?: number;
  size?: 'sm' | 'md' | 'lg';
  showTier?: boolean;
  className?: string;
}

export function EloDisplay({ elo, change, size = 'md', showTier = true, className }: EloDisplayProps) {
  const tier = getEloTier(elo);

  const sizes = {
    sm: {
      elo: 'text-lg font-bold',
      tier: 'text-xs',
      change: 'text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      elo: 'text-2xl font-bold',
      tier: 'text-sm',
      change: 'text-sm',
      icon: 'w-4 h-4',
    },
    lg: {
      elo: 'text-4xl font-bold',
      tier: 'text-base',
      change: 'text-base',
      icon: 'w-5 h-5',
    },
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="flex items-center gap-2">
        <span className={cn(sizes[size].elo)} style={{ color: tier.color }}>
          {elo}
        </span>
        {change !== undefined && (
          <span
            className={cn(
              'flex items-center gap-0.5',
              sizes[size].change,
              change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
            )}
          >
            {change > 0 ? (
              <TrendingUp className={sizes[size].icon} />
            ) : change < 0 ? (
              <TrendingDown className={sizes[size].icon} />
            ) : (
              <Minus className={sizes[size].icon} />
            )}
            {change > 0 ? '+' : ''}
            {change}
          </span>
        )}
      </div>
      {showTier && (
        <span className={cn(sizes[size].tier, 'text-gray-400')}>{tier.name}</span>
      )}
    </div>
  );
}
