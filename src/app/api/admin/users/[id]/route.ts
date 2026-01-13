import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            imageUrl: true,
            thumbnailUrl: true,
            category: true,
            status: true,
            isVerified: true,
            elo: true,
            createdAt: true,
          },
        },
        receivedReports: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            reporter: {
              select: { username: true },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            photos: true,
            votesGiven: true,
            reports: true,
            receivedReports: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
