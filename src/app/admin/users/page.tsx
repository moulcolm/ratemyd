'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Crown,
  Star,
  Ban,
  MoreVertical,
  Eye,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  email: string;
  subscriptionTier: string;
  isBanned: boolean;
  isAdmin: boolean;
  createdAt: string;
  _count: {
    photos: number;
    votes: number;
  };
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');

  const { data, isLoading } = useQuery<{ data: { users: User[] } }>({
    queryKey: ['adminUsers', searchQuery],
    queryFn: async () => {
      const url = searchQuery
        ? `/api/admin/users?search=${encodeURIComponent(searchQuery)}`
        : '/api/admin/users?limit=50';
      const res = await fetch(url);
      return res.json();
    },
  });

  const banMutation = useMutation({
    mutationFn: async ({ userId, banned, reason }: { userId: string; banned: boolean; reason?: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned, reason }),
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      addToast({
        type: 'success',
        title: variables.banned ? 'Utilisateur banni' : 'Utilisateur débanni',
      });
      setShowBanModal(false);
      setSelectedUser(null);
      setBanReason('');
    },
    onError: () => {
      addToast({ type: 'error', title: 'Erreur', message: 'Action impossible' });
    },
  });

  const users = Array.isArray(data?.data?.users) ? data.data.users : [];

  const handleBan = () => {
    if (!selectedUser) return;
    banMutation.mutate({
      userId: selectedUser.id,
      banned: !selectedUser.isBanned,
      reason: banReason,
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gestion des utilisateurs</h1>
          <p className="text-gray-400">Gérez les comptes utilisateurs</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Rechercher par username ou email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Users table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Chargement des utilisateurs..." />
        </div>
      ) : users.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-gray-400">Essayez une autre recherche</p>
        </Card>
      ) : (
        <Card variant="bordered" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Abonnement</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Photos</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Votes</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Inscription</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Statut</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.username}</span>
                          {user.isAdmin && (
                            <Badge variant="danger" className="text-xs">Admin</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {user.subscriptionTier === 'VIP' && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                        {user.subscriptionTier === 'PREMIUM' && (
                          <Star className="w-4 h-4 text-purple-400" />
                        )}
                        <span className={cn(
                          user.subscriptionTier === 'VIP' ? 'text-yellow-400' :
                          user.subscriptionTier === 'PREMIUM' ? 'text-purple-400' :
                          'text-gray-400'
                        )}>
                          {user.subscriptionTier}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-400">
                      {user._count.photos}
                    </td>
                    <td className="px-4 py-4 text-gray-400">
                      {user._count.votes}
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-4">
                      {user.isBanned ? (
                        <Badge variant="danger">Banni</Badge>
                      ) : (
                        <Badge variant="success">Actif</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBanModal(true);
                          }}
                          disabled={user.isAdmin}
                        >
                          <Ban className={cn(
                            'w-4 h-4',
                            user.isBanned ? 'text-green-400' : 'text-red-400'
                          )} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Ban modal */}
      <Modal
        isOpen={showBanModal}
        onClose={() => {
          setShowBanModal(false);
          setBanReason('');
        }}
        title={selectedUser?.isBanned ? 'Débannir l\'utilisateur' : 'Bannir l\'utilisateur'}
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              selectedUser?.isBanned ? 'bg-green-500/20' : 'bg-red-500/20'
            )}>
              {selectedUser?.isBanned ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-400" />
              )}
            </div>
            <div>
              <h4 className="font-medium">{selectedUser?.username}</h4>
              <p className="text-sm text-gray-400">{selectedUser?.email}</p>
            </div>
          </div>

          {!selectedUser?.isBanned && (
            <Input
              label="Raison du bannissement"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Ex: Violation des CGU"
            />
          )}

          <div className="flex gap-3 justify-end mt-6">
            <Button variant="ghost" onClick={() => setShowBanModal(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              className={selectedUser?.isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
              onClick={handleBan}
              isLoading={banMutation.isPending}
            >
              {selectedUser?.isBanned ? 'Débannir' : 'Bannir'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
