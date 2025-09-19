// sonicCalculator.js - Calculation Logic

// Global distribution data
export const globalPoolSize = 1800272;
export const globalEligible = 1000;

// Regional distribution data
export const regionalPoolSize = 349864;
export const regionalEligible = 100;

// Distribution statistics
export const distributionStats = {
  totalAllocation: 2500000,
  globalPool: 1800272,
  regionalPoolEach: 349864,
  globalEligible: 1000,
  regionalEligible: 100,
  topHundredShare: 48.9,
  bottomFiveHundredShare: 6.4
};

/**
 * Calculate global reward based on rank
 * @param {number} rank - User's ranking (1-1000)
 * @returns {number} Estimated S token reward
 */
export function calculateGlobalReward(rank) {
  if (rank < 1 || rank > 1000) return 0;
  
  // Key constraints from the distribution:
  // - Rank 1: 2.77% = 49,868 S tokens
  // - Top 100: 48.9% = 880,333 S tokens total
  // - Bottom 500 (501-1000): 6.4% = 115,217 S tokens total
  // - Rank 1000: 50 S tokens
  
  const rank1Reward = Math.round(globalPoolSize * 0.0277); // 49,868
  
  // Use a power law distribution: reward = a * rank^(-b)
  // where 'b' controls the decay steepness
  
  if (rank === 1) return rank1Reward;
  if (rank === 1000) return 50;
  
  // Calculate power law parameters to fit the distribution
  // Using b = 0.8 to match the heavy weighting toward top ranks
  const powerLawExponent = 0.8;
  
  // Calculate base reward using power law
  const rawReward = rank1Reward * Math.pow(rank, -powerLawExponent);
  
  // Apply additional scaling to match the distribution constraints
  let scaledReward;
  
  if (rank <= 100) {
    // Top 100 - maintain higher rewards
    scaledReward = rawReward * 0.9;
  } else if (rank <= 500) {
    // Middle ranks 101-500 - moderate decay
    const middleDecay = 0.5 + (0.4 * Math.pow((501 - rank) / 400, 0.5));
    scaledReward = rawReward * middleDecay;
  } else {
    // Bottom 500 (501-1000) - steep decay to reach 50 at rank 1000
    const bottomProgress = (rank - 500) / 500; // 0 to 1
    const startReward = rank1Reward * Math.pow(500, -powerLawExponent) * 0.3;
    scaledReward = startReward * Math.pow(1 - bottomProgress, 2) + 50;
  }
  
  return Math.max(50, Math.round(scaledReward));
}

/**
 * Calculate regional reward based on rank
 * @param {number} rank - User's ranking (1-100)
 * @returns {number} Estimated S token reward
 */
export function calculateRegionalReward(rank) {
  if (rank < 1 || rank > 100) return 0;

  // Rank 1 gets 4.91% of pool
  const topReward = regionalPoolSize * 0.0491;
  
  // Decay by 4.88% for each subsequent rank
  const decayRate = 0.9512; // (100% - 4.88%)
  
  return Math.round(topReward * Math.pow(decayRate, rank - 1));
}

/**
 * Format number with commas for display
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  return num.toLocaleString();
}

/**
 * Get region display name
 * @param {string} region - Region code ('korean' or 'mandarin')
 * @returns {string} Display name for region
 */
export function getRegionDisplayName(region) {
  switch (region) {
    case 'korean':
      return 'Korean';
    case 'mandarin':
      return 'Mandarin';
    default:
      return '';
  }
}

/**
 * Validate rank input
 * @param {number} rank - Rank to validate
 * @param {string} type - Type of ranking ('global' or 'regional')
 * @returns {boolean} Whether rank is valid
 */
export function validateRank(rank, type) {
  if (type === 'global') {
    return rank >= 1 && rank <= 1000;
  } else if (type === 'regional') {
    return rank >= 1 && rank <= 100;
  }
  return false;
                                         }
