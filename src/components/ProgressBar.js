import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, radius } from '../constants/theme';

/**
 * Animated progress track. The fill is driven by scaleX rather than width so
 * the animation can run on the native driver and stay smooth.
 *
 * @param {number} progress 0 → 1
 */
export function ProgressBar({ progress, height = 10, trackColor, fillColors, animated = true }) {
  const value = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    const clamped = Math.min(1, Math.max(0, progress));
    if (!animated) {
      value.setValue(clamped);
      return undefined;
    }
    const animation = Animated.timing(value, {
      toValue: clamped,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, value, animated]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(progress * 100), min: 0, max: 100 }}
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor || colors.overlay },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: fillColors || colors.textOnDark,
            transform: [{ scaleX: value }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    // Anchor the scale to the left edge so the bar grows rightwards.
    transformOrigin: 'left',
  },
});

export default ProgressBar;
