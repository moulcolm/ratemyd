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
  Flame,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EloDisplay } from '@/components/shared/EloDisplay';
import { PhotoLightbox } from '@/components/shared/PhotoLightbox';
import { cn } from '@/lib/utils';

interface VerifiedEntry {
  rank: number;
  photoId: string;
  imageUrl: string;
  thumbnailUrl: string;
  elo: number;
  totalVotes: number;
  wins: number;
  winRate: number;
  verifiedLength: number;
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

export default function VerifiedLeaderboardPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const categories = [
    { id: 'global', label: 'Global', href: '/leaderboard', icon: Trophy },
    { id: 'repos', label: 'Flaccid', href: '/leaderboard/repos', icon: Medal },
    { id: 'erection', label: 'Erect', href: '/leaderboard/erection', icon: Flame },
    { id: 'grower', label: 'Grower', href: '/leaderboard/grower', icon: TrendingUp },
    { id: 'verified', label: 'Verified', href: '/leaderboard/verified', icon: CheckCircle },
  ];

  const { data, isLoading } = useQuery<{ data: { leaderboard: VerifiedEntry[] } }>({
    queryKey: ['leaderboard', 'verified'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/verified?limit=50');
      return res.json();
    },
  });

  const leaderboard = Array.isArray(data?.data?.leaderboard) ? data.data.leaderboard : [];

  const photos = leaderboard
    .filter((entry) => entry.imageUrl)
    .map((entry) => ({
      url: entry.imageUrl,
      label: `Rank #${entry.rank} - ${entry.verifiedLength} cm`,
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
          <h1 className="text-3xl font-bold mb-2">Verified Leaderboard</h1>
          <p className="text-gray-400">Top ranked verified photos</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                cat.id === 'verified'
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
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Verified Leaderboard</h4>
              <p className="text-sm text-gray-400">Only photos with verified measurements</p>
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        ) : leaderboard.length === 0 ? (
          <Card variant="bordered" className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Verified Photos</h3>
            <p className="text-gray-400">No verified photos in the leaderboard yet</p>
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
                  <div className="absolute top-1 right-1">
                    <VerifiedBadge size="sm" />
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <EloDisplay elo={entry.elo} />
                    <Badge variant="secondary" className="text-xs">
                      {entry.category === 'REPOS' ? 'Flaccid' : 'Erect'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {entry.wins}/{entry.totalVotes} wins ({entry.winRate.toFixed(0)}%)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-green-400">
                    {entry.verifiedLength} cm
                  </div>
                  <div className="text-xs text-green-500 flex items-center justify-end gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </div>
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
