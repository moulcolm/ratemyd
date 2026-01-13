import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const photo = await prisma.photo.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            subscriptionTier: true,
          },
        },
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo non trouvée' },
        { status: 404 }
      );
    }

    // Only owner or admin can see non-approved photos
    if (photo.status !== 'APPROVED' && photo.userId !== user.id && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Photo non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: photo });
  } catch (error) {
    console.error('Get photo error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
