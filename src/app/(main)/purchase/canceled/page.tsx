'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { Card, Button } from '@/components/ui';

export default function PurchaseCanceledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card variant="bordered" className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-yellow-400" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Achat annulé</h1>
        <p className="text-gray-400 mb-6">
          Votre achat a été annulé. Aucun montant n'a été débité.
        </p>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300">Un problème ?</span>
          </div>
          <p className="text-sm text-gray-500">
            Si vous avez rencontré un problème lors du paiement, n'hésitez pas à nous contacter.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => router.push('/subscription')} className="w-full">
            Réessayer
          </Button>
          <Button variant="outline" onClick={() => router.push('/')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </Card>
    </div>
  );
}
