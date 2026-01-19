'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Users,
  Camera,
  Vote,
  Flag,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalPhotos: number;
  pendingPhotos: number;
  totalVotesToday: number;
  pendingReports: number;
  premiumUsers: number;
  vipUsers: number;
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<{ data: DashboardStats }>({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text={'Loading...'} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{'Dashboard'}</h1>
        <p className="text-gray-400">{'Overview of platform activity'}</p>
      </div>

      {/* Main stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card variant="bordered" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <Badge variant="success" className="text-xs">
              +{stats?.newUsersToday || 0} {'today'}
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.totalUsers || 0}</div>
          <div className="text-gray-400 text-sm">{'Users'}</div>
        </Card>

        <Card variant="bordered" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Camera className="w-8 h-8 text-purple-400" />
            {stats?.pendingPhotos ? (
              <Badge variant="warning" className="text-xs">
                {stats.pendingPhotos} {'pending'}
              </Badge>
            ) : null}
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.totalPhotos || 0}</div>
          <div className="text-gray-400 text-sm">{'Photos'}</div>
        </Card>

        <Card variant="bordered" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Vote className="w-8 h-8 text-green-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.totalVotesToday || 0}</div>
          <div className="text-gray-400 text-sm">{'Votes Today'}</div>
        </Card>

        <Card variant="bordered" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Flag className="w-8 h-8 text-red-400" />
            {stats?.pendingReports ? (
              <Badge variant="danger" className="text-xs">
                {stats.pendingReports} {'to handle'}
              </Badge>
            ) : null}
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.pendingReports || 0}</div>
          <div className="text-gray-400 text-sm">{'Reports'}</div>
        </Card>
      </div>

      {/* Premium stats */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Card variant="bordered" className="p-6">
          <h3 className="font-bold mb-4">{'Active Subscriptions'}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Premium</span>
              <span className="font-bold text-purple-400">{stats?.premiumUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">VIP</span>
              <span className="font-bold text-yellow-400">{stats?.vipUsers || 0}</span>
            </div>
            <div className="pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{'Total Paying'}</span>
                <span className="font-bold">{(stats?.premiumUsers || 0) + (stats?.vipUsers || 0)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="bordered" className="p-6">
          <h3 className="font-bold mb-4">{'Quick Actions'}</h3>
          <div className="space-y-2">
            <Link
              href="/admin/photos"
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span>{'Pending Photos'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning">{stats?.pendingPhotos || 0}</Badge>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </div>
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>{'Reports to Handle'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="danger">{stats?.pendingReports || 0}</Badge>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent activity - placeholder */}
      <Card variant="bordered" className="p-6">
        <h3 className="font-bold mb-4">{'Recent Activity'}</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{'Photo approved'}</p>
              <p className="text-sm text-gray-400">{'Just now'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{'New user registered'}</p>
              <p className="text-sm text-gray-400">{'5 minutes ago'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{'New premium subscription'}</p>
              <p className="text-sm text-gray-400">{'15 minutes ago'}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
