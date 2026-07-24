/**
 * The Open Trivia Database's 24 categories, with the presentation metadata the
 * pickers need. Codes are OpenTDB's own `category` query values.
 *
 * `shortName` exists because several official names are long and prefixed
 * ("Entertainment: Japanese Anime & Manga"); the full name is still used when
 * matching a question back to its category.
 */

export const ALL_CATEGORIES = 'All';

const META = [
  { id: 9, name: 'General Knowledge', shortName: 'General', emoji: '🧠', colors: ['#7C5CFF', '#B14CE0'] },
  { id: 10, name: 'Entertainment: Books', shortName: 'Books', emoji: '📚', colors: ['#B45309', '#92400E'] },
  { id: 11, name: 'Entertainment: Film', shortName: 'Film', emoji: '🎬', colors: ['#EC4899', '#DB2777'] },
  { id: 12, name: 'Entertainment: Music', shortName: 'Music', emoji: '🎵', colors: ['#A855F7', '#7C3AED'] },
  { id: 13, name: 'Entertainment: Musicals & Theatres', shortName: 'Musicals', emoji: '🎭', colors: ['#F43F5E', '#E11D48'] },
  { id: 14, name: 'Entertainment: Television', shortName: 'TV', emoji: '📺', colors: ['#6366F1', '#4338CA'] },
  { id: 15, name: 'Entertainment: Video Games', shortName: 'Video Games', emoji: '🎮', colors: ['#8B5CF6', '#6D28D9'] },
  { id: 16, name: 'Entertainment: Board Games', shortName: 'Board Games', emoji: '🎲', colors: ['#F59E0B', '#D97706'] },
  { id: 17, name: 'Science & Nature', shortName: 'Science', emoji: '🔬', colors: ['#00CEC9', '#0EA5A4'] },
  { id: 18, name: 'Science: Computers', shortName: 'Computers', emoji: '💻', colors: ['#64748B', '#475569'] },
  { id: 19, name: 'Science: Mathematics', shortName: 'Maths', emoji: '➗', colors: ['#0EA5E9', '#0284C7'] },
  { id: 20, name: 'Mythology', shortName: 'Mythology', emoji: '🏺', colors: ['#C9A227', '#E0A800'] },
  { id: 21, name: 'Sports', shortName: 'Sports', emoji: '⚽', colors: ['#22C55E', '#16A34A'] },
  { id: 22, name: 'Geography', shortName: 'Geography', emoji: '🗺️', colors: ['#3B82F6', '#2563EB'] },
  { id: 23, name: 'History', shortName: 'History', emoji: '🏛️', colors: ['#B45309', '#78350F'] },
  { id: 24, name: 'Politics', shortName: 'Politics', emoji: '🏛️', colors: ['#475569', '#334155'] },
  { id: 25, name: 'Art', shortName: 'Art', emoji: '🎨', colors: ['#F43F5E', '#BE123C'] },
  { id: 26, name: 'Celebrities', shortName: 'Celebrities', emoji: '🌟', colors: ['#FBBF24', '#F59E0B'] },
  { id: 27, name: 'Animals', shortName: 'Animals', emoji: '🦁', colors: ['#F59E0B', '#D97706'] },
  { id: 28, name: 'Vehicles', shortName: 'Vehicles', emoji: '🚗', colors: ['#EF4444', '#B91C1C'] },
  { id: 29, name: 'Entertainment: Comics', shortName: 'Comics', emoji: '💥', colors: ['#F97316', '#EA580C'] },
  { id: 30, name: 'Science: Gadgets', shortName: 'Gadgets', emoji: '🔌', colors: ['#14B8A6', '#0F766E'] },
  { id: 31, name: 'Entertainment: Japanese Anime & Manga', shortName: 'Anime', emoji: '🎌', colors: ['#EC4899', '#BE185D'] },
  { id: 32, name: 'Entertainment: Cartoon & Animations', shortName: 'Cartoons', emoji: '🐭', colors: ['#06B6D4', '#0891B2'] },
];

/** Picker entry meaning "let OpenTDB choose from every category". */
export const ALL_CATEGORIES_OPTION = {
  id: ALL_CATEGORIES,
  code: null,
  name: 'Any Category',
  shortName: 'Any',
  emoji: '🎲',
  colors: ['#FF6B9D', '#FFA62B'],
};

export const CATEGORIES = [
  ALL_CATEGORIES_OPTION,
  ...META.map((c) => ({ ...c, code: c.id, id: c.name })),
];

/** Categories a team can choose in battle mode ("Any" is solo-only). */
export const PICKABLE_CATEGORIES = CATEGORIES.filter((c) => c.id !== ALL_CATEGORIES);

/**
 * Looks up presentation metadata by category name. Falls back to a generic
 * entry so a category OpenTDB adds later still renders rather than crashing.
 */
export function getCategoryMeta(name) {
  return (
    CATEGORIES.find((c) => c.id === name) || {
      id: name,
      code: null,
      name: name || 'Trivia',
      shortName: name || 'Trivia',
      emoji: '❓',
      colors: ['#7C5CFF', '#B14CE0'],
    }
  );
}

/** OpenTDB numeric code for a category name, or null for "any". */
export function getCategoryCode(name) {
  if (!name || name === ALL_CATEGORIES) return null;
  return getCategoryMeta(name).code ?? null;
}

export default CATEGORIES;
