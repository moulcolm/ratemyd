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
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Card, Badge, Tabs } from '@/components/ui';
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

export default function LeaderboardPage() {
  const t = useTranslations('leaderboard');
  const tCommon = useTranslations('common');
  const [activeTab, setActiveTab] = useState('global');
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
    queryKey: ['leaderboard', 'global'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/global?limit=50');
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
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-400">{t('subtitle')}</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                cat.id === 'global'
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
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('empty.title')}</h3>
            <p className="text-gray-400">{t('empty.description')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Top 3 podium */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {leaderboard.slice(0, 3).map((entry, index) => (
                <div
                  key={entry.photoId}
                  className={cn(
                    'relative rounded-xl overflow-hidden border-2 p-4 text-center',
                    index === 0 && 'col-start-2 row-start-1 border-yellow-500 bg-yellow-500/10',
                    index === 1 && 'col-start-1 row-start-1 border-gray-400 bg-gray-400/10 mt-8',
                    index === 2 && 'col-start-3 row-start-1 border-amber-600 bg-amber-600/10 mt-8'
                  )}
                >
                  <div className="mb-2">{getRankIcon(entry.rank)}</div>
                  <button
                    onClick={() => openLightbox(index)}
                    className="relative w-20 h-20 mx-auto rounded-lg overflow-hidden mb-3 cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
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
                  <EloDisplay elo={entry.elo} size="lg" />
                  <div className="text-sm text-gray-400 mt-1">
                    {entry.winRate.toFixed(0)}% {t('stats.wins')}
                  </div>
                  {entry.verifiedLength && (
                    <Badge variant="premium" className="mt-2">
                      {entry.verifiedLength} cm
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Rest of leaderboard */}
            {leaderboard.slice(3).map((entry, idx) => (
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
                  onClick={() => openLightbox(idx + 3)}
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
                    <Badge variant="secondary" className="text-xs">
                      {entry.category === 'REPOS' ? t('categories.repos') : t('categories.erection')}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {entry.wins}/{entry.totalVotes} {t('stats.wins')} ({entry.winRate.toFixed(0)}%)
                  </div>
                </div>

                <div className="text-right">
                  {entry.verifiedLength ? (
                    <div className="text-green-400 font-medium">
                      {entry.verifiedLength} cm
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

        {/* View more link */}
        {leaderboard.length >= 50 && (
          <div className="text-center mt-8">
            <p className="text-gray-500">{t('viewMore')}</p>
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
