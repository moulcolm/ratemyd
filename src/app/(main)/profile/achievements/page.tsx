'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import {
  User,
  Camera,
  BarChart3,
  Trophy,
  Settings,
  Lock,
  Star,
  Crown,
  Zap,
  Target,
  Award,
  Flame,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlockedAt?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy,
  Star,
  Crown,
  Zap,
  Target,
  Award,
  Flame,
};

function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'COMMON':
      return 'border-gray-500 bg-gray-500/10';
    case 'RARE':
      return 'border-blue-500 bg-blue-500/10';
    case 'EPIC':
      return 'border-purple-500 bg-purple-500/10';
    case 'LEGENDARY':
      return 'border-yellow-500 bg-yellow-500/10';
    default:
      return 'border-gray-500 bg-gray-500/10';
  }
}

export default function ProfileAchievementsPage() {
  
  

  const menuItems = [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/profile/photos', icon: Camera, label: 'Photos' },
    { href: '/profile/stats', icon: BarChart3, label: 'Stats' },
    { href: '/profile/achievements', icon: Trophy, label: 'Achievements', active: true },
    { href: '/profile/settings', icon: Settings, label: 'Settings' },
  ];

  function getRarityBadge(rarity: string) {
    switch (rarity) {
      case 'COMMON':
        return <Badge variant="secondary">{'Common'}</Badge>;
      case 'RARE':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{'Rare'}</Badge>;
      case 'EPIC':
        return <Badge variant="premium">{'Epic'}</Badge>;
      case 'LEGENDARY':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{'Legendary'}</Badge>;
      default:
        return <Badge variant="secondary">{rarity}</Badge>;
    }
  }

  const { data, isLoading } = useQuery<{ data: { unlocked: Achievement[]; locked: Achievement[] } }>({
    queryKey: ['achievements'],
    queryFn: async () => {
      const res = await fetch('/api/user/achievements');
      return res.json();
    },
  });

  const unlocked = data?.data?.unlocked || [];
  const locked = data?.data?.locked || [];
  const total = unlocked.length + locked.length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text={'Loading achievements...'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="bordered" className="p-4 bg-gray-800/50 border-gray-700/50">
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
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {'Achievements'}
              </h1>
              <p className="text-gray-300 mt-1">
                {'Unlock achievements by completing challenges and milestones'}
              </p>
            </div>

            {/* Progress */}
            <Card variant="bordered" className="p-6 bg-gray-800/50 border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold">{'Progress'}</h3>
                  <p className="text-sm text-gray-400">
                    {unlocked.length} of {total} unlocked
                  </p>
                </div>
                <div className="text-3xl font-bold text-purple-400">
                  {Math.round((unlocked.length / (total || 1)) * 100)}%
                </div>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                  style={{ width: `${(unlocked.length / (total || 1)) * 100}%` }}
                />
              </div>
            </Card>

            {/* Unlocked achievements */}
            {unlocked.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Unlocked ({unlocked.length})
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {unlocked.map((achievement) => {
                    const IconComponent = iconMap[achievement.icon] || Trophy;
                    return (
                      <Card
                        key={achievement.id}
                        variant="bordered"
                        className={cn('p-4 border-2', getRarityColor(achievement.rarity))}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'w-12 h-12 rounded-lg flex items-center justify-center',
                            achievement.rarity === 'LEGENDARY' ? 'bg-yellow-500/20' :
                            achievement.rarity === 'EPIC' ? 'bg-purple-500/20' :
                            achievement.rarity === 'RARE' ? 'bg-blue-500/20' :
                            'bg-gray-500/20'
                          )}>
                            <IconComponent className={cn(
                              'w-6 h-6',
                              achievement.rarity === 'LEGENDARY' ? 'text-yellow-400' :
                              achievement.rarity === 'EPIC' ? 'text-purple-400' :
                              achievement.rarity === 'RARE' ? 'text-blue-400' :
                              'text-gray-400'
                            )} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold">{achievement.name}</h4>
                              {getRarityBadge(achievement.rarity)}
                            </div>
                            <p className="text-sm text-gray-400 mb-2">
                              {achievement.description}
                            </p>
                            {achievement.unlockedAt && (
                              <p className="text-xs text-gray-500">
                                Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Locked achievements */}
            {locked.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-500" />
                  Locked ({locked.length})
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {locked.map((achievement) => (
                    <Card
                      key={achievement.id}
                      variant="bordered"
                      className="p-4 opacity-60"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold">{achievement.name}</h4>
                            {getRarityBadge(achievement.rarity)}
                          </div>
                          <p className="text-sm text-gray-500">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {unlocked.length === 0 && locked.length === 0 && (
              <Card variant="bordered" className="text-center py-16 bg-gray-800/50 border-gray-700/50">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{'No Achievements Yet'}</h3>
                <p className="text-gray-300">
                  {'Start playing to unlock achievements'}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
