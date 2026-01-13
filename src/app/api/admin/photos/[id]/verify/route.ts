import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { verificationSchema } from '@/lib/validators';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const validationResult = verificationSchema.safeParse({ photoId: id, ...body });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { action, note } = validationResult.data;

    const photo = await prisma.photo.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo non trouvée' },
        { status: 404 }
      );
    }

    if (photo.status !== 'VERIFICATION_PENDING') {
      return NextResponse.json(
        { error: 'Cette photo n\'attend pas de vérification' },
        { status: 400 }
      );
    }

    if (action === 'APPROVE') {
      await prisma.$transaction([
        prisma.photo.update({
          where: { id },
          data: {
            isVerified: true,
            status: 'APPROVED',
            verifiedAt: new Date(),
            verifiedByAdminId: admin.id,
            verificationNote: note,
          },
        }),
        prisma.moderationLog.create({
          data: {
            adminId: admin.id,
            photoId: id,
            action: 'VERIFY_SIZE',
            previousStatus: photo.status,
            newStatus: 'APPROVED',
            note,
          },
        }),
      ]);

      // Check for verified achievement
      const achievement = await prisma.achievement.findUnique({
        where: { code: 'VERIFIED' },
      });
      if (achievement) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: photo.userId,
              achievementId: achievement.id,
            },
          },
          update: {},
          create: {
            userId: photo.userId,
            achievementId: achievement.id,
          },
        });
      }
    } else {
      await prisma.$transaction([
        prisma.photo.update({
          where: { id },
          data: {
            status: 'APPROVED', // Return to approved but not verified
            verificationNote: note,
            verificationRequestedAt: null,
            verificationPhotoUrl: null,
            verificationPhotoKey: null,
          },
        }),
        prisma.moderationLog.create({
          data: {
            adminId: admin.id,
            photoId: id,
            action: 'REJECT_VERIFICATION',
            previousStatus: photo.status,
            newStatus: 'APPROVED',
            note,
          },
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      message: action === 'APPROVE' ? 'Vérification approuvée' : 'Vérification rejetée',
    });
  } catch (error) {
    console.error('Verify photo error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
