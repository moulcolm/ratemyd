import { User, Photo, Vote, Achievement, Transaction, Report, PhotoCategory, PhotoStatus, VoteResult } from '@prisma/client';

export type { User, Photo, Vote, Achievement, Transaction, Report, PhotoCategory, PhotoStatus, VoteResult };

export interface SafeUser {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  eloRepos: number;
  eloErection: number;
  eloGlobal: number;
  totalVotesGiven: number;
  totalWins: number;
  totalLosses: number;
  createdAt: Date;
  bonusPhotoSlots: number;
}

export interface PhotoWithUser extends Photo {
  user: {
    username: string;
  };
}

export interface PhotoPair {
  leftPhoto: {
    id: string;
    imageUrl: string;
    category: PhotoCategory;
    elo: number;
    isVerified: boolean;
    declaredLength: number | null;
    user: {
      id: string;
    };
  };
  rightPhoto: {
    id: string;
    imageUrl: string;
    category: PhotoCategory;
    elo: number;
    isVerified: boolean;
    declaredLength: number | null;
    user: {
      id: string;
    };
  };
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  elo: number;
  isVerified: boolean;
  totalMatches: number;
  winRate: number;
  photoId: string;
  thumbnailUrl: string | null;
}

export interface UserStats {
  eloRepos: number;
  eloErection: number;
  eloGlobal: number;
  growerScore: number;
  totalVotesGiven: number;
  totalVotesReceived: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  rankRepos: number | null;
  rankErection: number | null;
  rankGlobal: number | null;
  photosRepos: number;
  photosErection: number;
  verifiedPhotos: number;
}

export interface EloHistoryEntry {
  id: string;
  category: string;
  eloBefore: number;
  eloAfter: number;
  change: number;
  reason: string;
  createdAt: Date;
}

export interface RemainingVotes {
  remaining: number;
  limit: number;
  isUnlimited: boolean;
}

export interface TierLimits {
  dailyVotes: number;
  photosPerCategory: number;
  canSeeFullLeaderboard: boolean;
  canSeeDetailedStats: boolean;
  canSeeEloHistory: boolean;
  canFilterVerified: boolean;
  verificationBonus: number;
  hasAds: boolean;
  moderationPriority: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalPhotos: number;
  totalVotes: number;
  pendingModeration: number;
  pendingVerification: number;
  pendingReports: number;
  totalRevenue: number;
  todayNewUsers: number;
  todayNewPhotos: number;
  todayVotes: number;
  todayRevenue: number;
}

export interface ModerationItem {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  category: PhotoCategory;
  declaredLength: number | null;
  declaredGirth: number | null;
  status: PhotoStatus;
  createdAt: Date;
  moderationPriority: number;
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
  };
  verificationPhotoUrl?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
