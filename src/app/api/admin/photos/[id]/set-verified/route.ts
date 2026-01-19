import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const setVerifiedSchema = z.object({
  verifiedLength: z.number().min(1).max(50),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const validationResult = setVerifiedSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { verifiedLength } = validationResult.data;

    const photo = await prisma.photo.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    if (photo.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Photo must be approved before verification' },
        { status: 400 }
      );
    }

    // Update photo with verified status and length
    await prisma.$transaction([
      prisma.photo.update({
        where: { id },
        data: {
          isVerified: true,
          declaredLength: verifiedLength,
          verifiedAt: new Date(),
          verifiedByAdminId: admin.id,
          verificationNote: `Admin verified length: ${verifiedLength} cm`,
        },
      }),
      prisma.moderationLog.create({
        data: {
          adminId: admin.id,
          photoId: id,
          action: 'VERIFY_SIZE',
          previousStatus: photo.status,
          newStatus: photo.status,
          note: `Verified length set to ${verifiedLength} cm`,
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

    return NextResponse.json({
      success: true,
      message: 'Photo verified successfully',
    });
  } catch (error) {
    console.error('Set verified error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
