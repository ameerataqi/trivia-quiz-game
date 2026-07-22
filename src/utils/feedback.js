import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Optional tactile "sound effects". Haptics ship with Expo Go and need no
 * asset files, so this works out of the box on device and no-ops on web.
 * Every call is wrapped because haptics are a nice-to-have, never critical.
 */
const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

function safe(fn) {
  if (!enabled) return;
  try {
    fn();
  } catch (e) {
    // Silently ignore — a missing haptics engine must never break gameplay.
  }
}

export const tapFeedback = () =>
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

export const correctFeedback = () =>
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

export const wrongFeedback = () =>
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));

export const timeoutFeedback = () =>
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));

export const tickFeedback = () =>
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft));

export const finishFeedback = () =>
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));

export default { tapFeedback, correctFeedback, wrongFeedback, timeoutFeedback, tickFeedback, finishFeedback };
