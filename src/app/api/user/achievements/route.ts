import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get all achievements with user's unlock status
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { category: 'asc' },
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      select: {
        achievementId: true,
        unlockedAt: true,
      },
    });

    const userAchievementMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
    );

    const achievements = allAchievements.map((achievement) => ({
      ...achievement,
      unlocked: userAchievementMap.has(achievement.id),
      unlockedAt: userAchievementMap.get(achievement.id) || null,
    }));

    return NextResponse.json({ success: true, data: achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
