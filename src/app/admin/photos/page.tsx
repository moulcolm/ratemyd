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
      if (!res.ok) throw new Error('Error');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      addToast({
        type: 'success',
        title: variables.action === 'APPROVE' ? 'Photo approved' : 'Photo rejected',
      });
      setShowModerationModal(false);
      setSelectedPhoto(null);
      setRejectionReason('');
    },
    onError: () => {
      addToast({ type: 'error', title: 'Error', message: 'Action failed' });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ photoId, verifiedLength }: { photoId: string; verifiedLength: number }) => {
      const res = await fetch(`/api/admin/photos/${photoId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE', note: `Verified length: ${verifiedLength} cm` }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPhotos'] });
      addToast({ type: 'success', title: 'Photo verified' });
      setShowVerifyModal(false);
      setSelectedPhoto(null);
      setVerifiedLength('');
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Verification failed' });
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
          <h1 className="text-2xl font-bold mb-2">Photo Moderation</h1>
          <p className="text-gray-400">Review and approve submitted photos</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
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
            {status === 'PENDING' ? 'Pending' :
             status === 'APPROVED' ? 'Approved' :
             status === 'REJECTED' ? 'Rejected' : 'All'}
          </Button>
        ))}
      </div>

      {/* Photos grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading photos..." />
        </div>
      ) : photos.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No pending photos</h3>
          <p className="text-gray-400">All photos have been moderated</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} variant="bordered" className="overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt="Photo to moderate"
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
                    {photo.status === 'PENDING' ? 'Pending' :
                     photo.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{photo.user.username}</span>
                  <Badge variant={photo.category === 'REPOS' ? 'primary' : 'secondary'}>
                    {photo.category === 'REPOS' ? 'Flaccid' : 'Erect'}
                  </Badge>
                </div>

                {photo.declaredLength && (
                  <p className="text-sm text-gray-400 mb-3">
                    Declared size: {photo.declaredLength} cm
                  </p>
                )}

                <p className="text-xs text-gray-500 mb-3">
                  {new Date(photo.createdAt).toLocaleDateString('en-US')}
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
                    Verify size
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
        title="Reject Photo"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h4 className="font-medium">Rejection Reason</h4>
              <p className="text-sm text-gray-400">
                This reason will be sent to the user
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {[
              'Non-compliant content',
              'Insufficient quality',
              'Face visible',
              'Inappropriate content',
              'Other',
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
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-red-500 hover:bg-red-600"
              onClick={handleReject}
              isLoading={moderateMutation.isPending}
              disabled={!rejectionReason}
            >
              Reject
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
        title="Verify Size"
      >
        <div className="p-6">
          <p className="text-gray-400 mb-4">
            Enter the measured size from the photo. This value will be marked as verified.
          </p>

          {selectedPhoto?.declaredLength && (
            <div className="bg-gray-800 p-3 rounded-lg mb-4">
              <span className="text-gray-400">Declared size: </span>
              <span className="font-bold">{selectedPhoto.declaredLength} cm</span>
            </div>
          )}

          <Input
            label="Verified size"
            type="number"
            step="0.1"
            value={verifiedLength}
            onChange={(e) => setVerifiedLength(e.target.value)}
            placeholder="Ex: 15.5"
            rightElement={<span className="text-gray-400">cm</span>}
          />

          <div className="flex gap-3 justify-end mt-6">
            <Button variant="ghost" onClick={() => setShowVerifyModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleVerify}
              isLoading={verifyMutation.isPending}
              disabled={!verifiedLength}
            >
              Confirm Verification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
