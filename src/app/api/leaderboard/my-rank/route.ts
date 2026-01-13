import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { TIER_LIMITS } from '@/lib/subscription-limits';
import { calculateGrowerScore } from '@/lib/elo';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category') as 'repos' | 'erection' | 'global' | 'grower' | null;

    const limits = TIER_LIMITS[user.subscriptionTier];

    // Check if user has photos in the category
    const hasPhotos = await prisma.photo.findFirst({
      where: {
        userId: user.id,
        status: 'APPROVED',
        ...(category && category !== 'global' && category !== 'grower' && {
          category: category.toUpperCase() as 'REPOS' | 'ERECTION',
        }),
      },
    });

    if (!hasPhotos) {
      return NextResponse.json({
        success: true,
        data: {
          rank: null,
          elo: null,
          message: 'Vous n\'avez pas encore de photo approuvée dans cette catégorie',
        },
      });
    }

    let rank: number;
    let elo: number;
    let additionalData = {};

    switch (category) {
      case 'repos':
        rank = (await prisma.user.count({
          where: {
            eloRepos: { gt: user.eloRepos },
            photos: { some: { category: 'REPOS', status: 'APPROVED' } },
            isBanned: false,
          },
        })) + 1;
        elo = user.eloRepos;
        break;

      case 'erection':
        rank = (await prisma.user.count({
          where: {
            eloErection: { gt: user.eloErection },
            photos: { some: { category: 'ERECTION', status: 'APPROVED' } },
            isBanned: false,
          },
        })) + 1;
        elo = user.eloErection;
        break;

      case 'grower':
        // Check if user has both categories
        const hasRepos = await prisma.photo.findFirst({
          where: { userId: user.id, category: 'REPOS', status: 'APPROVED' },
        });
        const hasErection = await prisma.photo.findFirst({
          where: { userId: user.id, category: 'ERECTION', status: 'APPROVED' },
        });

        if (!hasRepos || !hasErection) {
          return NextResponse.json({
            success: true,
            data: {
              rank: null,
              elo: null,
              message: 'Vous devez avoir des photos dans les deux catégories pour apparaître dans le classement Grower',
            },
          });
        }

        const growerScore = calculateGrowerScore(user.eloRepos, user.eloErection);

        // Get all users with both categories and calculate their grower scores
        const allGrowers = await prisma.user.findMany({
          where: {
            AND: [
              { photos: { some: { category: 'REPOS', status: 'APPROVED' } } },
              { photos: { some: { category: 'ERECTION', status: 'APPROVED' } } },
            ],
            isBanned: false,
          },
          select: { id: true, eloRepos: true, eloErection: true },
        });

        const usersWithHigherGrowerScore = allGrowers.filter(
          (u) => calculateGrowerScore(u.eloRepos, u.eloErection) > growerScore
        ).length;

        rank = usersWithHigherGrowerScore + 1;
        elo = growerScore;
        additionalData = { growerScore };
        break;

      default: // global
        rank = (await prisma.user.count({
          where: {
            eloGlobal: { gt: user.eloGlobal },
            photos: { some: { status: 'APPROVED' } },
            isBanned: false,
          },
        })) + 1;
        elo = user.eloGlobal;
    }

    // For FREE users, hide exact rank if > 100
    if (!limits.canSeeFullLeaderboard && rank > 100) {
      return NextResponse.json({
        success: true,
        data: {
          rank: null,
          elo,
          approximateRank: '100+',
          message: 'Passez Premium pour voir votre rang exact',
          ...additionalData,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        rank,
        elo,
        ...additionalData,
      },
    });
  } catch (error) {
    console.error('Get my rank error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
