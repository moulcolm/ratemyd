import { TierLimits } from '@/types';

export const TIER_LIMITS: Record<string, TierLimits> = {
  FREE: {
    dailyVotes: 20,
    photosPerCategory: 1,
    canSeeFullLeaderboard: false,
    canSeeDetailedStats: false,
    canSeeEloHistory: false,
    canFilterVerified: false,
    verificationBonus: 1.05,
    hasAds: true,
    moderationPriority: 0,
  },
  PREMIUM: {
    dailyVotes: Infinity,
    photosPerCategory: 3,
    canSeeFullLeaderboard: true,
    canSeeDetailedStats: true,
    canSeeEloHistory: true,
    canFilterVerified: true,
    verificationBonus: 1.07,
    hasAds: false,
    moderationPriority: 1,
  },
  VIP: {
    dailyVotes: Infinity,
    photosPerCategory: 5,
    canSeeFullLeaderboard: true,
    canSeeDetailedStats: true,
    canSeeEloHistory: true,
    canFilterVerified: true,
    verificationBonus: 1.10,
    hasAds: false,
    moderationPriority: 2,
  },
};

export function getUserLimits(
  tier: string,
  bonusPhotoSlots: number = 0,
  bonusVotes: number = 0
) {
  const base = TIER_LIMITS[tier] || TIER_LIMITS.FREE;

  return {
    ...base,
    effectivePhotosPerCategory: base.photosPerCategory + bonusPhotoSlots,
    effectiveDailyVotes: base.dailyVotes === Infinity
      ? Infinity
      : base.dailyVotes + bonusVotes,
  };
}

export function canAccessFeature(tier: string, feature: keyof TierLimits): boolean {
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.FREE;
  const value = limits[feature];

  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value > 0;
  }
  return false;
}
