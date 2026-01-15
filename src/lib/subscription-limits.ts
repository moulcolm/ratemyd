import { TierLimits } from '@/types';

// Tout le monde a un compte gratuit avec les mêmes limites
export const DEFAULT_LIMITS: TierLimits = {
  dailyVotes: Infinity, // Votes illimités
  photosPerCategory: 2, // 2 photos par catégorie = 4 photos au total
  canSeeFullLeaderboard: true,
  canSeeDetailedStats: true,
  canSeeEloHistory: true,
  canFilterVerified: true,
  verificationBonus: 1.05,
  hasAds: false,
  moderationPriority: 0,
};

export function getUserLimits(bonusPhotoSlots: number = 0) {
  return {
    ...DEFAULT_LIMITS,
    effectivePhotosPerCategory: DEFAULT_LIMITS.photosPerCategory + bonusPhotoSlots,
    effectiveDailyVotes: DEFAULT_LIMITS.dailyVotes,
  };
}

export function canAccessFeature(feature: keyof TierLimits): boolean {
  const value = DEFAULT_LIMITS[feature];

  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value > 0;
  }
  return false;
}
