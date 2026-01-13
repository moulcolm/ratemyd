import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { moderationSchema } from '@/lib/validators';

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

    const validationResult = moderationSchema.safeParse({ photoId: id, ...body });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { action, note, rejectionReason } = validationResult.data;

    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo non trouvée' },
        { status: 404 }
      );
    }

    if (photo.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cette photo a déjà été modérée' },
        { status: 400 }
      );
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await prisma.$transaction([
      prisma.photo.update({
        where: { id },
        data: {
          status: newStatus,
          moderatedAt: new Date(),
          moderatedByAdminId: admin.id,
          moderationNote: note,
          rejectionReason: action === 'REJECT' ? rejectionReason : null,
        },
      }),
      prisma.moderationLog.create({
        data: {
          adminId: admin.id,
          photoId: id,
          action: action === 'APPROVE' ? 'APPROVE_PHOTO' : 'REJECT_PHOTO',
          previousStatus: photo.status,
          newStatus,
          note,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: action === 'APPROVE' ? 'Photo approuvée' : 'Photo rejetée',
    });
  } catch (error) {
    console.error('Moderate photo error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
