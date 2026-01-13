'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Gift, ArrowRight } from 'lucide-react';
import { Card, Button } from '@/components/ui';

export default function PurchaseSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const productType = searchParams.get('type') || 'achat';

  useEffect(() => {
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    queryClient.invalidateQueries({ queryKey: ['remainingVotes'] });
    queryClient.invalidateQueries({ queryKey: ['photoSlots'] });
  }, [queryClient]);

  const getMessage = () => {
    switch (productType) {
      case 'votes':
        return {
          title: 'Votes ajoutés !',
          description: 'Vos votes bonus ont été crédités sur votre compte.',
          action: 'Commencer à voter',
          href: '/compare',
        };
      case 'photo_slot':
        return {
          title: 'Slot photo ajouté !',
          description: 'Vous pouvez maintenant ajouter une photo supplémentaire.',
          action: 'Ajouter une photo',
          href: '/upload',
        };
      case 'boost':
        return {
          title: 'Boost activé !',
          description: 'Votre photo sera mise en avant pendant les prochaines 24 heures.',
          action: 'Voir mes photos',
          href: '/profile/photos',
        };
      case 'fast_track':
        return {
          title: 'Fast-track activé !',
          description: 'Votre photo sera modérée en priorité.',
          action: 'Voir mes photos',
          href: '/profile/photos',
        };
      default:
        return {
          title: 'Achat réussi !',
          description: 'Votre achat a été traité avec succès.',
          action: 'Retour',
          href: '/profile',
        };
    }
  };

  const message = getMessage();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card variant="bordered" className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-2xl font-bold mb-2">{message.title}</h1>
        <p className="text-gray-400 mb-6">{message.description}</p>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 text-green-400" />
            <span className="text-green-400">Merci pour votre achat !</span>
          </div>
        </div>

        <Button onClick={() => router.push(message.href)} className="w-full">
          {message.action}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>
    </div>
  );
}
