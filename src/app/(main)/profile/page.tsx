'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
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
import { PremiumBadge } from '@/components/shared/PremiumBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EloDisplay } from '@/components/shared/EloDisplay';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  subscriptionTier: string;
  isAdmin: boolean;
  bonusVotes: number;
  bonusPhotoSlots: number;
  createdAt: string;
}

interface UserStats {
  totalPhotos: number;
  approvedPhotos: number;
  verifiedPhotos: number;
  totalVotesReceived: number;
  totalWins: number;
  totalDraws: number;
  winRate: number;
  bestElo: number;
  averageElo: number;
  achievements: number;
}

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { data: session } = useSession();

  const menuItems = [
    { href: '/profile', icon: User, label: t('menu.profile'), active: true },
    { href: '/profile/photos', icon: Camera, label: t('menu.photos') },
    { href: '/profile/stats', icon: BarChart3, label: t('menu.stats') },
    { href: '/profile/achievements', icon: Trophy, label: t('menu.achievements') },
    { href: '/profile/settings', icon: Settings, label: t('menu.settings') },
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
        <LoadingSpinner size="lg" text={t('loadingProfile')} />
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
            {/* Profile header */}
            <Card variant="bordered" className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold">
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{profile?.username}</h1>
                    {profile?.subscriptionTier !== 'FREE' && (
                      <PremiumBadge tier={profile?.subscriptionTier as 'PREMIUM' | 'VIP'} />
                    )}
                    {profile?.isAdmin && (
                      <Badge variant="danger">Admin</Badge>
                    )}
                  </div>
                  <p className="text-gray-400">{profile?.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('memberSince', { date: new Date(profile?.createdAt || '').toLocaleDateString('fr-FR', {
                      month: 'long',
                      year: 'numeric',
                    })})}
                  </p>
                </div>

                <Link href="/subscription">
                  <Button variant={profile?.subscriptionTier === 'FREE' ? 'primary' : 'outline'}>
                    {profile?.subscriptionTier === 'FREE' ? t('upgradeToPremium') : t('manageSubscription')}
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card variant="bordered" className="p-4 text-center">
                <Camera className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats?.approvedPhotos || 0}</div>
                <div className="text-sm text-gray-400">{t('activePhotos')}</div>
              </Card>

              <Card variant="bordered" className="p-4 text-center">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats?.totalWins || 0}</div>
                <div className="text-sm text-gray-400">{t('wins')}</div>
              </Card>

              <Card variant="bordered" className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats?.winRate?.toFixed(0) || 0}%</div>
                <div className="text-sm text-gray-400">{t('winRate')}</div>
              </Card>

              <Card variant="bordered" className="p-4 text-center">
                <Star className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats?.bestElo || 1000}</div>
                <div className="text-sm text-gray-400">{t('bestElo')}</div>
              </Card>
            </div>

            {/* Subscription info */}
            <Card variant="bordered" className="p-6">
              <h3 className="text-lg font-bold mb-4">{t('yourSubscription')}</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className={cn(
                      'w-6 h-6',
                      profile?.subscriptionTier === 'VIP' ? 'text-yellow-400' :
                      profile?.subscriptionTier === 'PREMIUM' ? 'text-purple-400' :
                      'text-gray-500'
                    )} />
                    <span className="font-medium">
                      {profile?.subscriptionTier === 'VIP' ? 'VIP' :
                       profile?.subscriptionTier === 'PREMIUM' ? 'Premium' :
                       'Free'}
                    </span>
                  </div>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {profile?.subscriptionTier === 'VIP' ? t('unlimitedVotes') :
                       profile?.subscriptionTier === 'PREMIUM' ? t('votesPerDay', { count: 100 }) :
                       t('votesPerDay', { count: 20 })}
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {profile?.subscriptionTier === 'VIP' ? t('photosMax', { count: 10 }) :
                       profile?.subscriptionTier === 'PREMIUM' ? t('photosMax', { count: 5 }) :
                       t('photosMax', { count: 1 })}
                    </li>
                    {profile?.subscriptionTier !== 'FREE' && (
                      <li className="flex items-center gap-2 text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {t('noAds')}
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3">{t('activeBonus')}</h4>
                  <div className="space-y-2">
                    {profile?.bonusVotes && profile.bonusVotes > 0 ? (
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <span className="text-gray-400">{t('bonusVotes')}</span>
                        <span className="font-bold text-green-400">+{profile.bonusVotes}</span>
                      </div>
                    ) : null}
                    {profile?.bonusPhotoSlots && profile.bonusPhotoSlots > 0 ? (
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <span className="text-gray-400">{t('bonusPhotoSlots')}</span>
                        <span className="font-bold text-green-400">+{profile.bonusPhotoSlots}</span>
                      </div>
                    ) : null}
                    {(!profile?.bonusVotes || profile.bonusVotes === 0) &&
                     (!profile?.bonusPhotoSlots || profile.bonusPhotoSlots === 0) && (
                      <p className="text-gray-500 text-sm">{t('noActiveBonus')}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent activity */}
            <Card variant="bordered" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{t('recentActivity')}</h3>
                <Link href="/profile/stats" className="text-purple-400 text-sm hover:underline">
                  {t('viewAll')}
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t('votesReceived', { count: stats?.totalVotesReceived || 0 })}</p>
                    <p className="text-sm text-gray-400">{t('onAllPhotos')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t('avgElo', { elo: stats?.averageElo || 1000 })}</p>
                    <p className="text-sm text-gray-400">{t('globalPerformance')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t('achievementsCount', { count: stats?.achievements || 0 })}</p>
                    <p className="text-sm text-gray-400">{t('unlocked')}</p>
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
