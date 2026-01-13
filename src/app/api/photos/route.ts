import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { deleteImage } from '@/lib/storage';

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { photoId } = await req.json();

    if (!photoId) {
      return NextResponse.json(
        { error: 'ID de photo requis' },
        { status: 400 }
      );
    }

    // Get the photo
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo non trouvée' },
        { status: 404 }
      );
    }

    // Check ownership
    if (photo.userId !== user.id && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Delete from S3
    await deleteImage(photo.imageKey, photo.thumbnailKey || undefined);
    if (photo.verificationPhotoKey) {
      await deleteImage(photo.verificationPhotoKey);
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id: photoId },
    });

    // Update stats
    await prisma.globalStats.update({
      where: { id: 'global' },
      data: { totalPhotos: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
