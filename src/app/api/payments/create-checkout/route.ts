import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { tier } = await req.json();

    if (!tier || !['PREMIUM', 'VIP'].includes(tier)) {
      return NextResponse.json(
        { error: 'Tier invalide' },
        { status: 400 }
      );
    }

    // Check if user already has this tier or higher
    if (user.subscriptionTier === 'VIP') {
      return NextResponse.json(
        { error: 'Vous avez déjà l\'abonnement VIP' },
        { status: 400 }
      );
    }

    if (user.subscriptionTier === 'PREMIUM' && tier === 'PREMIUM') {
      return NextResponse.json(
        { error: 'Vous avez déjà l\'abonnement Premium' },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paiements non configurés. Stripe n\'est pas activé en mode développement.' },
        { status: 503 }
      );
    }

    // Dynamic import to avoid errors when Stripe is not configured
    const { createSubscriptionCheckout } = await import('@/lib/stripe');

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/subscription`;
    const checkoutUrl = await createSubscriptionCheckout(user.id, tier, returnUrl);

    return NextResponse.json({
      success: true,
      data: { checkoutUrl },
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du paiement' },
      { status: 500 }
    );
  }
}
