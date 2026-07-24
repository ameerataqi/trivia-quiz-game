import { fetchQuestions } from '../api/openTdb';
import { shuffle } from './shuffle';
import { QUESTIONS_PER_CATEGORY, WILDCARDS_PER_TEAM } from '../constants/teamConfig';

export const SOURCE = {
  CHOSEN: 'chosen',
  WILDCARD: 'wildcard',
};

/**
 * Questions fetched per category. One request buys the whole battle plus
 * spares for the Swap power and a rematch, which matters because OpenTDB
 * rate limits to one request every five seconds.
 */
const PER_CATEGORY_FETCH = 10;

/** Mixed-category batch used for wildcards and Swap spares. */
const WILDCARD_FETCH = 20;

/**
 * Fetches everything a battle needs and deals it out.
 *
 * Requests are unavoidably sequential (rate limit), so distinct categories are
 * deduplicated first — if both teams pick History, it is fetched once. Total
 * requests is therefore (distinct categories + 1), and `onProgress` reports
 * each step so the UI can show real progress rather than a blind spinner.
 *
 * @param {object}   options
 * @param {Array}    options.teams      [{ name, categories: string[] }]
 * @param {string}   options.difficulty 'Easy' | 'Medium' | 'Hard'
 * @param {Function} options.onProgress ({ done, total, label }) => void
 * @returns {Promise<{queues: Array<Array<object>>, spares: Array<object>}>}
 */
export async function buildBattle({ teams, difficulty, onProgress }) {
  const distinctCategories = [...new Set(teams.flatMap((t) => t.categories))];
  const totalSteps = distinctCategories.length + 1;
  let done = 0;

  const report = (label) => onProgress?.({ done, total: totalSteps, label });
  report(distinctCategories[0]);

  // --- One request per distinct category -----------------------------------
  const byCategory = new Map();

  for (const category of distinctCategories) {
    try {
      const fetched = await fetchQuestions({
        amount: PER_CATEGORY_FETCH,
        category,
        difficulty,
      });
      byCategory.set(category, shuffle(fetched));
    } catch (error) {
      // A category with too few questions at this difficulty should not sink
      // the whole battle — it falls back to the mixed pool below.
      byCategory.set(category, []);
    }
    done += 1;
    report(distinctCategories[done] || 'Wildcards');
  }

  // --- One mixed request for wildcards and spares --------------------------
  let mixed = [];
  try {
    mixed = await fetchQuestions({ amount: WILDCARD_FETCH, difficulty });
  } catch (error) {
    mixed = [];
  }
  done += 1;
  report('Ready');

  // If every request failed there is nothing to play.
  const anything = [...byCategory.values()].some((list) => list.length) || mixed.length;
  if (!anything) {
    throw new Error('Could not load any questions for this battle.');
  }

  // --- Deal, never repeating a question across the two teams ---------------
  const used = new Set();
  const mixedPool = shuffle(mixed);

  const takeFrom = (pool) => {
    while (pool.length) {
      const q = pool.shift();
      if (!q || used.has(q.id)) continue;
      used.add(q.id);
      return q;
    }
    return null;
  };

  const takeMixed = (excludeCategories = []) => {
    const index = mixedPool.findIndex(
      (q) => !used.has(q.id) && !excludeCategories.includes(q.category),
    );
    // Fall back to any unused question rather than leaving a gap.
    const fallback = mixedPool.findIndex((q) => !used.has(q.id));
    const pick = index >= 0 ? index : fallback;
    if (pick < 0) return null;
    const [q] = mixedPool.splice(pick, 1);
    used.add(q.id);
    return q;
  };

  const queues = teams.map((team) => {
    const chosen = [];

    team.categories.forEach((category) => {
      for (let i = 0; i < QUESTIONS_PER_CATEGORY; i += 1) {
        const q = takeFrom(byCategory.get(category) || []) || takeMixed();
        if (q) chosen.push({ question: q, source: SOURCE.CHOSEN });
      }
    });

    const wildcards = [];
    for (let i = 0; i < WILDCARDS_PER_TEAM; i += 1) {
      // A wildcard should come from outside the team's own categories.
      const q = takeMixed(team.categories);
      if (q) wildcards.push({ question: q, source: SOURCE.WILDCARD });
    }

    return shuffle([...chosen, ...wildcards]);
  });

  // Whatever is left over backs the Swap power.
  const spares = [
    ...mixedPool.filter((q) => !used.has(q.id)),
    ...[...byCategory.values()].flat().filter((q) => !used.has(q.id)),
  ].map((question) => ({ question, source: SOURCE.CHOSEN }));

  return { queues, spares: shuffle(spares) };
}

export default buildBattle;
