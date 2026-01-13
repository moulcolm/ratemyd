import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { id } = await params;
    const { status, resolution } = await req.json();

    if (!status || !['REVIEWED', 'ACTION_TAKEN', 'DISMISSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Signalement non trouvé' },
        { status: 404 }
      );
    }

    await prisma.report.update({
      where: { id },
      data: {
        status,
        resolution,
        resolvedAt: new Date(),
        resolvedByAdminId: admin.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Signalement mis à jour',
    });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
