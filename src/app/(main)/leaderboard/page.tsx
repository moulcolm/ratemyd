'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Image from 'next/image';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Flame,
} from 'lucide-react';
import { Card, Badge, Tabs } from '@/components/ui';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EloDisplay } from '@/components/shared/EloDisplay';
import { PhotoLightbox } from '@/components/shared/PhotoLightbox';
import { AdBanner, AdNative } from '@/components/ads';
import { AD_ZONES, AD_RULES } from '@/lib/ads-config';
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


  const [activeTab, setActiveTab] = useState('global');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories = [
    { id: 'global', label: 'Global', href: '/leaderboard', icon: Trophy },
    { id: 'repos', label: 'Flaccid', href: '/leaderboard/repos', icon: Medal },
    { id: 'erection', label: 'Erect', href: '/leaderboard/erection', icon: Flame },
    { id: 'grower', label: 'Grower', href: '/leaderboard/grower', icon: TrendingUp },
    { id: 'verified', label: 'Verified', href: '/leaderboard/verified', icon: CheckCircle },
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

  // Pagination logic
  const restOfLeaderboard = leaderboard.slice(3);
  const totalPages = Math.ceil(restOfLeaderboard.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntries = restOfLeaderboard.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      {/* Header banner */}
      <div className="flex justify-center mb-8">
        <AdBanner
          zoneId={AD_ZONES.BANNER_728x90_HEADER}
          size="728x90"
          className="hidden md:flex"
        />
        <AdBanner
          zoneId={AD_ZONES.BANNER_300x100_MOBILE}
          size="300x100"
          className="md:hidden"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            {'Leaderboard'}
          </h1>
          <p className="text-lg text-gray-300">{'Top ranked photos based on community votes'}</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200',
                cat.id === 'global'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50'
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
            <LoadingSpinner size="lg" text={'Loading...'} />
          </div>
        ) : leaderboard.length === 0 ? (
          <Card variant="bordered" className="text-center py-16 bg-gray-800/50 border-gray-700/50">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">{'No Rankings Yet'}</h3>
            <p className="text-gray-300">{'Be the first to upload and compete'}</p>
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
                    {entry.winRate.toFixed(0)}% {'wins'}
                  </div>
                  {entry.verifiedLength && (
                    <Badge variant="premium" className="mt-2">
                      {entry.verifiedLength} cm
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Rest of leaderboard with pagination */}
            {paginatedEntries.map((entry, idx) => (
              <>
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
                  onClick={() => openLightbox(3 + startIndex + idx)}
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
                      {entry.category === 'REPOS' ? 'Flaccid' : 'Erect'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {entry.wins}/{entry.totalVotes} {'wins'} ({entry.winRate.toFixed(0)}%)
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

              {/* Native ad every N rows */}
              {(idx + 1) % AD_RULES.LEADERBOARD_AD_EVERY_N_ROWS === 0 && (
                <div key={`ad-${idx}`} className="p-4">
                  <AdNative
                    zoneId={AD_ZONES.NATIVE_LEADERBOARD}
                    className="w-full"
                  />
                </div>
              )}
              </>
            ))}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'w-10 h-10 rounded-lg font-medium transition-colors',
                        currentPage === page
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
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

          {/* Sidebar with ad */}
          <div className="hidden lg:block w-[300px] flex-shrink-0">
            <div className="sticky top-24">
              <AdBanner
                zoneId={AD_ZONES.BANNER_300x250_SIDEBAR}
                size="300x250"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
