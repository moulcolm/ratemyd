'use client';

import { Star, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionTier } from '@prisma/client';

interface PremiumBadgeProps {
  tier: SubscriptionTier;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function PremiumBadge({ tier, size = 'md', showText = false, className }: PremiumBadgeProps) {
  if (tier === 'FREE') return null;

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const config = {
    PREMIUM: {
      icon: Star,
      color: 'text-purple-400',
      label: 'Premium',
      gradient: 'from-purple-500 to-pink-500',
    },
    VIP: {
      icon: Crown,
      color: 'text-yellow-400',
      label: 'VIP',
      gradient: 'from-yellow-500 to-amber-500',
    },
  };

  const { icon: Icon, color, label, gradient } = config[tier];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        color,
        className
      )}
      title={label}
    >
      <Icon className={cn(sizes[size], 'fill-current')} />
      {showText && (
        <span
          className={cn(
            'text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent',
            gradient
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
