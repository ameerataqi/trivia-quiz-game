/**
 * Central design tokens. Every component pulls colour, spacing, radius and
 * shadow values from here so the whole app stays visually consistent.
 */

export const colors = {
  // Brand
  primary: '#6C5CE7',
  primaryDark: '#4B3FC4',
  accent: '#FF6B9D',
  amber: '#FFA62B',
  teal: '#00CEC9',

  // Feedback
  correct: '#22C55E',
  correctDark: '#15803D',
  wrong: '#EF4444',
  wrongDark: '#B91C1C',

  // Surfaces
  backdrop: '#12002E',
  card: '#FFFFFF',
  cardMuted: '#F4F2FF',
  overlay: 'rgba(255,255,255,0.14)',
  overlayStrong: 'rgba(255,255,255,0.24)',
  hairline: 'rgba(17,12,46,0.08)',

  // Text
  text: '#1B1443',
  textMuted: '#6B6591',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255,255,255,0.76)',
};

/**
 * The single backdrop every non-battle screen shares. Battle screens are the
 * deliberate exception — they tint to whichever team is answering.
 */
export const APP_BACKDROP = ['#12002E', '#4A1B8C', '#B01E68'];

/** Multi-stop gradients used for screen backdrops and buttons. */
export const gradients = {
  app: APP_BACKDROP,
  home: APP_BACKDROP,
  quiz: APP_BACKDROP,
  results: APP_BACKDROP,
  primaryButton: ['#7C5CFF', '#B14CE0'],
  successButton: ['#34D399', '#10B981'],
  warmButton: ['#FFB13D', '#FF7A45'],
  ghostButton: ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.12)'],
  correct: ['#4ADE80', '#16A34A'],
  wrong: ['#FB7185', '#DC2626'],
};

/** Per-answer accent colours so the four options feel playful, not uniform. */
export const answerPalette = [
  { face: ['#6C5CE7', '#8B5CF6'], badge: '#4C3BB8' },
  { face: ['#00CEC9', '#0EA5A4'], badge: '#0B7E7C' },
  { face: ['#FFA62B', '#FB923C'], badge: '#C2680E' },
  { face: ['#FF6B9D', '#F0518A'], badge: '#C13469' },
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 44,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const typography = {
  display: { fontSize: 40, fontWeight: '900', letterSpacing: -0.5 },
  title: { fontSize: 26, fontWeight: '800' },
  heading: { fontSize: 20, fontWeight: '800' },
  body: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.6 },
  caption: { fontSize: 12, fontWeight: '600' },
};

/** Cross-platform elevation presets (iOS shadow + Android elevation). */
export const shadows = {
  soft: {
    shadowColor: '#12064A',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  medium: {
    shadowColor: '#12064A',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  strong: {
    shadowColor: '#12064A',
    shadowOpacity: 0.32,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
};

export default { colors, gradients, answerPalette, spacing, radius, typography, shadows };
