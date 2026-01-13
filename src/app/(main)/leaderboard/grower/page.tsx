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
import { PhotoLightbox } from '@/components/shared/PhotoLightbox';
import { cn } from '@/lib/utils';

interface GrowerEntry {
  rank: number;
  username: string;
  eloRepos: number;
  eloErection: number;
  growerScore: number;
  isVerified: boolean;
  reposThumbnail: string | null;
  erectionThumbnail: string | null;
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

export default function GrowerLeaderboardPage() {
  const t = useTranslations('leaderboard');
  const tCommon = useTranslations('common');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<{ url: string; label?: string }[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const categories = [
    { id: 'global', label: t('categories.global'), href: '/leaderboard', icon: Trophy },
    { id: 'repos', label: t('categories.repos'), href: '/leaderboard/repos', icon: Medal },
    { id: 'erection', label: t('categories.erection'), href: '/leaderboard/erection', icon: Flame },
    { id: 'grower', label: t('categories.grower'), href: '/leaderboard/grower', icon: TrendingUp },
    { id: 'verified', label: t('categories.verified'), href: '/leaderboard/verified', icon: CheckCircle },
  ];

  const { data, isLoading } = useQuery<{ data: { leaderboard: GrowerEntry[] } }>({
    queryKey: ['leaderboard', 'grower'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/grower?limit=50');
      return res.json();
    },
  });

  const leaderboard = Array.isArray(data?.data?.leaderboard) ? data.data.leaderboard : [];

  const openLightbox = (entry: GrowerEntry, type: 'repos' | 'erection') => {
    const photos: { url: string; label?: string }[] = [];
    if (entry.reposThumbnail) {
      photos.push({ url: entry.reposThumbnail, label: `${entry.username} - ${t('categories.repos')} (ELO ${entry.eloRepos})` });
    }
    if (entry.erectionThumbnail) {
      photos.push({ url: entry.erectionThumbnail, label: `${entry.username} - ${t('categories.erection')} (ELO ${entry.eloErection})` });
    }
    setLightboxPhotos(photos);
    setSelectedPhotoIndex(type === 'repos' ? 0 : (entry.reposThumbnail ? 1 : 0));
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('grower.title')}</h1>
          <p className="text-gray-400">{t('grower.subtitle')}</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                cat.id === 'grower'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              )}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Info box */}
        <Card variant="bordered" className="mb-6 p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">{t('grower.title')}</h4>
              <p className="text-sm text-gray-400">{t('grower.info')}</p>
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text={tCommon('loading')} />
          </div>
        ) : leaderboard.length === 0 ? (
          <Card variant="bordered" className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('empty.title')}</h3>
            <p className="text-gray-400">{t('empty.description')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.username}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01]',
                  getRankBg(entry.rank)
                )}
              >
                <div className="w-12 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="flex gap-2">
                  {entry.reposThumbnail && (
                    <button
                      onClick={() => openLightbox(entry, 'repos')}
                      className="relative w-12 h-12 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                    >
                      <Image
                        src={entry.reposThumbnail}
                        alt={t('categories.repos')}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[10px] text-center py-0.5">
                        {t('categories.repos')}
                      </div>
                    </button>
                  )}
                  {entry.erectionThumbnail && (
                    <button
                      onClick={() => openLightbox(entry, 'erection')}
                      className="relative w-12 h-12 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                    >
                      <Image
                        src={entry.erectionThumbnail}
                        alt={t('categories.erection')}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[10px] text-center py-0.5">
                        {t('categories.erection')}
                      </div>
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.username}</span>
                    {entry.isVerified && <VerifiedBadge size="sm" />}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {t('categories.repos')}: {entry.eloRepos} → {t('categories.erection')}: {entry.eloErection}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-green-400">
                    +{entry.growerScore.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">{t('grower.progression')}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo lightbox */}
        <PhotoLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          photos={lightboxPhotos}
          currentIndex={selectedPhotoIndex}
          onNavigate={setSelectedPhotoIndex}
        />
      </div>
    </div>
  );
}
