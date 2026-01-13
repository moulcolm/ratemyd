import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createCustomerPortal } from '@/lib/stripe';

export async function POST() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (user.subscriptionTier === 'FREE') {
      return NextResponse.json(
        { error: 'Vous n\'avez pas d\'abonnement actif' },
        { status: 400 }
      );
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/subscription`;
    const portalUrl = await createCustomerPortal(user.id, returnUrl);

    return NextResponse.json({
      success: true,
      data: { portalUrl },
    });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
