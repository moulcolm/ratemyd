// Ad Zone IDs from ExoClick dashboard
// Replace with your actual zone IDs after creating them

export const AD_ZONES = {
  // Banners
  BANNER_300x250_SIDEBAR: process.env.NEXT_PUBLIC_AD_ZONE_300x250 || 'demo',
  BANNER_728x90_HEADER: process.env.NEXT_PUBLIC_AD_ZONE_728x90 || 'demo',
  BANNER_300x100_MOBILE: process.env.NEXT_PUBLIC_AD_ZONE_300x100 || 'demo',

  // Interstitial
  INTERSTITIAL: process.env.NEXT_PUBLIC_AD_ZONE_INTERSTITIAL || 'demo',

  // Native
  NATIVE_LEADERBOARD: process.env.NEXT_PUBLIC_AD_ZONE_NATIVE || 'demo',
} as const;

// Ad display rules
export const AD_RULES = {
  VOTES_BEFORE_INTERSTITIAL: 10,
  SHOW_INTERSTITIAL_ONCE_PER_SESSION: true,
  LEADERBOARD_AD_EVERY_N_ROWS: 20,
  COMPARE_AD_EVERY_N_VOTES: 5,
} as const;
