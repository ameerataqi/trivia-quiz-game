import allQuestions from '../data/questions.json';
import { ALL_CATEGORIES } from '../data/categories';
import { QUESTIONS_PER_ROUND } from '../constants/gameConfig';
import { shuffle } from './shuffle';

/**
 * Guards against a malformed entry ever reaching the UI: every question must
 * have exactly four options and a correct answer that is one of them.
 */
export function isValidQuestion(q) {
  return (
    q &&
    typeof q.question === 'string' &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    new Set(q.options).size === 4 &&
    q.options.includes(q.correctAnswer)
  );
}

export const VALID_QUESTIONS = allQuestions.filter(isValidQuestion);

function matches(q, category, difficulty) {
  const categoryOk = category === ALL_CATEGORIES || q.category === category;
  const difficultyOk = !difficulty || q.difficulty === difficulty;
  return categoryOk && difficultyOk;
}

/** How many questions exist for a given filter — used to warn on the home screen. */
export function countAvailable(category, difficulty) {
  return VALID_QUESTIONS.filter((q) => matches(q, category, difficulty)).length;
}

/**
 * Builds a round.
 *
 * Questions are shuffled, and so are the four options inside each question, so
 * two rounds never look the same. If the exact category+difficulty combination
 * has too few questions we top the round up — first from the same category at
 * other difficulties, then from the same difficulty in other categories — so a
 * round is always full rather than silently short.
 */
export function buildRound({
  category = ALL_CATEGORIES,
  difficulty,
  count = QUESTIONS_PER_ROUND,
} = {}) {
  const exact = VALID_QUESTIONS.filter((q) => matches(q, category, difficulty));
  const sameCategory = VALID_QUESTIONS.filter((q) => matches(q, category, null));
  const sameDifficulty = VALID_QUESTIONS.filter((q) => matches(q, ALL_CATEGORIES, difficulty));

  const picked = [];
  const seen = new Set();

  const addFrom = (pool) => {
    shuffle(pool).forEach((q) => {
      if (picked.length >= count || seen.has(q.id)) return;
      seen.add(q.id);
      picked.push(q);
    });
  };

  addFrom(exact);
  addFrom(sameCategory);
  addFrom(sameDifficulty);
  addFrom(VALID_QUESTIONS);

  return picked.map((q) => ({
    ...q,
    // Shuffled copy so the correct answer is not always in the same slot.
    options: shuffle(q.options),
  }));
}

export default buildRound;
