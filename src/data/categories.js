import questions from './questions.json';

/**
 * Presentation metadata for each category. Any category that appears in
 * questions.json but is missing here still works — it just falls back to a
 * default emoji and colour, so adding new categories never breaks the UI.
 */
const CATEGORY_META = {
  'General Knowledge': { emoji: '🧠', colors: ['#7C5CFF', '#B14CE0'] },
  Science: { emoji: '🔬', colors: ['#00CEC9', '#0EA5A4'] },
  History: { emoji: '🏛️', colors: ['#C9A227', '#E0A800'] },
  Geography: { emoji: '🗺️', colors: ['#3B82F6', '#2563EB'] },
  Technology: { emoji: '💻', colors: ['#64748B', '#475569'] },
  Movies: { emoji: '🎬', colors: ['#EC4899', '#DB2777'] },
  Music: { emoji: '🎵', colors: ['#A855F7', '#7C3AED'] },
  Sports: { emoji: '⚽', colors: ['#22C55E', '#16A34A'] },
  Food: { emoji: '🍕', colors: ['#FB923C', '#EA580C'] },
  Animals: { emoji: '🦁', colors: ['#F59E0B', '#D97706'] },
  Nature: { emoji: '🌿', colors: ['#10B981', '#059669'] },
  Space: { emoji: '🚀', colors: ['#6366F1', '#4338CA'] },
  Literature: { emoji: '📚', colors: ['#B45309', '#92400E'] },
  Art: { emoji: '🎨', colors: ['#F43F5E', '#E11D48'] },
};

const DEFAULT_META = { emoji: '❓', colors: ['#7C5CFF', '#B14CE0'] };

export const ALL_CATEGORIES = 'All';

/** Special entry used by the picker to mean "mix every category together". */
export const ALL_CATEGORIES_OPTION = {
  id: ALL_CATEGORIES,
  name: ALL_CATEGORIES,
  emoji: '🎲',
  colors: ['#FF6B9D', '#FFA62B'],
  count: questions.length,
};

/**
 * Categories are derived from the question bank itself, so dropping new
 * questions into questions.json is all that is needed to extend the game.
 */
const derived = [...new Set(questions.map((q) => q.category))].sort().map((name) => {
  const meta = CATEGORY_META[name] || DEFAULT_META;
  return {
    id: name,
    name,
    emoji: meta.emoji,
    colors: meta.colors,
    count: questions.filter((q) => q.category === name).length,
  };
});

export const CATEGORIES = [ALL_CATEGORIES_OPTION, ...derived];

export function getCategoryMeta(name) {
  return CATEGORIES.find((c) => c.id === name) || ALL_CATEGORIES_OPTION;
}

export default CATEGORIES;
