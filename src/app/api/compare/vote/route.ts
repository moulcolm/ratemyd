import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { processVote, calculateGlobalElo } from '@/lib/elo';
import { canUserVote } from '@/lib/matchmaking';
import { checkRateLimit } from '@/lib/rate-limit';
import { voteSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(user.id, 'vote');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de votes. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    // Check vote limit
    const canVote = await canUserVote(user.id);
    if (!canVote) {
      return NextResponse.json(
        { error: 'Vous avez atteint votre limite de votes quotidiens' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validationResult = voteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { leftPhotoId, rightPhotoId, result } = validationResult.data;

    // Get photos with user info
    const [leftPhoto, rightPhoto] = await Promise.all([
      prisma.photo.findUnique({
        where: { id: leftPhotoId },
        include: { user: { select: { id: true, subscriptionTier: true } } },
      }),
      prisma.photo.findUnique({
        where: { id: rightPhotoId },
        include: { user: { select: { id: true, subscriptionTier: true } } },
      }),
    ]);

    if (!leftPhoto || !rightPhoto) {
      return NextResponse.json(
        { error: 'Photos non trouvées' },
        { status: 404 }
      );
    }

    // Verify both photos are approved and same category
    if (leftPhoto.status !== 'APPROVED' || rightPhoto.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Photos non valides' },
        { status: 400 }
      );
    }

    if (leftPhoto.category !== rightPhoto.category) {
      return NextResponse.json(
        { error: 'Les photos doivent être de la même catégorie' },
        { status: 400 }
      );
    }

    // Prevent voting on own photos
    if (leftPhoto.userId === user.id || rightPhoto.userId === user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas voter pour vos propres photos' },
        { status: 400 }
      );
    }

    // Calculate new ELO
    const eloResults = processVote(
      {
        elo: leftPhoto.elo,
        isVerified: leftPhoto.isVerified,
        userTier: leftPhoto.user.subscriptionTier,
      },
      {
        elo: rightPhoto.elo,
        isVerified: rightPhoto.isVerified,
        userTier: rightPhoto.user.subscriptionTier,
      },
      result
    );

    // Determine win/loss/draw updates
    const leftWinUpdate = result === 'LEFT_WINS' ? 1 : 0;
    const leftLossUpdate = result === 'RIGHT_WINS' ? 1 : 0;
    const leftDrawUpdate = result === 'DRAW' ? 1 : 0;
    const rightWinUpdate = result === 'RIGHT_WINS' ? 1 : 0;
    const rightLossUpdate = result === 'LEFT_WINS' ? 1 : 0;
    const rightDrawUpdate = result === 'DRAW' ? 1 : 0;

    // Execute all updates in a transaction
    await prisma.$transaction(async (tx) => {
      // Create vote record
      await tx.vote.create({
        data: {
          voterId: user.id,
          leftPhotoId,
          rightPhotoId,
          result,
          category: leftPhoto.category,
          leftEloBefore: leftPhoto.elo,
          leftEloAfter: eloResults.leftNewElo,
          rightEloBefore: rightPhoto.elo,
          rightEloAfter: eloResults.rightNewElo,
        },
      });

      // Update left photo
      await tx.photo.update({
        where: { id: leftPhotoId },
        data: {
          elo: eloResults.leftNewElo,
          totalMatches: { increment: 1 },
          wins: { increment: leftWinUpdate },
          losses: { increment: leftLossUpdate },
          draws: { increment: leftDrawUpdate },
        },
      });

      // Update right photo
      await tx.photo.update({
        where: { id: rightPhotoId },
        data: {
          elo: eloResults.rightNewElo,
          totalMatches: { increment: 1 },
          wins: { increment: rightWinUpdate },
          losses: { increment: rightLossUpdate },
          draws: { increment: rightDrawUpdate },
        },
      });

      // Get updated user ELOs
      const leftUserPhotos = await tx.photo.findMany({
        where: { userId: leftPhoto.userId, status: 'APPROVED' },
        select: { elo: true, category: true },
      });

      const rightUserPhotos = await tx.photo.findMany({
        where: { userId: rightPhoto.userId, status: 'APPROVED' },
        select: { elo: true, category: true },
      });

      // Calculate user ELOs (max of their photos in each category)
      const leftUserEloRepos = Math.max(
        ...leftUserPhotos.filter((p) => p.category === 'REPOS').map((p) => p.elo),
        1000
      );
      const leftUserEloErection = Math.max(
        ...leftUserPhotos.filter((p) => p.category === 'ERECTION').map((p) => p.elo),
        1000
      );
      const leftUserEloGlobal = calculateGlobalElo(leftUserEloRepos, leftUserEloErection);

      const rightUserEloRepos = Math.max(
        ...rightUserPhotos.filter((p) => p.category === 'REPOS').map((p) => p.elo),
        1000
      );
      const rightUserEloErection = Math.max(
        ...rightUserPhotos.filter((p) => p.category === 'ERECTION').map((p) => p.elo),
        1000
      );
      const rightUserEloGlobal = calculateGlobalElo(rightUserEloRepos, rightUserEloErection);

      // Update left user
      await tx.user.update({
        where: { id: leftPhoto.userId },
        data: {
          eloRepos: leftUserEloRepos,
          eloErection: leftUserEloErection,
          eloGlobal: leftUserEloGlobal,
          totalVotesReceived: { increment: 1 },
          totalWins: { increment: leftWinUpdate },
          totalLosses: { increment: leftLossUpdate },
        },
      });

      // Update right user
      await tx.user.update({
        where: { id: rightPhoto.userId },
        data: {
          eloRepos: rightUserEloRepos,
          eloErection: rightUserEloErection,
          eloGlobal: rightUserEloGlobal,
          totalVotesReceived: { increment: 1 },
          totalWins: { increment: rightWinUpdate },
          totalLosses: { increment: rightLossUpdate },
        },
      });

      // Update voter stats
      await tx.user.update({
        where: { id: user.id },
        data: { totalVotesGiven: { increment: 1 } },
      });

      // Create ELO history entries
      if (eloResults.leftChange !== 0) {
        await tx.eloHistory.create({
          data: {
            userId: leftPhoto.userId,
            category: leftPhoto.category === 'REPOS' ? 'REPOS' : 'ERECTION',
            eloBefore: leftPhoto.elo,
            eloAfter: eloResults.leftNewElo,
            change: eloResults.leftChange,
            reason: result === 'LEFT_WINS' ? 'Victoire' : result === 'DRAW' ? 'Égalité' : 'Défaite',
          },
        });
      }

      if (eloResults.rightChange !== 0) {
        await tx.eloHistory.create({
          data: {
            userId: rightPhoto.userId,
            category: rightPhoto.category === 'REPOS' ? 'REPOS' : 'ERECTION',
            eloBefore: rightPhoto.elo,
            eloAfter: eloResults.rightNewElo,
            change: eloResults.rightChange,
            reason: result === 'RIGHT_WINS' ? 'Victoire' : result === 'DRAW' ? 'Égalité' : 'Défaite',
          },
        });
      }
    });

    // Update global stats
    await prisma.globalStats.update({
      where: { id: 'global' },
      data: { totalVotes: { increment: 1 } },
    });

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.dailyStats.upsert({
      where: { date: today },
      update: { totalVotes: { increment: 1 } },
      create: { date: today, totalVotes: 1 },
    });

    // Check voter achievements
    const voterVoteCount = user.totalVotesGiven + 1;
    if (voterVoteCount === 100) {
      const achievement = await prisma.achievement.findUnique({
        where: { code: 'VOTER_100' },
      });
      if (achievement) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: user.id,
              achievementId: achievement.id,
            },
          },
          update: {},
          create: {
            userId: user.id,
            achievementId: achievement.id,
          },
        });
      }
    } else if (voterVoteCount === 1000) {
      const achievement = await prisma.achievement.findUnique({
        where: { code: 'VOTER_1000' },
      });
      if (achievement) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: user.id,
              achievementId: achievement.id,
            },
          },
          update: {},
          create: {
            userId: user.id,
            achievementId: achievement.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        leftEloChange: eloResults.leftChange,
        rightEloChange: eloResults.rightChange,
      },
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
