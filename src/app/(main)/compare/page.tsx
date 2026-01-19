'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Image from 'next/image';
import {
  Minus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Crown,
  Star,
  Filter,
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';

interface Photo {
  id: string;
  imageUrl: string;
  category: string;
  isVerified: boolean;
  declaredLength: number | null;
}

interface PhotoPair {
  leftPhoto: Photo;
  rightPhoto: Photo;
  category: string;
}

interface RemainingVotes {
  remaining: number;
  limit: number;
  isUnlimited: boolean;
}

export default function ComparePage() {
  
  
  
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [category, setCategory] = useState<'REPOS' | 'ERECTION' | 'MIXED'>('MIXED');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | 'draw' | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  // Fetch photo pair
  const {
    data: pairData,
    isLoading: isPairLoading,
    refetch: refetchPair,
    error: pairError,
  } = useQuery<{ data: PhotoPair }>({
    queryKey: ['photoPair', category, verifiedOnly],
    queryFn: async () => {
      const res = await fetch(
        `/api/compare/pair?category=${category}&verifiedOnly=${verifiedOnly}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error');
      }
      return res.json();
    },
    retry: false,
  });

  // Fetch remaining votes
  const { data: remainingData, refetch: refetchRemaining } = useQuery<{ data: RemainingVotes }>({
    queryKey: ['remainingVotes'],
    queryFn: async () => {
      const res = await fetch('/api/compare/remaining');
      return res.json();
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (result: 'LEFT_WINS' | 'RIGHT_WINS' | 'DRAW') => {
      const res = await fetch('/api/compare/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leftPhotoId: pairData?.data.leftPhoto.id,
          rightPhotoId: pairData?.data.rightPhoto.id,
          result,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      return res.json();
    },
    onSuccess: () => {
      refetchRemaining();
      setTimeout(() => {
        setSelectedSide(null);
        setIsVoting(false);
        refetchPair();
      }, 500);
    },
    onError: (error: Error) => {
      setSelectedSide(null);
      setIsVoting(false);
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message,
      });
    },
  });

  const handleVote = useCallback(
    (side: 'left' | 'right' | 'draw') => {
      if (isVoting || !pairData?.data) return;

      setSelectedSide(side);
      setIsVoting(true);

      const result =
        side === 'left' ? 'LEFT_WINS' : side === 'right' ? 'RIGHT_WINS' : 'DRAW';

      voteMutation.mutate(result);
    },
    [isVoting, pairData, voteMutation]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVoting) return;

      switch (e.key) {
        case 'ArrowLeft':
        case '1':
          handleVote('left');
          break;
        case 'ArrowRight':
        case '2':
          handleVote('right');
          break;
        case 'ArrowDown':
        case '3':
          handleVote('draw');
          break;
        case 'r':
        case 'R':
          refetchPair();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleVote, isVoting, refetchPair]);

  const remaining = remainingData?.data;
  const pair = pairData?.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
              {'Compare Photos'}
            </h1>
            <p className="text-lg text-gray-300">
              {'Vote for your favorite in head-to-head comparisons'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            {/* Remaining votes */}
            {remaining && (
              <div className="px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-sm">
                {remaining.isUnlimited ? (
                  <span className="text-green-400 font-semibold">{'∞ Unlimited votes'}</span>
                ) : (
                  <span className="text-gray-300">
                    <span className="text-white font-bold text-lg">{remaining.remaining}</span>
                    <span className="text-gray-400">/{remaining.limit}</span> {'votes left'}
                  </span>
                )}
              </div>
            )}

            {/* Category selector */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1.5">
              {(['MIXED', 'REPOS', 'ERECTION'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                    category === cat
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  )}
                >
                  {cat === 'MIXED' ? 'Mixed' : cat === 'REPOS' ? 'Flaccid' : 'Erect'}
                </button>
              ))}
            </div>

            {/* Verified filter */}
            <Button
              variant={verifiedOnly ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              leftIcon={<Filter className="w-4 h-4" />}
              className={verifiedOnly ? 'shadow-lg shadow-purple-500/30' : ''}
            >
              {'Verified'}
            </Button>
          </div>
        </motion.div>

        {/* Main content */}
        {isPairLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" text={'Loading photos...'} />
          </div>
        ) : pairError ? (
          <Card variant="bordered" className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {(pairError as Error).message}
            </h3>
            <p className="text-gray-400 mb-6">
              {verifiedOnly
                ? 'Try disabling the verified filter'
                : 'Not enough photos available'}
            </p>
            <Button onClick={() => refetchPair()}>{'Retry'}</Button>
          </Card>
        ) : pair ? (
          <>
            {/* Category badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-8"
            >
              <Badge variant={pair.category === 'REPOS' ? 'primary' : 'premium'} className="text-base px-6 py-2">
                <span className="font-semibold">
                  {pair.category === 'REPOS' ? '🌙 Flaccid' : '🔥 Erect'}
                </span>
              </Badge>
            </motion.div>

            {/* Photo comparison */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {/* Left photo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVote('left')}
                className={cn(
                  'relative cursor-pointer rounded-2xl overflow-hidden border-4 transition-all duration-300 group',
                  selectedSide === 'left'
                    ? 'border-green-500 ring-8 ring-green-500/30 shadow-2xl shadow-green-500/50'
                    : 'border-transparent hover:border-purple-500/70 hover:shadow-2xl hover:shadow-purple-500/30'
                )}
              >
                <div className="aspect-[3/4] relative bg-gradient-to-br from-gray-900 to-gray-800">
                  <Image
                    src={pair.leftPhoto.imageUrl}
                    alt={'Left photo'}
                    fill
                    className="object-cover"
                    priority
                  />
                  {selectedSide === 'left' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                    >
                      <CheckCircle className="w-20 h-20 text-green-400" />
                    </motion.div>
                  )}
                </div>

                {/* Photo info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {pair.leftPhoto.isVerified && <VerifiedBadge />}
                      {pair.leftPhoto.declaredLength && (
                        <span className="text-sm text-gray-300">
                          {pair.leftPhoto.declaredLength} cm
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      Press 1 or ←
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Right photo */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVote('right')}
                className={cn(
                  'relative cursor-pointer rounded-2xl overflow-hidden border-4 transition-all duration-300 group',
                  selectedSide === 'right'
                    ? 'border-green-500 ring-8 ring-green-500/30 shadow-2xl shadow-green-500/50'
                    : 'border-transparent hover:border-purple-500/70 hover:shadow-2xl hover:shadow-purple-500/30'
                )}
              >
                <div className="aspect-[3/4] relative bg-gradient-to-br from-gray-900 to-gray-800">
                  <Image
                    src={pair.rightPhoto.imageUrl}
                    alt={'Right photo'}
                    fill
                    className="object-cover"
                    priority
                  />
                  {selectedSide === 'right' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                    >
                      <CheckCircle className="w-20 h-20 text-green-400" />
                    </motion.div>
                  )}
                </div>

                {/* Photo info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {pair.rightPhoto.isVerified && <VerifiedBadge />}
                      {pair.rightPhoto.declaredLength && (
                        <span className="text-sm text-gray-300">
                          {pair.rightPhoto.declaredLength} cm
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      Press 2 or →
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleVote('draw')}
                disabled={isVoting}
                leftIcon={<Minus className="w-5 h-5" />}
                className={cn(
                  selectedSide === 'draw' && 'border-yellow-500 text-yellow-400'
                )}
              >
                {'Draw'} (3 / ↓)
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => refetchPair()}
                disabled={isVoting}
                leftIcon={<RefreshCw className="w-5 h-5" />}
              >
                {'Skip'} (R)
              </Button>
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-sm text-gray-500 mt-6">
              {'Use keyboard shortcuts or click to vote'}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
