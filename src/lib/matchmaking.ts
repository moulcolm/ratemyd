import { prisma } from './prisma';
import { getUserLimits } from './subscription-limits';
import { PhotoCategory } from '@prisma/client';

interface MatchmakingOptions {
  category: 'REPOS' | 'ERECTION' | 'MIXED';
  verifiedOnly: boolean;
  voterId: string;
  eloRange?: number;
}

export async function getPhotoPair(options: MatchmakingOptions) {
  const { category, verifiedOnly, voterId, eloRange = 300 } = options;

  const baseWhere: Record<string, unknown> = {
    status: 'APPROVED',
    userId: { not: voterId },
  };

  if (verifiedOnly) {
    baseWhere.isVerified = true;
  }

  let categoryFilter: PhotoCategory;
  if (category === 'MIXED') {
    categoryFilter = Math.random() > 0.5 ? 'REPOS' : 'ERECTION';
  } else {
    categoryFilter = category;
  }
  baseWhere.category = categoryFilter;

  const now = new Date();

  // First, check for boosted photos (30% chance to prioritize)
  const boostedPhotos = await prisma.photo.findMany({
    where: {
      ...baseWhere,
      boosts: {
        some: {
          isActive: true,
          endsAt: { gt: now },
        },
      },
    } as never,
    select: {
      id: true,
      imageUrl: true,
      category: true,
      elo: true,
      isVerified: true,
      declaredLength: true,
      user: { select: { subscriptionTier: true } },
    },
    take: 10,
  });

  let referencePhoto;

  if (boostedPhotos.length > 0 && Math.random() < 0.3) {
    // Use a boosted photo
    referencePhoto = boostedPhotos[Math.floor(Math.random() * boostedPhotos.length)];
  } else {
    // Get a random photo
    const totalPhotos = await prisma.photo.count({ where: baseWhere as never });
    if (totalPhotos < 2) return null;

    const randomSkip = Math.floor(Math.random() * totalPhotos);
    referencePhoto = await prisma.photo.findFirst({
      where: baseWhere as never,
      skip: randomSkip,
      select: {
        id: true,
        imageUrl: true,
        category: true,
        elo: true,
        isVerified: true,
        declaredLength: true,
        user: { select: { subscriptionTier: true } },
      },
    });
  }

  if (!referencePhoto) return null;

  // Find an opponent with similar ELO
  const opponentWhere = {
    ...baseWhere,
    id: { not: referencePhoto.id },
    elo: {
      gte: referencePhoto.elo - eloRange,
      lte: referencePhoto.elo + eloRange,
    },
  };

  let opponentPhoto;
  const opponentsCount = await prisma.photo.count({ where: opponentWhere as never });

  if (opponentsCount > 0) {
    const opponentSkip = Math.floor(Math.random() * opponentsCount);
    opponentPhoto = await prisma.photo.findFirst({
      where: opponentWhere as never,
      skip: opponentSkip,
      select: {
        id: true,
        imageUrl: true,
        category: true,
        elo: true,
        isVerified: true,
        declaredLength: true,
        user: { select: { subscriptionTier: true } },
      },
    });
  } else {
    // Fallback: get any opponent
    const fallbackWhere = { ...baseWhere, id: { not: referencePhoto.id } };
    const fallbackCount = await prisma.photo.count({ where: fallbackWhere as never });
    if (fallbackCount === 0) return null;

    const fallbackSkip = Math.floor(Math.random() * fallbackCount);
    opponentPhoto = await prisma.photo.findFirst({
      where: fallbackWhere as never,
      skip: fallbackSkip,
      select: {
        id: true,
        imageUrl: true,
        category: true,
        elo: true,
        isVerified: true,
        declaredLength: true,
        user: { select: { subscriptionTier: true } },
      },
    });
  }

  if (!opponentPhoto) return null;

  // Randomize left/right position
  if (Math.random() > 0.5) {
    return { leftPhoto: referencePhoto, rightPhoto: opponentPhoto };
  } else {
    return { leftPhoto: opponentPhoto, rightPhoto: referencePhoto };
  }
}

export async function getRemainingVotes(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bonusPhotoSlots: true },
  });

  if (!user) return { remaining: 0, limit: 0, isUnlimited: false };

  const limits = getUserLimits(user.bonusPhotoSlots);

  if (limits.dailyVotes === Infinity) {
    return { remaining: Infinity, limit: Infinity, isUnlimited: true };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const votesToday = await prisma.vote.count({
    where: { voterId: userId, createdAt: { gte: today } },
  });

  const totalLimit = limits.effectiveDailyVotes;
  const remaining = Math.max(0, totalLimit - votesToday);

  return { remaining, limit: totalLimit, isUnlimited: false };
}

export async function canUserVote(userId: string): Promise<boolean> {
  const { remaining, isUnlimited } = await getRemainingVotes(userId);
  return isUnlimited || remaining > 0;
}
