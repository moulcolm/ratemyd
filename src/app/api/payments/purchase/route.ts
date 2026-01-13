import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createOneTimePayment, PURCHASE_PRICES, PurchaseType } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { type, photoId } = await req.json();

    if (!type || !Object.keys(PURCHASE_PRICES).includes(type)) {
      return NextResponse.json(
        { error: 'Type d\'achat invalide' },
        { status: 400 }
      );
    }

    // Check if photoId is required
    if (['BOOST_24H', 'FAST_TRACK'].includes(type) && !photoId) {
      return NextResponse.json(
        { error: 'Photo ID requis pour ce type d\'achat' },
        { status: 400 }
      );
    }

    const metadata: Record<string, string> = {};
    if (photoId) {
      metadata.photoId = photoId;
    }

    const checkoutUrl = await createOneTimePayment(
      user.id,
      type as PurchaseType,
      metadata
    );

    return NextResponse.json({
      success: true,
      data: { checkoutUrl },
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
