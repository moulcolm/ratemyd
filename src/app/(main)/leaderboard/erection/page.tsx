'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  CheckCircle,
  Flame,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EloDisplay } from '@/components/shared/EloDisplay';
import { PhotoLightbox } from '@/components/shared/PhotoLightbox';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  photoId: string;
  imageUrl: string;
  thumbnailUrl: string;
  elo: number;
  totalVotes: number;
  wins: number;
  winRate: number;
  isVerified: boolean;
  declaredLength: number | null;
  verifiedLength: number | null;
  category: string;
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
  return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
}

function getRankBg(rank: number) {
  if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
  if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
  if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30';
  return 'bg-gray-800/50 border-gray-700/50';
}

export default function ErectionLeaderboardPage() {
  const t = useTranslations('leaderboard');
  const tCommon = useTranslations('common');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const categories = [
    { id: 'global', label: t('categories.global'), href: '/leaderboard', icon: Trophy },
    { id: 'repos', label: t('categories.repos'), href: '/leaderboard/repos', icon: Medal },
    { id: 'erection', label: t('categories.erection'), href: '/leaderboard/erection', icon: Flame },
    { id: 'grower', label: t('categories.grower'), href: '/leaderboard/grower', icon: TrendingUp },
    { id: 'verified', label: t('categories.verified'), href: '/leaderboard/verified', icon: CheckCircle },
  ];

  const { data, isLoading } = useQuery<{ data: { leaderboard: LeaderboardEntry[] } }>({
    queryKey: ['leaderboard', 'erection'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/erection?limit=50');
      return res.json();
    },
  });

  const leaderboard = Array.isArray(data?.data?.leaderboard) ? data.data.leaderboard : [];

  const photos = leaderboard
    .filter((entry) => entry.imageUrl)
    .map((entry) => ({
      url: entry.imageUrl,
      label: `Rank #${entry.rank} - ELO ${entry.elo}`,
    }));

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('erection.title')}</h1>
          <p className="text-gray-400">{t('erection.subtitle')}</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                cat.id === 'erection'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              )}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text={tCommon('loading')} />
          </div>
        ) : leaderboard.length === 0 ? (
          <Card variant="bordered" className="text-center py-12">
            <Flame className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('empty.title')}</h3>
            <p className="text-gray-400">{t('empty.description')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.photoId}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01]',
                  getRankBg(entry.rank)
                )}
              >
                <div className="w-12 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                <button
                  onClick={() => openLightbox(index)}
                  className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                >
                  <Image
                    src={entry.thumbnailUrl || entry.imageUrl}
                    alt={`Rank ${entry.rank}`}
                    fill
                    className="object-cover"
                  />
                  {entry.isVerified && (
                    <div className="absolute top-1 right-1">
                      <VerifiedBadge size="sm" />
                    </div>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <EloDisplay elo={entry.elo} />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {entry.wins}/{entry.totalVotes} {t('stats.wins')} ({entry.winRate.toFixed(0)}%)
                  </div>
                </div>

                <div className="text-right">
                  {entry.verifiedLength ? (
                    <div className="text-green-400 font-medium">
                      {entry.verifiedLength} cm ✓
                    </div>
                  ) : entry.declaredLength ? (
                    <div className="text-gray-400">
                      {entry.declaredLength} cm
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo lightbox */}
        <PhotoLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          photos={photos}
          currentIndex={selectedPhotoIndex}
          onNavigate={setSelectedPhotoIndex}
        />
      </div>
    </div>
  );
}
