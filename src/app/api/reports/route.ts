import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { reportSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(user.id, 'report');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de signalements. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validationResult = reportSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { photoId, reportedUserId, reason, description } = validationResult.data;

    if (!photoId && !reportedUserId) {
      return NextResponse.json(
        { error: 'Vous devez signaler une photo ou un utilisateur' },
        { status: 400 }
      );
    }

    // Verify photo exists if provided
    if (photoId) {
      const photo = await prisma.photo.findUnique({
        where: { id: photoId },
      });
      if (!photo) {
        return NextResponse.json(
          { error: 'Photo non trouvée' },
          { status: 404 }
        );
      }
    }

    // Verify user exists if provided
    if (reportedUserId) {
      const reportedUser = await prisma.user.findUnique({
        where: { id: reportedUserId },
      });
      if (!reportedUser) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }
    }

    // Prevent self-reporting
    if (reportedUserId === user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous signaler vous-même' },
        { status: 400 }
      );
    }

    await prisma.report.create({
      data: {
        reporterId: user.id,
        photoId,
        reportedUserId,
        reason,
        description,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Signalement envoyé',
    });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
