/**
 * Rules and presentation for the two-team battle mode.
 */

/** How many questions each team draws from EACH of its chosen categories. */
export const QUESTIONS_PER_CATEGORY = 1;

/** How many categories a team must choose before the battle can start. */
export const CATEGORIES_PER_TEAM = 3;

/** Wildcard questions per team, drawn from categories the team did NOT pick. */
export const WILDCARDS_PER_TEAM = 1;

/** Total questions a single team answers in one battle. */
export const QUESTIONS_PER_TEAM =
  CATEGORIES_PER_TEAM * QUESTIONS_PER_CATEGORY + WILDCARDS_PER_TEAM;

/** Seconds on the clock when a team phones a friend. */
export const FRIEND_CALL_SECONDS = 60;

/** Multiplier applied when the Double Points power is active. */
export const DOUBLE_MULTIPLIER = 2;

export const POWER = {
  DOUBLE: 'double',
  FRIEND: 'friend',
  SWAP: 'swap',
};

/** Each power can be used exactly once per team, per battle. */
export const POWERS = [
  {
    id: POWER.DOUBLE,
    emoji: '⚡',
    label: 'Double',
    hint: '2× points on this question',
    colors: ['#FBBF24', '#F59E0B'],
  },
  {
    id: POWER.FRIEND,
    emoji: '📞',
    label: 'Call a Friend',
    hint: `${FRIEND_CALL_SECONDS}s to phone for help`,
    colors: ['#38BDF8', '#0284C7'],
  },
  {
    id: POWER.SWAP,
    emoji: '🔄',
    label: 'Swap',
    hint: 'Replace this question',
    colors: ['#A78BFA', '#7C3AED'],
  },
];

/** Visual identity for each side. The active team colours the whole screen. */
export const TEAM_THEMES = [
  {
    id: 0,
    defaultName: 'Team Alpha',
    emoji: '🔷',
    accent: '#22D3EE',
    chip: ['#22D3EE', '#0284C7'],
    backdrop: ['#04122E', '#0B3E7A', '#22D3EE'],
  },
  {
    id: 1,
    defaultName: 'Team Omega',
    emoji: '🔶',
    accent: '#FB7185',
    chip: ['#FB923C', '#E11D48'],
    backdrop: ['#2B0418', '#8C1D45', '#FB923C'],
  },
];

/** Shown only when both teams finish on exactly the same score. */
export const DRAW_VERDICT = {
  emoji: '🤝',
  title: 'Dead heat!',
  line: 'Level on points — neither side gave an inch.',
};

/** Result copy for a win, chosen by the winning margin. */
export const BATTLE_VERDICTS = [
  { min: 0, emoji: '😅', title: 'Nail-biter!', line: 'A photo finish — one question either way.' },
  { min: 200, emoji: '🎉', title: 'Hard-fought win!', line: 'That could have gone either way.' },
  { min: 600, emoji: '🏆', title: 'Convincing victory!', line: 'Held the lead from start to finish.' },
  { min: 1200, emoji: '👑', title: 'Total domination!', line: 'That was not a battle, it was a lesson.' },
];

export default {
  QUESTIONS_PER_CATEGORY,
  CATEGORIES_PER_TEAM,
  WILDCARDS_PER_TEAM,
  QUESTIONS_PER_TEAM,
  FRIEND_CALL_SECONDS,
  DOUBLE_MULTIPLIER,
  POWER,
  POWERS,
  TEAM_THEMES,
  BATTLE_VERDICTS,
  DRAW_VERDICT,
};
