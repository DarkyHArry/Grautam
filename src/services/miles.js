// Programa de Fidelidade e Milhas - Grautam Miles

const TIERS = {
  SILVER: { name: 'Silver', multiplier: 1.0, baggageBonusKg: 0, minPoints: 0, badgeColor: '#a6a49c' },
  GOLD: { name: 'Gold', multiplier: 1.25, baggageBonusKg: 10, minPoints: 10000, badgeColor: '#d4973b' },
  PLATINUM: { name: 'Platinum', multiplier: 1.5, baggageBonusKg: 23, minPoints: 30000, badgeColor: '#4eaa7b' },
  BLACK: { name: 'Black', multiplier: 2.0, baggageBonusKg: 32, minPoints: 70000, badgeColor: '#d97736' }
};

function calculateMilesEarned(totalBrl, cabinClass = 'economy', currentTier = 'GOLD') {
  const tier = TIERS[currentTier] || TIERS.SILVER;
  const classMultiplier = cabinClass === 'business' ? 2.0 : cabinClass === 'premium' ? 1.4 : 1.0;
  const basePoints = Math.round(totalBrl * 2.5);
  return Math.round(basePoints * classMultiplier * tier.multiplier);
}

function getTierProgress(currentPoints) {
  if (currentPoints >= TIERS.BLACK.minPoints) {
    return { tier: TIERS.BLACK, nextTier: null, pointsNeeded: 0, percent: 100 };
  }
  if (currentPoints >= TIERS.PLATINUM.minPoints) {
    const needed = TIERS.BLACK.minPoints - currentPoints;
    const range = TIERS.BLACK.minPoints - TIERS.PLATINUM.minPoints;
    return { tier: TIERS.PLATINUM, nextTier: TIERS.BLACK, pointsNeeded: needed, percent: Math.round(((currentPoints - TIERS.PLATINUM.minPoints) / range) * 100) };
  }
  if (currentPoints >= TIERS.GOLD.minPoints) {
    const needed = TIERS.PLATINUM.minPoints - currentPoints;
    const range = TIERS.PLATINUM.minPoints - TIERS.GOLD.minPoints;
    return { tier: TIERS.GOLD, nextTier: TIERS.PLATINUM, pointsNeeded: needed, percent: Math.round(((currentPoints - TIERS.GOLD.minPoints) / range) * 100) };
  }
  const needed = TIERS.GOLD.minPoints - currentPoints;
  return { tier: TIERS.SILVER, nextTier: TIERS.GOLD, pointsNeeded: needed, percent: Math.round((currentPoints / TIERS.GOLD.minPoints) * 100) };
}

function redeemWithMiles(points) {
  // 1000 milhas valem R$ 22,00 em desconto
  return Math.round((points / 1000) * 22 * 100) / 100;
}

module.exports = {
  TIERS,
  calculateMilesEarned,
  getTierProgress,
  redeemWithMiles
};
