import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(now);
    monthStart.setDate(1);

    // Users stats
    const [
      totalUsers,
      bannedUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    // Photos stats
    const [
      totalPhotos,
      approvedPhotos,
      pendingPhotos,
      rejectedPhotos,
      verifiedPhotos,
    ] = await Promise.all([
      prisma.photo.count(),
      prisma.photo.count({ where: { status: 'APPROVED' } }),
      prisma.photo.count({ where: { status: 'PENDING' } }),
      prisma.photo.count({ where: { status: 'REJECTED' } }),
      prisma.photo.count({ where: { isVerified: true } }),
    ]);

    // Votes stats
    const [
      totalVotes,
      votesToday,
      votesThisWeek,
      votesThisMonth,
    ] = await Promise.all([
      prisma.vote.count(),
      prisma.vote.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.vote.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.vote.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    // Revenue (simplified - would need actual transaction data)
    const totalTransactions = await prisma.transaction.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });

    return NextResponse.json({
      data: {
        users: {
          total: totalUsers,
          banned: bannedUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
        },
        photos: {
          total: totalPhotos,
          approved: approvedPhotos,
          pending: pendingPhotos,
          rejected: rejectedPhotos,
          verified: verifiedPhotos,
        },
        votes: {
          total: totalVotes,
          today: votesToday,
          thisWeek: votesThisWeek,
          thisMonth: votesThisMonth,
        },
        revenue: {
          purchases: totalTransactions._sum.amount || 0,
          total: totalTransactions._sum.amount || 0,
        },
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
