import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { Prisma, PhotoStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'moderation'; // 'moderation' or 'verification'
    const statusParam = searchParams.get('status'); // 'PENDING', 'APPROVED', 'REJECTED', 'ALL'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Determine status filter
    let statusFilter: Prisma.PhotoWhereInput = {};
    if (statusParam === 'ALL') {
      // No filter - show all photos
    } else if (statusParam) {
      statusFilter = { status: statusParam as PhotoStatus };
    } else {
      // Default: use type parameter for backwards compatibility
      statusFilter = { status: type === 'verification' ? 'VERIFICATION_PENDING' : 'PENDING' };
    }

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where: statusFilter,
        orderBy: [
          { moderationPriority: 'desc' },
          { createdAt: 'asc' },
        ],
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              createdAt: true,
              isBanned: true,
              _count: {
                select: {
                  photos: true,
                  receivedReports: true,
                },
              },
            },
          },
        },
      }),
      prisma.photo.count({ where: statusFilter }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        photos,
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Get pending photos error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
