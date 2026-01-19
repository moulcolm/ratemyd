'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Camera,
  BarChart3,
  Trophy,
  Settings,
  Plus,
  Trash2,
  Zap,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, Badge, Button, Modal } from '@/components/ui';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EloDisplay } from '@/components/shared/EloDisplay';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface Photo {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  status: string;
  elo: number;
  totalVotes: number;
  wins: number;
  draws: number;
  losses: number;
  isVerified: boolean;
  declaredLength: number | null;
  verifiedLength: number | null;
  createdAt: string;
  boostActive: boolean;
  boostEndsAt: string | null;
}

const menuItems = [
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/profile/photos', icon: Camera, label: 'My Photos', active: true },
  { href: '/profile/stats', icon: BarChart3, label: 'Statistics' },
  { href: '/profile/achievements', icon: Trophy, label: 'Achievements' },
  { href: '/profile/settings', icon: Settings, label: 'Settings' },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'APPROVED':
      return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
    case 'PENDING':
      return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    case 'REJECTED':
      return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function ProfilePhotosPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);

  const { data, isLoading } = useQuery<{ data: Photo[] }>({
    queryKey: ['userPhotos'],
    queryFn: async () => {
      const res = await fetch('/api/user/photos');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting photo');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhotos'] });
      addToast({ type: 'success', title: 'Photo deleted' });
      setShowDeleteModal(false);
      setSelectedPhoto(null);
    },
    onError: () => {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de supprimer la photo' });
    },
  });

  const boostMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const res = await fetch(`/api/photos/${photoId}/boost`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhotos'] });
      addToast({ type: 'success', title: 'Boost activé !', message: 'Votre photo sera mise en avant pendant 24h' });
      setShowBoostModal(false);
      setSelectedPhoto(null);
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Erreur', message: error.message });
    },
  });

  const photos = data?.data || [];

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
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Mes photos
                </h1>
                <p className="text-gray-300 mt-1">Gérez vos photos et leur visibilité</p>
              </div>
              <Link href="/upload">
                <Button leftIcon={<Plus className="w-4 h-4" />} className="shadow-lg shadow-purple-500/30">
                  Ajouter une photo
                </Button>
              </Link>
            </div>

            {/* Photos grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Chargement des photos..." />
              </div>
            ) : photos.length === 0 ? (
              <Card variant="bordered" className="text-center py-16 bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Aucune photo</h3>
                <p className="text-gray-300 mb-8 max-w-md mx-auto">
                  Uploadez votre première photo pour commencer
                </p>
                <Link href="/upload">
                  <Button size="lg" className="shadow-lg shadow-purple-500/30">Ajouter une photo</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <Card key={photo.id} variant="bordered" className="overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                    <div className="relative aspect-[3/4]">
                      <Image
                        src={photo.thumbnailUrl || photo.imageUrl}
                        alt="Ma photo"
                        fill
                        className="object-cover"
                      />
                      {photo.boostActive && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="premium" className="shadow-lg shadow-yellow-500/50 backdrop-blur-sm">
                            <Zap className="w-3 h-3 mr-1" /> Boosté
                          </Badge>
                        </div>
                      )}
                      {photo.isVerified && (
                        <div className="absolute top-3 right-3">
                          <div className="backdrop-blur-sm bg-black/30 rounded-full p-1">
                            <VerifiedBadge />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={photo.category === 'REPOS' ? 'primary' : 'secondary'}>
                          {photo.category === 'REPOS' ? 'Repos' : 'Érection'}
                        </Badge>
                        {getStatusBadge(photo.status)}
                      </div>

                      {photo.status === 'APPROVED' && (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <EloDisplay elo={photo.elo} />
                            <span className="text-sm text-gray-400">
                              {photo.totalVotes} votes
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 mb-3">
                            {photo.wins}W / {photo.draws}D / {photo.losses}L
                          </div>
                        </>
                      )}

                      {photo.declaredLength && (
                        <div className="text-sm text-gray-400 mb-3">
                          Taille déclarée: {photo.declaredLength} cm
                          {photo.verifiedLength && (
                            <span className="text-green-400 ml-2">
                              (Vérifié: {photo.verifiedLength} cm)
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {photo.status === 'APPROVED' && !photo.boostActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedPhoto(photo);
                              setShowBoostModal(true);
                            }}
                            leftIcon={<Zap className="w-4 h-4" />}
                          >
                            Boost
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPhoto(photo);
                            setShowDeleteModal(true);
                          }}
                          leftIcon={<Trash2 className="w-4 h-4 text-red-400" />}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer la photo"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h4 className="font-medium">Êtes-vous sûr ?</h4>
              <p className="text-sm text-gray-400">
                Cette action est irréversible. Votre historique ELO sera perdu.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              className="bg-red-500 hover:bg-red-600"
              onClick={() => selectedPhoto && deleteMutation.mutate(selectedPhoto.id)}
              isLoading={deleteMutation.isPending}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Boost modal */}
      <Modal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        title="Booster cette photo"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h4 className="font-medium">Activer le boost ?</h4>
              <p className="text-sm text-gray-400">
                Votre photo sera prioritaire dans les comparaisons pendant 24h.
              </p>
            </div>
          </div>

          <Card variant="bordered" className="p-4 mb-4">
            <p className="text-sm text-gray-400 mb-2">Coût du boost:</p>
            <p className="text-xl font-bold text-yellow-400">2.99€</p>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowBoostModal(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => selectedPhoto && boostMutation.mutate(selectedPhoto.id)}
              isLoading={boostMutation.isPending}
              leftIcon={<Zap className="w-4 h-4" />}
            >
              Acheter le boost
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
