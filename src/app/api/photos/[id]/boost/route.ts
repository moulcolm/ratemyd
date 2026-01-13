import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createOneTimePayment } from '@/lib/stripe';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    // Get the photo
    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo non trouvée' },
        { status: 404 }
      );
    }

    // Check ownership
    if (photo.userId !== user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Check if photo is approved
    if (photo.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Seules les photos approuvées peuvent être boostées' },
        { status: 400 }
      );
    }

    // Check if already has active boost
    const activeBoost = await prisma.visibilityBoost.findFirst({
      where: {
        photoId: id,
        isActive: true,
        endsAt: { gt: new Date() },
      },
    });

    if (activeBoost) {
      return NextResponse.json(
        { error: 'Cette photo a déjà un boost actif' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutUrl = await createOneTimePayment(user.id, 'BOOST_24H', {
      photoId: id,
    });

    return NextResponse.json({
      success: true,
      data: { checkoutUrl },
    });
  } catch (error) {
    console.error('Boost photo error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
