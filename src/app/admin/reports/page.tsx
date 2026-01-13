'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import {
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  User,
  Camera,
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reporter: {
    id: string;
    username: string;
  };
  photo: {
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
  } | null;
  reportedUser: {
    id: string;
    username: string;
    email: string;
  } | null;
}

const reasonLabels: Record<string, string> = {
  INAPPROPRIATE: 'Contenu inapproprié',
  FAKE: 'Fausse photo',
  SPAM: 'Spam',
  HARASSMENT: 'Harcèlement',
  UNDERAGE: 'Mineur',
  OTHER: 'Autre',
};

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'RESOLVED' | 'DISMISSED' | 'ALL'>('PENDING');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data, isLoading } = useQuery<{ data: { reports: Report[] } }>({
    queryKey: ['adminReports', statusFilter],
    queryFn: async () => {
      const url = statusFilter === 'ALL'
        ? '/api/admin/reports?limit=50'
        : `/api/admin/reports?status=${statusFilter}&limit=50`;
      const res = await fetch(url);
      return res.json();
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ reportId, action }: { reportId: string; action: 'resolve' | 'dismiss' }) => {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'resolve' ? 'RESOLVED' : 'DISMISSED' }),
      });
      if (!res.ok) throw new Error('Erreur');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      addToast({
        type: 'success',
        title: variables.action === 'resolve' ? 'Signalement résolu' : 'Signalement rejeté',
      });
      setShowDetailModal(false);
      setSelectedReport(null);
    },
    onError: () => {
      addToast({ type: 'error', title: 'Erreur', message: 'Action impossible' });
    },
  });

  const reports = Array.isArray(data?.data?.reports) ? data.data.reports : [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Signalements</h1>
          <p className="text-gray-400">Gérez les signalements des utilisateurs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['PENDING', 'RESOLVED', 'DISMISSED', 'ALL'] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === 'PENDING' ? 'En attente' :
             status === 'RESOLVED' ? 'Résolus' :
             status === 'DISMISSED' ? 'Rejetés' : 'Tous'}
          </Button>
        ))}
      </div>

      {/* Reports list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Chargement des signalements..." />
        </div>
      ) : reports.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Aucun signalement</h3>
          <p className="text-gray-400">Aucun signalement en attente de traitement</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} variant="bordered" className="p-4">
              <div className="flex items-start gap-4">
                {/* Photo preview if exists */}
                {report.photo && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={report.photo.thumbnailUrl || report.photo.imageUrl}
                      alt="Photo signalée"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Report info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        report.reason === 'UNDERAGE' ? 'danger' :
                        report.reason === 'HARASSMENT' ? 'danger' :
                        'warning'
                      }
                    >
                      {reasonLabels[report.reason] || report.reason}
                    </Badge>
                    <Badge
                      variant={
                        report.status === 'PENDING' ? 'warning' :
                        report.status === 'RESOLVED' ? 'success' : 'secondary'
                      }
                    >
                      {report.status === 'PENDING' ? 'En attente' :
                       report.status === 'RESOLVED' ? 'Résolu' : 'Rejeté'}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-400 mb-2">
                    {report.photo && (
                      <span className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        Photo signalée
                      </span>
                    )}
                    {report.reportedUser && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Utilisateur: {report.reportedUser.username}
                      </span>
                    )}
                  </div>

                  {report.description && (
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {report.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    Signalé par {report.reporter.username} le{' '}
                    {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReport(report);
                      setShowDetailModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {report.status === 'PENDING' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-500 text-green-400 hover:bg-green-500/10"
                        onClick={() => resolveMutation.mutate({ reportId: report.id, action: 'resolve' })}
                        isLoading={resolveMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-500 text-gray-400 hover:bg-gray-500/10"
                        onClick={() => resolveMutation.mutate({ reportId: report.id, action: 'dismiss' })}
                        isLoading={resolveMutation.isPending}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détail du signalement"
      >
        {selectedReport && (
          <div className="p-6">
            {/* Photo preview */}
            {selectedReport.photo && (
              <div className="relative aspect-[3/4] max-h-80 rounded-lg overflow-hidden mb-4">
                <Image
                  src={selectedReport.photo.imageUrl}
                  alt="Photo signalée"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Raison</label>
                <p className="font-medium">{reasonLabels[selectedReport.reason] || selectedReport.reason}</p>
              </div>

              {selectedReport.description && (
                <div>
                  <label className="text-sm text-gray-400">Description</label>
                  <p className="font-medium">{selectedReport.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400">Signalé par</label>
                <p className="font-medium">{selectedReport.reporter.username}</p>
              </div>

              {selectedReport.reportedUser && (
                <div>
                  <label className="text-sm text-gray-400">Utilisateur signalé</label>
                  <p className="font-medium">
                    {selectedReport.reportedUser.username} ({selectedReport.reportedUser.email})
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400">Date</label>
                <p className="font-medium">
                  {new Date(selectedReport.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>

            {selectedReport.status === 'PENDING' && (
              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => resolveMutation.mutate({ reportId: selectedReport.id, action: 'dismiss' })}
                  isLoading={resolveMutation.isPending}
                >
                  Rejeter
                </Button>
                <Button
                  variant="primary"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => resolveMutation.mutate({ reportId: selectedReport.id, action: 'resolve' })}
                  isLoading={resolveMutation.isPending}
                >
                  Résoudre
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
