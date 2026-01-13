interface EloConfig {
  kFactor: number;
  minElo: number;
  maxElo: number;
}

const DEFAULT_CONFIG: EloConfig = {
  kFactor: 32,
  minElo: 100,
  maxElo: 3000,
};

const VERIFICATION_BONUS: Record<string, number> = {
  FREE: 1.05,
  PREMIUM: 1.07,
  VIP: 1.10,
};

export function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export function calculateNewElo(
  playerElo: number,
  opponentElo: number,
  result: 'win' | 'loss' | 'draw',
  isVerified: boolean = false,
  subscriptionTier: string = 'FREE',
  config: EloConfig = DEFAULT_CONFIG
): { newElo: number; change: number } {
  const expected = expectedScore(playerElo, opponentElo);

  let actualScore: number;
  switch (result) {
    case 'win':
      actualScore = 1;
      break;
    case 'loss':
      actualScore = 0;
      break;
    case 'draw':
      actualScore = 0.5;
      break;
  }

  let kFactor = config.kFactor;

  // Apply verification bonus only on wins
  if (isVerified && actualScore > expected) {
    const bonus = VERIFICATION_BONUS[subscriptionTier] || VERIFICATION_BONUS.FREE;
    kFactor *= bonus;
  }

  const change = Math.round(kFactor * (actualScore - expected));
  let newElo = playerElo + change;

  // Clamp ELO within bounds
  newElo = Math.max(config.minElo, Math.min(config.maxElo, newElo));

  return { newElo, change };
}

export function processVote(
  leftPhoto: { elo: number; isVerified: boolean; userTier: string },
  rightPhoto: { elo: number; isVerified: boolean; userTier: string },
  result: 'LEFT_WINS' | 'RIGHT_WINS' | 'DRAW'
) {
  let leftResult: 'win' | 'loss' | 'draw';
  let rightResult: 'win' | 'loss' | 'draw';

  switch (result) {
    case 'LEFT_WINS':
      leftResult = 'win';
      rightResult = 'loss';
      break;
    case 'RIGHT_WINS':
      leftResult = 'loss';
      rightResult = 'win';
      break;
    case 'DRAW':
      leftResult = 'draw';
      rightResult = 'draw';
      break;
  }

  const leftCalc = calculateNewElo(
    leftPhoto.elo,
    rightPhoto.elo,
    leftResult,
    leftPhoto.isVerified,
    leftPhoto.userTier
  );

  const rightCalc = calculateNewElo(
    rightPhoto.elo,
    leftPhoto.elo,
    rightResult,
    rightPhoto.isVerified,
    rightPhoto.userTier
  );

  return {
    leftNewElo: leftCalc.newElo,
    leftChange: leftCalc.change,
    rightNewElo: rightCalc.newElo,
    rightChange: rightCalc.change,
  };
}

export function calculateGrowerScore(eloRepos: number, eloErection: number): number {
  if (eloRepos === 0) return 0;
  return Math.round((eloErection / eloRepos) * 100) / 100;
}

export function calculateGlobalElo(
  eloRepos: number,
  eloErection: number,
  reposWeight: number = 0.4,
  erectionWeight: number = 0.6
): number {
  return Math.round(eloRepos * reposWeight + eloErection * erectionWeight);
}

export function getEloTier(elo: number): { name: string; color: string } {
  if (elo >= 2500) return { name: 'Légendaire', color: '#FFD700' };
  if (elo >= 2000) return { name: 'Diamant', color: '#B9F2FF' };
  if (elo >= 1700) return { name: 'Platine', color: '#E5E4E2' };
  if (elo >= 1400) return { name: 'Or', color: '#FFD700' };
  if (elo >= 1200) return { name: 'Argent', color: '#C0C0C0' };
  if (elo >= 1000) return { name: 'Bronze', color: '#CD7F32' };
  return { name: 'Débutant', color: '#808080' };
}
