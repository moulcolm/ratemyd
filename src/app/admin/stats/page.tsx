'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Users,
  Camera,
  Vote,
  TrendingUp,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface GlobalStats {
  users: {
    total: number;
    free: number;
    premium: number;
    vip: number;
    banned: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  photos: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    verified: number;
  };
  votes: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  revenue: {
    subscriptions: number;
    purchases: number;
    total: number;
  };
}

export default function AdminStatsPage() {
  const { data, isLoading } = useQuery<{ data: GlobalStats }>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      return res.json();
    },
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des statistiques..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Statistiques globales</h1>
        <p className="text-gray-400">Analyse détaillée de la plateforme</p>
      </div>

      {/* Users stats */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Utilisateurs
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1">{stats?.users.total || 0}</div>
            <div className="text-gray-400 text-sm">Total</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1 text-green-400">
              +{stats?.users.newToday || 0}
            </div>
            <div className="text-gray-400 text-sm">Aujourd'hui</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1 text-green-400">
              +{stats?.users.newThisWeek || 0}
            </div>
            <div className="text-gray-400 text-sm">Cette semaine</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1 text-green-400">
              +{stats?.users.newThisMonth || 0}
            </div>
            <div className="text-gray-400 text-sm">Ce mois</div>
          </Card>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mt-4">
          <Card variant="bordered" className="p-4">
            <div className="text-2xl font-bold mb-1">{stats?.users.free || 0}</div>
            <div className="text-gray-400 text-sm">Gratuits</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-2xl font-bold mb-1 text-purple-400">
              {stats?.users.premium || 0}
            </div>
            <div className="text-gray-400 text-sm">Premium</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-2xl font-bold mb-1 text-yellow-400">
              {stats?.users.vip || 0}
            </div>
            <div className="text-gray-400 text-sm">VIP</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-2xl font-bold mb-1 text-red-400">
              {stats?.users.banned || 0}
            </div>
            <div className="text-gray-400 text-sm">Bannis</div>
          </Card>
        </div>
      </section>

      {/* Photos stats */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-purple-400" />
          Photos
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1">{stats?.photos.total || 0}</div>
            <div className="text-gray-400 text-sm">Total</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1 text-green-400">
              {stats?.photos.approved || 0}
            </div>
            <div className="text-gray-400 text-sm">Approuvées</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1 text-yellow-400">
              {stats?.photos.pending || 0}
            </div>
            <div className="text-gray-400 text-sm">En attente</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1 text-red-400">
              {stats?.photos.rejected || 0}
            </div>
            <div className="text-gray-400 text-sm">Rejetées</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1 text-blue-400">
              {stats?.photos.verified || 0}
            </div>
            <div className="text-gray-400 text-sm">Vérifiées</div>
          </Card>
        </div>
      </section>

      {/* Votes stats */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Vote className="w-5 h-5 text-green-400" />
          Votes
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1">{stats?.votes.total || 0}</div>
            <div className="text-gray-400 text-sm">Total</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1">{stats?.votes.today || 0}</div>
            <div className="text-gray-400 text-sm">Aujourd'hui</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1">{stats?.votes.thisWeek || 0}</div>
            <div className="text-gray-400 text-sm">Cette semaine</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1">{stats?.votes.thisMonth || 0}</div>
            <div className="text-gray-400 text-sm">Ce mois</div>
          </Card>
        </div>
      </section>

      {/* Revenue stats */}
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Revenus (estimés)
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1 text-green-400">
              {((stats?.users.premium || 0) * 4.99 + (stats?.users.vip || 0) * 9.99).toFixed(2)}€
            </div>
            <div className="text-gray-400 text-sm">MRR Abonnements</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1">
              {stats?.revenue?.purchases?.toFixed(2) || '0.00'}€
            </div>
            <div className="text-gray-400 text-sm">Achats ponctuels</div>
          </Card>
          <Card variant="bordered" className="p-4">
            <div className="text-3xl font-bold mb-1 text-green-400">
              {(
                ((stats?.users.premium || 0) * 4.99 + (stats?.users.vip || 0) * 9.99) +
                (stats?.revenue?.purchases || 0)
              ).toFixed(2)}€
            </div>
            <div className="text-gray-400 text-sm">Total estimé/mois</div>
          </Card>
        </div>
      </section>
    </div>
  );
}
