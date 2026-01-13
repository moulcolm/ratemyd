import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { status: status as 'PENDING' | 'REVIEWED' | 'ACTION_TAKEN' | 'DISMISSED' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          reportedUser: {
            select: {
              id: true,
              username: true,
              email: true,
              isBanned: true,
            },
          },
          photo: {
            select: {
              id: true,
              imageUrl: true,
              thumbnailUrl: true,
              status: true,
            },
          },
        },
      }),
      prisma.report.count({ where: { status: status as 'PENDING' | 'REVIEWED' | 'ACTION_TAKEN' | 'DISMISSED' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reports,
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
