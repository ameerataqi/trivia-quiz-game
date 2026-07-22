import { VALID_QUESTIONS } from './questionPool';
import { shuffle } from './shuffle';
import {
  QUESTIONS_PER_CATEGORY,
  WILDCARDS_PER_TEAM,
} from '../constants/teamConfig';

export const SOURCE = {
  CHOSEN: 'chosen',
  WILDCARD: 'wildcard',
};

/** Options are shuffled per draw so the answer is never in a predictable slot. */
function withShuffledOptions(question) {
  return { ...question, options: shuffle(question.options) };
}

/**
 * Draws `count` questions, walking through the candidate tiers in order until
 * it has enough. Tiers let us say "ideally this category at this difficulty,
 * but fall back rather than come up short". Anything already drawn — by either
 * team — is skipped, so the two teams never see the same question.
 */
function drawTiered(tiers, count, used) {
  const picked = [];

  for (const tier of tiers) {
    if (picked.length >= count) break;
    for (const question of shuffle(tier)) {
      if (picked.length >= count) break;
      if (used.has(question.id)) continue;
      used.add(question.id);
      picked.push(question);
    }
  }

  return picked;
}

/**
 * Builds the full question set for a battle.
 *
 * Each team gets `QUESTIONS_PER_CATEGORY` question(s) from each category it
 * chose, plus `WILDCARDS_PER_TEAM` wildcard(s) drawn from categories it did
 * NOT choose — so the wildcard is always a genuine surprise. The resulting
 * queue is shuffled so the wildcard is not predictably last.
 *
 * @returns {{queues: Array<Array<object>>, spares: Array<object>}} spares are
 *   held back to service the Swap power.
 */
export function buildBattle({ teams, difficulty, spareCount = 6 }) {
  const used = new Set();

  const atDifficulty = (list) => list.filter((q) => q.difficulty === difficulty);

  const queues = teams.map((team) => {
    const chosen = team.categories.flatMap((category) => {
      const inCategory = VALID_QUESTIONS.filter((q) => q.category === category);
      return drawTiered(
        [atDifficulty(inCategory), inCategory],
        QUESTIONS_PER_CATEGORY,
        used,
      ).map((question) => ({
        question: withShuffledOptions(question),
        source: SOURCE.CHOSEN,
      }));
    });

    const outside = VALID_QUESTIONS.filter((q) => !team.categories.includes(q.category));
    const wildcards = drawTiered(
      [atDifficulty(outside), outside, VALID_QUESTIONS],
      WILDCARDS_PER_TEAM,
      used,
    ).map((question) => ({
      question: withShuffledOptions(question),
      source: SOURCE.WILDCARD,
    }));

    return shuffle([...chosen, ...wildcards]);
  });

  // Reserve a handful of untouched questions for the Swap power.
  const spares = drawTiered([atDifficulty(VALID_QUESTIONS), VALID_QUESTIONS], spareCount, used).map(
    (question) => ({ question: withShuffledOptions(question), source: SOURCE.CHOSEN }),
  );

  return { queues, spares };
}

export default buildBattle;
