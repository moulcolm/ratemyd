import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';
import { photoUploadSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';
import { getUserLimits } from '@/lib/subscription-limits';

export async function POST(req: NextRequest) {
  try {
    console.log('[Upload] Starting upload...');

    const user = await requireAuth();
    if (!user) {
      console.log('[Upload] User not authenticated');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('[Upload] User authenticated:', user.id);

    // Rate limiting
    const rateLimit = await checkRateLimit(user.id, 'upload');
    if (!rateLimit.allowed) {
      console.log('[Upload] Rate limit exceeded');
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

    console.log('[Upload] Form data received:', { category, declaredLength, declaredGirth, hasFile: !!file });

    if (!file) {
      console.log('[Upload] No file provided');
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
      console.log('[Upload] Validation failed:', validationResult.error);
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    console.log('[Upload] Validation passed');

    // Check user limits
    const limits = getUserLimits(user.bonusPhotoSlots);
    console.log('[Upload] User limits:', limits);

    const currentPhotosInCategory = await prisma.photo.count({
      where: {
        userId: user.id,
        category: validationResult.data.category,
        status: { not: 'REJECTED' },
      },
    });

    console.log('[Upload] Current photos in category:', currentPhotosInCategory);

    if (currentPhotosInCategory >= limits.effectivePhotosPerCategory) {
      console.log('[Upload] Limit reached');
      return NextResponse.json(
        {
          error: `Vous avez atteint la limite de ${limits.effectivePhotosPerCategory} photo(s) pour cette catégorie.`,
        },
        { status: 403 }
      );
    }

    console.log('[Upload] Starting S3 upload...');
    // Upload to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const { imageUrl, imageKey, thumbnailUrl, thumbnailKey } = await uploadImage(
      buffer,
      file.type,
      user.id,
      'photo'
    );

    console.log('[Upload] S3 upload successful');

    // All users have same priority
    const moderationPriority = 0;

    console.log('[Upload] Creating photo record...');
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

    console.log('[Upload] Photo created:', photo.id);

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

    console.log('[Upload] Stats updated');

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
        console.log('[Upload] Achievement granted');
      }
    }

    console.log('[Upload] Upload complete');
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
    console.error('[Upload] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });
    return NextResponse.json(
      {
        error: 'Une erreur est survenue lors de l\'upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
