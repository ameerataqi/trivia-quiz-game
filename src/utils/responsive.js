import { Dimensions, PixelRatio, Platform } from 'react-native';

const BASE_WIDTH = 390; // iPhone 14 / Pixel-ish reference width

/**
 * Scales a value to the current screen width but damps the effect so text does
 * not become comically large on tablets. Used for font sizes and key spacing.
 */
export function scale(size, factor = 0.5) {
  const { width } = Dimensions.get('window');
  const clamped = Math.min(Math.max(width, 320), 620);
  const scaled = size + (clamped / BASE_WIDTH - 1) * size * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
}

/** Anything wider than this gets a centred, max-width content column. */
export const TABLET_BREAKPOINT = 600;

export function isTablet(width) {
  return width >= TABLET_BREAKPOINT;
}

/** Content never stretches edge-to-edge on a wide screen. */
export function contentMaxWidth(width) {
  return isTablet(width) ? 560 : width;
}

export const isWeb = Platform.OS === 'web';

export default { scale, isTablet, contentMaxWidth, isWeb, TABLET_BREAKPOINT };
