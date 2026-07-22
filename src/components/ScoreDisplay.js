import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import AnimatedNumber from './AnimatedNumber';
import { colors, radius, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';

/**
 * Live score pill for the quiz header, with a combo badge and a floating
 * "+120" that drifts up whenever points are awarded.
 */
export function ScoreDisplay({ score, streak = 0, lastAward }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!lastAward?.points) return undefined;

    floatAnim.setValue(0);
    const animation = Animated.timing(floatAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [lastAward, floatAnim]);

  const floatStyle = {
    opacity: floatAnim.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
    transform: [
      { translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [4, -26] }) },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.label}>SCORE</Text>
        <AnimatedNumber value={score} style={styles.score} />
      </View>

      {streak >= 2 && (
        <View style={styles.combo}>
          <Text style={styles.comboText}>🔥 {streak} in a row</Text>
        </View>
      )}

      {!!lastAward?.points && (
        <Animated.Text style={[styles.floating, floatStyle]} pointerEvents="none">
          +{lastAward.points}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  pill: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    backgroundColor: colors.overlayStrong,
    minWidth: 92,
  },
  label: {
    color: colors.textOnDarkMuted,
    fontSize: scale(10),
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  score: {
    color: colors.textOnDark,
    fontSize: scale(20),
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  combo: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,166,43,0.9)',
  },
  comboText: {
    color: colors.textOnDark,
    fontSize: scale(11),
    fontWeight: '800',
  },
  floating: {
    position: 'absolute',
    right: spacing.sm,
    top: -6,
    color: '#FFE27A',
    fontSize: scale(18),
    fontWeight: '900',
  },
});

export default ScoreDisplay;
