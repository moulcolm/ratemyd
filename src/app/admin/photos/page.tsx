'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import {
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  RefreshCw,
  AlertTriangle,
  Ruler,
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface PendingPhoto {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  declaredLength: number | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    subscriptionTier: string;
  };
}

export default function AdminPhotosPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [selectedPhoto, setSelectedPhoto] = useState<PendingPhoto | null>(null);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifiedLength, setVerifiedLength] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading, refetch } = useQuery<{ data: { photos: PendingPhoto[] } }>({
    queryKey: ['adminPhotos', statusFilter],
    queryFn: async () => {
      const url = statusFilter === 'ALL'
        ? '/api/admin/photos/pending?limit=50'
        : `/api/admin/photos/pending?status=${statusFilter}&limit=50`;
      const res = await fetch(url);
      return res.json();
    },
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ photoId, action, reason }: { photoId: string; action: 'APPROVE' | 'REJECT'; reason?: string }) => {
      const res = await fetch(`/api/admin/photos/${photoId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectionReason: reason }),
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      addToast({
        type: 'success',
        title: variables.action === 'APPROVE' ? 'Photo approuvée' : 'Photo rejetée',
      });
      setShowModerationModal(false);
      setSelectedPhoto(null);
      setRejectionReason('');
    },
    onError: () => {
      addToast({ type: 'error', title: 'Erreur', message: 'Action impossible' });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ photoId, verifiedLength }: { photoId: string; verifiedLength: number }) => {
      const res = await fetch(`/api/admin/photos/${photoId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedLength }),
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPhotos'] });
      addToast({ type: 'success', title: 'Photo vérifiée' });
      setShowVerifyModal(false);
      setSelectedPhoto(null);
      setVerifiedLength('');
    },
    onError: () => {
      addToast({ type: 'error', title: 'Erreur', message: 'Vérification impossible' });
    },
  });

  const photos = Array.isArray(data?.data?.photos) ? data.data.photos : [];

  const handleApprove = (photo: PendingPhoto) => {
    moderateMutation.mutate({ photoId: photo.id, action: 'APPROVE' });
  };

  const handleReject = () => {
    if (!selectedPhoto) return;
    moderateMutation.mutate({
      photoId: selectedPhoto.id,
      action: 'REJECT',
      reason: rejectionReason,
    });
  };

  const handleVerify = () => {
    if (!selectedPhoto || !verifiedLength) return;
    verifyMutation.mutate({
      photoId: selectedPhoto.id,
      verifiedLength: parseFloat(verifiedLength),
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Modération des photos</h1>
          <p className="text-gray-400">Examinez et approuvez les photos soumises</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Actualiser
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === 'PENDING' && <Clock className="w-4 h-4 mr-1" />}
            {status === 'APPROVED' && <CheckCircle className="w-4 h-4 mr-1" />}
            {status === 'REJECTED' && <XCircle className="w-4 h-4 mr-1" />}
            {status === 'PENDING' ? 'En attente' :
             status === 'APPROVED' ? 'Approuvées' :
             status === 'REJECTED' ? 'Rejetées' : 'Toutes'}
          </Button>
        ))}
      </div>

      {/* Photos grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Chargement des photos..." />
        </div>
      ) : photos.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Aucune photo en attente</h3>
          <p className="text-gray-400">Toutes les photos ont été modérées</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} variant="bordered" className="overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt="Photo à modérer"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      photo.status === 'PENDING' ? 'warning' :
                      photo.status === 'APPROVED' ? 'success' : 'danger'
                    }
                  >
                    {photo.status === 'PENDING' ? 'En attente' :
                     photo.status === 'APPROVED' ? 'Approuvée' : 'Rejetée'}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{photo.user.username}</span>
                  <Badge variant={photo.category === 'REPOS' ? 'primary' : 'secondary'}>
                    {photo.category === 'REPOS' ? 'Repos' : 'Érection'}
                  </Badge>
                </div>

                {photo.declaredLength && (
                  <p className="text-sm text-gray-400 mb-3">
                    Taille déclarée: {photo.declaredLength} cm
                  </p>
                )}

                <p className="text-xs text-gray-500 mb-3">
                  {new Date(photo.createdAt).toLocaleDateString('fr-FR')}
                </p>

                {photo.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-500 text-green-400 hover:bg-green-500/10"
                      onClick={() => handleApprove(photo)}
                      isLoading={moderateMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        setSelectedPhoto(photo);
                        setShowModerationModal(true);
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPhoto(photo);
                        setShowVerifyModal(true);
                      }}
                    >
                      <Ruler className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {photo.status === 'APPROVED' && photo.declaredLength && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setVerifiedLength(photo.declaredLength?.toString() || '');
                      setShowVerifyModal(true);
                    }}
                  >
                    <Ruler className="w-4 h-4 mr-2" />
                    Vérifier taille
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rejection modal */}
      <Modal
        isOpen={showModerationModal}
        onClose={() => {
          setShowModerationModal(false);
          setRejectionReason('');
        }}
        title="Rejeter la photo"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h4 className="font-medium">Motif du rejet</h4>
              <p className="text-sm text-gray-400">
                Ce motif sera envoyé à l'utilisateur
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {[
              'Contenu non conforme',
              'Qualité insuffisante',
              'Visage visible',
              'Contenu inapproprié',
              'Autre',
            ].map((reason) => (
              <button
                key={reason}
                onClick={() => setRejectionReason(reason)}
                className={cn(
                  'w-full p-3 rounded-lg text-left transition-colors',
                  rejectionReason === reason
                    ? 'bg-red-500/20 border border-red-500'
                    : 'bg-gray-800 hover:bg-gray-700'
                )}
              >
                {reason}
              </button>
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowModerationModal(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              className="bg-red-500 hover:bg-red-600"
              onClick={handleReject}
              isLoading={moderateMutation.isPending}
              disabled={!rejectionReason}
            >
              Rejeter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Verify modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setVerifiedLength('');
        }}
        title="Vérifier la taille"
      >
        <div className="p-6">
          <p className="text-gray-400 mb-4">
            Entrez la taille mesurée sur la photo. Cette valeur sera marquée comme vérifiée.
          </p>

          {selectedPhoto?.declaredLength && (
            <div className="bg-gray-800 p-3 rounded-lg mb-4">
              <span className="text-gray-400">Taille déclarée: </span>
              <span className="font-bold">{selectedPhoto.declaredLength} cm</span>
            </div>
          )}

          <Input
            label="Taille vérifiée"
            type="number"
            step="0.1"
            value={verifiedLength}
            onChange={(e) => setVerifiedLength(e.target.value)}
            placeholder="Ex: 15.5"
            rightElement={<span className="text-gray-400">cm</span>}
          />

          <div className="flex gap-3 justify-end mt-6">
            <Button variant="ghost" onClick={() => setShowVerifyModal(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleVerify}
              isLoading={verifyMutation.isPending}
              disabled={!verifiedLength}
            >
              Valider la vérification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
