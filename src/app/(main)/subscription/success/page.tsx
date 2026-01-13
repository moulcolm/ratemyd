'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import confetti from 'canvas-confetti';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate subscription query to refresh data
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });

    // Confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#f59e0b'],
    });
  }, [queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card variant="bordered" className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Bienvenue !</h1>
        <p className="text-gray-400 mb-6">
          Votre abonnement a été activé avec succès. Profitez de tous vos nouveaux avantages !
        </p>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-purple-400">Vos avantages</span>
          </div>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>✓ Plus de votes quotidiens</li>
            <li>✓ Plus de slots photos</li>
            <li>✓ Bonus ELO activé</li>
            <li>✓ Expérience sans publicité</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => router.push('/compare')} className="w-full">
            Commencer à voter
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={() => router.push('/upload')} className="w-full">
            Ajouter une photo
          </Button>
        </div>
      </Card>
    </div>
  );
}
