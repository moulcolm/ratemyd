'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-purple-500', sizes[size])} />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
}

export function FullPageLoader({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
}
