import { SCORING, DIFFICULTIES, RESULT_TIERS, DEFAULT_DIFFICULTY } from '../constants/gameConfig';

export function getDifficultyConfig(id) {
  return DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES.find((d) => d.id === DEFAULT_DIFFICULTY);
}

/** Combo multiplier for the current streak, capped so it cannot run away. */
export function comboMultiplier(streak) {
  const bonusSteps = Math.max(0, streak - 1);
  return Math.min(SCORING.maxCombo, 1 + bonusSteps * SCORING.comboStep);
}

/**
 * Points for a single correct answer.
 * @param {number} secondsLeft seconds remaining on the clock
 * @param {string} difficulty difficulty id
 * @param {number} streak how many in a row are now correct, including this one
 */
export function pointsForAnswer({ secondsLeft, difficulty, streak }) {
  const { multiplier } = getDifficultyConfig(difficulty);
  const timeBonus = Math.max(0, Math.floor(secondsLeft)) * SCORING.pointsPerSecondLeft;
  const combo = comboMultiplier(streak);
  return {
    points: Math.round((SCORING.base * multiplier + timeBonus) * combo),
    timeBonus,
    combo,
  };
}

export function accuracy(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export function resultTier(percentage) {
  return RESULT_TIERS.find((tier) => percentage >= tier.min) || RESULT_TIERS[RESULT_TIERS.length - 1];
}

export default { pointsForAnswer, comboMultiplier, accuracy, resultTier, getDifficultyConfig };
