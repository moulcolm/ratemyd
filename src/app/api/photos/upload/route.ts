import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';
import { photoUploadSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';
import { getUserLimits } from '@/lib/subscription-limits';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(user.id, 'upload');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const declaredLength = formData.get('declaredLength');
    const declaredGirth = formData.get('declaredGirth');

    if (!file) {
      return NextResponse.json(
        { error: 'Fichier requis' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = photoUploadSchema.safeParse({
      category,
      declaredLength: declaredLength ? parseFloat(declaredLength as string) : undefined,
      declaredGirth: declaredGirth ? parseFloat(declaredGirth as string) : undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check user limits
    const limits = getUserLimits(
      user.subscriptionTier,
      user.bonusPhotoSlots,
      user.bonusVotes
    );

    const currentPhotosInCategory = await prisma.photo.count({
      where: {
        userId: user.id,
        category: validationResult.data.category,
        status: { not: 'REJECTED' },
      },
    });

    if (currentPhotosInCategory >= limits.effectivePhotosPerCategory) {
      return NextResponse.json(
        {
          error: `Vous avez atteint la limite de ${limits.effectivePhotosPerCategory} photo(s) pour cette catégorie. Passez à un abonnement supérieur pour en ajouter plus.`,
        },
        { status: 403 }
      );
    }

    // Upload to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const { imageUrl, imageKey, thumbnailUrl, thumbnailKey } = await uploadImage(
      buffer,
      file.type,
      user.id,
      'photo'
    );

    // Calculate moderation priority
    let moderationPriority = 0;
    if (user.subscriptionTier === 'VIP') {
      moderationPriority = 2;
    } else if (user.subscriptionTier === 'PREMIUM') {
      moderationPriority = 1;
    }

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        userId: user.id,
        imageUrl,
        imageKey,
        thumbnailUrl,
        thumbnailKey,
        category: validationResult.data.category,
        declaredLength: validationResult.data.declaredLength,
        declaredGirth: validationResult.data.declaredGirth,
        moderationPriority,
      },
    });

    // Update stats
    await prisma.globalStats.update({
      where: { id: 'global' },
      data: { totalPhotos: { increment: 1 } },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.dailyStats.upsert({
      where: { date: today },
      update: { newPhotos: { increment: 1 } },
      create: { date: today, newPhotos: 1 },
    });

    // Check for first upload achievement
    const photoCount = await prisma.photo.count({ where: { userId: user.id } });
    if (photoCount === 1) {
      const achievement = await prisma.achievement.findUnique({
        where: { code: 'FIRST_UPLOAD' },
      });
      if (achievement) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: user.id,
              achievementId: achievement.id,
            },
          },
          update: {},
          create: {
            userId: user.id,
            achievementId: achievement.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: photo.id,
        imageUrl: photo.imageUrl,
        thumbnailUrl: photo.thumbnailUrl,
        category: photo.category,
        status: photo.status,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'upload' },
      { status: 500 }
    );
  }
}
