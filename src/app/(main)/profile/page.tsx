'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Camera,
  BarChart3,
  Trophy,
  Settings,
  Crown,
  Star,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EloDisplay } from '@/components/shared/EloDisplay';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  bonusPhotoSlots: number;
  createdAt: string;
}

interface UserStats {
  totalPhotos?: number;
  approvedPhotos?: number;
  verifiedPhotos?: number;
  totalVotesReceived: number;
  totalWins: number;
  totalDraws?: number;
  winRate: number;
  bestElo: number;
  averageElo: number;
  achievements?: number;
}

export default function ProfilePage() {
  const menuItems = [
    { href: '/profile', icon: User, label: 'Profile', active: true },
    { href: '/profile/photos', icon: Camera, label: 'My Photos' },
    { href: '/profile/stats', icon: BarChart3, label: 'Statistics' },
    { href: '/profile/achievements', icon: Trophy, label: 'Achievements' },
    { href: '/profile/settings', icon: Settings, label: 'Settings' },
  ];

  const { data: profileData, isLoading: profileLoading } = useQuery<{ data: UserProfile }>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/user/profile');
      return res.json();
    },
  });

  const { data: statsData, isLoading: statsLoading } = useQuery<{ data: UserStats }>({
    queryKey: ['userStats'],
    queryFn: async () => {
      const res = await fetch('/api/user/stats');
      return res.json();
    },
  });

  const profile = profileData?.data;
  const stats = statsData?.data;
  const isLoading = profileLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="bordered" className="p-4 bg-gradient-to-b from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium',
                      item.active
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
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
            {/* Profile header */}
            <Card variant="bordered" className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold shadow-2xl shadow-purple-500/50 ring-4 ring-purple-500/20">
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {profile?.username}
                    </h1>
                    {profile?.isAdmin && (
                      <Badge variant="danger" className="shadow-lg shadow-red-500/30">Admin</Badge>
                    )}
                  </div>
                  <p className="text-gray-300 text-lg">{profile?.email}</p>
                  <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Member since {new Date(profile?.createdAt || '').toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card variant="bordered" className="p-4 text-center">
                <Camera className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats?.approvedPhotos || 0}</div>
                <div className="text-sm text-gray-400">Active Photos</div>
              </Card>

              <Card variant="bordered" className="p-4 text-center">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats?.totalWins || 0}</div>
                <div className="text-sm text-gray-400">Wins</div>
              </Card>

              <Card variant="bordered" className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats?.winRate?.toFixed(0) || 0}%</div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </Card>

              <Card variant="bordered" className="p-4 text-center">
                <Star className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats?.bestElo || 1000}</div>
                <div className="text-sm text-gray-400">Best ELO</div>
              </Card>
            </div>

            {/* Account info */}
            <Card variant="bordered" className="p-6">
              <h3 className="text-lg font-bold mb-4">Your Account</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span className="font-medium">Free Account</span>
                  </div>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Unlimited votes
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Up to 4 photos
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Active Bonuses</h4>
                  <div className="space-y-2">
                    {profile?.bonusPhotoSlots && profile.bonusPhotoSlots > 0 ? (
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <span className="text-gray-400">Bonus photo slots</span>
                        <span className="font-bold text-green-400">+{profile.bonusPhotoSlots}</span>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No active bonuses</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent activity */}
            <Card variant="bordered" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Recent Activity</h3>
                <Link href="/profile/stats" className="text-purple-400 text-sm hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{stats?.totalVotesReceived || 0} votes received</p>
                    <p className="text-sm text-gray-400">On all photos</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Average ELO: {stats?.averageElo || 1000}</p>
                    <p className="text-sm text-gray-400">Overall performance</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{stats?.achievements || 0} achievements</p>
                    <p className="text-sm text-gray-400">Unlocked</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
