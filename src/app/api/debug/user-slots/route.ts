import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getUserLimits } from '@/lib/subscription-limits';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        username: true,
        bonusPhotoSlots: true,
        _count: {
          select: {
            photos: true,
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Get all photos
    const allPhotos = await prisma.photo.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        status: true,
        category: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Count by status
    const photosByStatus = {
      PENDING: allPhotos.filter(p => p.status === 'PENDING').length,
      APPROVED: allPhotos.filter(p => p.status === 'APPROVED').length,
      REJECTED: allPhotos.filter(p => p.status === 'REJECTED').length,
      VERIFICATION_PENDING: allPhotos.filter(p => p.status === 'VERIFICATION_PENDING').length,
    };

    const limits = getUserLimits(userData.bonusPhotoSlots);
    const totalSlots = limits.effectivePhotosPerCategory * 2;
    const usedSlots = userData._count.photos;
    const availableSlots = Math.max(0, totalSlots - usedSlots);

    // Also count only PENDING and APPROVED
    const activeSlotsUsed = allPhotos.filter(p => p.status === 'PENDING' || p.status === 'APPROVED').length;

    return NextResponse.json({
      debug: true,
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        bonusPhotoSlots: userData.bonusPhotoSlots,
      },
      limits: {
        photosPerCategory: 2,
        bonusPhotoSlots: userData.bonusPhotoSlots,
        effectivePhotosPerCategory: limits.effectivePhotosPerCategory,
        totalSlots,
      },
      photos: {
        totalCount: allPhotos.length,
        countedByAPI: usedSlots,
        activeSlotsUsed: activeSlotsUsed,
        byStatus: photosByStatus,
        list: allPhotos,
      },
      calculated: {
        usedSlots,
        availableSlots,
        shouldAllowUpload: availableSlots > 0,
      },
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
