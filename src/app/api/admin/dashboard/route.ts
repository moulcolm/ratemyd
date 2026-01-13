import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Get global stats
    const globalStats = await prisma.globalStats.findUnique({
      where: { id: 'global' },
    });

    // Get pending counts
    const [pendingModeration, pendingVerification, pendingReports] = await Promise.all([
      prisma.photo.count({ where: { status: 'PENDING' } }),
      prisma.photo.count({ where: { status: 'VERIFICATION_PENDING' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyStats = await prisma.dailyStats.findUnique({
      where: { date: today },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: globalStats?.totalUsers || 0,
        totalPhotos: globalStats?.totalPhotos || 0,
        totalVotes: globalStats?.totalVotes || 0,
        totalPremium: globalStats?.totalPremium || 0,
        totalVip: globalStats?.totalVip || 0,
        totalRevenue: globalStats?.totalRevenue || 0,
        pendingModeration,
        pendingVerification,
        pendingReports,
        todayNewUsers: dailyStats?.newUsers || 0,
        todayNewPhotos: dailyStats?.newPhotos || 0,
        todayVotes: dailyStats?.totalVotes || 0,
        todayRevenue: dailyStats?.revenue || 0,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
