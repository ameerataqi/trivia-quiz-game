/**
 * All tunable game rules live here — round length, per-difficulty timers and
 * the scoring formula inputs. Change these to rebalance the game.
 */

export const QUESTIONS_PER_ROUND = 12;

/** Every question gets the same clock, whatever the difficulty. */
export const SECONDS_PER_QUESTION = 30;

/**
 * Difficulty now changes how hard the questions are and how much they are
 * worth — not how long you get. Give a level its own `seconds` if you want a
 * time penalty back on Hard.
 */
export const DIFFICULTIES = [
  {
    id: 'Easy',
    label: 'Easy',
    emoji: '🌱',
    blurb: 'Gentle warm-up',
    seconds: SECONDS_PER_QUESTION,
    multiplier: 1,
    colors: ['#34D399', '#10B981'],
  },
  {
    id: 'Medium',
    label: 'Medium',
    emoji: '🔥',
    blurb: 'A real test',
    seconds: SECONDS_PER_QUESTION,
    multiplier: 1.5,
    colors: ['#FFA62B', '#FB7A45'],
  },
  {
    id: 'Hard',
    label: 'Hard',
    emoji: '💀',
    blurb: 'Experts only',
    seconds: SECONDS_PER_QUESTION,
    multiplier: 2,
    colors: ['#FB7185', '#DC2626'],
  },
];

export const DEFAULT_DIFFICULTY = 'Medium';

/** Answer feedback stays on screen at least this long before "Next" is useful. */
export const FEEDBACK_DELAY_MS = 250;

export const SCORING = {
  /** Flat points for any correct answer, before multipliers. */
  base: 100,
  /** Points granted per whole second left on the clock. */
  pointsPerSecondLeft: 8,
  /** Each consecutive correct answer adds this much to the combo multiplier. */
  comboStep: 0.1,
  /** Combo multiplier never grows past this. */
  maxCombo: 2,
};

/** Result copy is picked by accuracy percentage, highest matching tier wins. */
export const RESULT_TIERS = [
  { min: 90, emoji: '🏆', title: 'Trivia Legend!', message: 'Almost flawless. That was seriously impressive.' },
  { min: 75, emoji: '🌟', title: 'Brilliant!', message: 'You know your stuff. A few more and it is perfect.' },
  { min: 60, emoji: '🎯', title: 'Nicely done!', message: 'Solid round. Another go could push you higher.' },
  { min: 40, emoji: '💪', title: 'Getting there!', message: 'Good effort — practice makes a champion.' },
  { min: 0, emoji: '🌱', title: 'Room to grow!', message: 'Every expert started right here. Run it back!' },
];

export default {
  QUESTIONS_PER_ROUND,
  SECONDS_PER_QUESTION,
  DIFFICULTIES,
  DEFAULT_DIFFICULTY,
  FEEDBACK_DELAY_MS,
  SCORING,
  RESULT_TIERS,
};
