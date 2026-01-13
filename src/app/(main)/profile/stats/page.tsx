'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  User,
  Camera,
  BarChart3,
  Trophy,
  Settings,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EloDisplay } from '@/components/shared/EloDisplay';
import { cn } from '@/lib/utils';

interface UserStats {
  totalPhotos: number;
  approvedPhotos: number;
  verifiedPhotos: number;
  totalVotesReceived: number;
  totalWins: number;
  totalDraws: number;
  totalLosses: number;
  winRate: number;
  bestElo: number;
  averageElo: number;
  achievements: number;
}

interface EloHistoryEntry {
  id: string;
  photoId: string;
  oldElo: number;
  newElo: number;
  change: number;
  reason: string;
  createdAt: string;
}

const menuItems = [
  { href: '/profile', icon: User, label: 'Profil' },
  { href: '/profile/photos', icon: Camera, label: 'Mes photos' },
  { href: '/profile/stats', icon: BarChart3, label: 'Statistiques', active: true },
  { href: '/profile/achievements', icon: Trophy, label: 'Achievements' },
  { href: '/profile/settings', icon: Settings, label: 'Paramètres' },
];

export default function ProfileStatsPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery<{ data: UserStats }>({
    queryKey: ['userStats'],
    queryFn: async () => {
      const res = await fetch('/api/user/stats');
      return res.json();
    },
  });

  const { data: historyData, isLoading: historyLoading } = useQuery<{ data: EloHistoryEntry[] }>({
    queryKey: ['eloHistory'],
    queryFn: async () => {
      const res = await fetch('/api/user/elo-history?limit=20');
      return res.json();
    },
  });

  const stats = statsData?.data;
  const history = historyData?.data || [];
  const isLoading = statsLoading || historyLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des statistiques..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="bordered" className="p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      item.active
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold">Statistiques</h1>
              <p className="text-gray-400">Analysez vos performances</p>
            </div>

            {/* Main stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card variant="bordered" className="p-4">
                <div className="text-gray-400 text-sm mb-1">Votes reçus</div>
                <div className="text-3xl font-bold">{stats?.totalVotesReceived || 0}</div>
              </Card>

              <Card variant="bordered" className="p-4">
                <div className="text-gray-400 text-sm mb-1">Victoires</div>
                <div className="text-3xl font-bold text-green-400">{stats?.totalWins || 0}</div>
              </Card>

              <Card variant="bordered" className="p-4">
                <div className="text-gray-400 text-sm mb-1">Égalités</div>
                <div className="text-3xl font-bold text-yellow-400">{stats?.totalDraws || 0}</div>
              </Card>

              <Card variant="bordered" className="p-4">
                <div className="text-gray-400 text-sm mb-1">Défaites</div>
                <div className="text-3xl font-bold text-red-400">{stats?.totalLosses || 0}</div>
              </Card>
            </div>

            {/* Win rate */}
            <Card variant="bordered" className="p-6">
              <h3 className="text-lg font-bold mb-4">Taux de victoire</h3>

              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      strokeWidth="12"
                      fill="none"
                      className="stroke-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      strokeWidth="12"
                      fill="none"
                      className="stroke-green-500"
                      strokeDasharray={`${(stats?.winRate || 0) * 3.52} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{stats?.winRate?.toFixed(0) || 0}%</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Victoires</span>
                      <span className="text-green-400">{stats?.totalWins || 0}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${stats?.winRate || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Égalités</span>
                      <span className="text-yellow-400">{stats?.totalDraws || 0}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{
                          width: `${stats?.totalVotesReceived ? (stats.totalDraws / stats.totalVotesReceived) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Défaites</span>
                      <span className="text-red-400">{stats?.totalLosses || 0}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{
                          width: `${stats?.totalVotesReceived ? (stats.totalLosses / stats.totalVotesReceived) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ELO stats */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card variant="bordered" className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <span className="text-gray-400">Meilleur ELO</span>
                </div>
                <div className="text-3xl font-bold">{stats?.bestElo || 1000}</div>
              </Card>

              <Card variant="bordered" className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  <span className="text-gray-400">ELO moyen</span>
                </div>
                <div className="text-3xl font-bold">{stats?.averageElo || 1000}</div>
              </Card>
            </div>

            {/* ELO History */}
            <Card variant="bordered" className="p-6">
              <h3 className="text-lg font-bold mb-4">Historique ELO récent</h3>

              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun historique pour le moment
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        entry.change > 0 ? 'bg-green-500/20' :
                        entry.change < 0 ? 'bg-red-500/20' :
                        'bg-gray-500/20'
                      )}>
                        {entry.change > 0 ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : entry.change < 0 ? (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        ) : (
                          <Minus className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {entry.oldElo} → {entry.newElo}
                          </span>
                          <span className={cn(
                            'text-sm font-bold',
                            entry.change > 0 ? 'text-green-400' :
                            entry.change < 0 ? 'text-red-400' :
                            'text-gray-400'
                          )}>
                            {entry.change > 0 ? '+' : ''}{entry.change}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {entry.reason === 'VOTE_WIN' ? 'Victoire' :
                           entry.reason === 'VOTE_LOSS' ? 'Défaite' :
                           entry.reason === 'VOTE_DRAW' ? 'Égalité' :
                           entry.reason}
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
