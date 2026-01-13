import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';

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

    // Check if already verified
    if (photo.isVerified) {
      return NextResponse.json(
        { error: 'Cette photo est déjà vérifiée' },
        { status: 400 }
      );
    }

    // Check if verification is already pending
    if (photo.verificationRequestedAt) {
      return NextResponse.json(
        { error: 'Une demande de vérification est déjà en cours' },
        { status: 400 }
      );
    }

    // Get verification photo from form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Photo de vérification requise' },
        { status: 400 }
      );
    }

    // Upload verification photo
    const buffer = Buffer.from(await file.arrayBuffer());
    const { imageUrl, imageKey } = await uploadImage(
      buffer,
      file.type,
      user.id,
      'verification'
    );

    // Update photo with verification request
    await prisma.photo.update({
      where: { id },
      data: {
        verificationPhotoUrl: imageUrl,
        verificationPhotoKey: imageKey,
        verificationRequestedAt: new Date(),
        status: 'VERIFICATION_PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Demande de vérification envoyée',
    });
  } catch (error) {
    console.error('Request verification error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
