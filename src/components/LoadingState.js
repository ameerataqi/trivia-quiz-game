import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';

/**
 * Shown while questions are being fetched from the Open Trivia Database.
 * `detail` carries per-step progress in battle mode, where several categories
 * are fetched in turn.
 */
export function LoadingState({ title = 'Loading questions…', detail }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const bounce = {
    transform: [{ translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) }],
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.emoji, bounce]}>🧠</Animated.Text>

      <View style={[styles.card, shadows.medium]}>
        <ActivityIndicator size="large" color={colors.textOnDark} />
        <Text style={styles.title}>{title}</Text>
        {!!detail && <Text style={styles.detail}>{detail}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing.xl,
  },
  emoji: {
    fontSize: scale(56),
  },
  card: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    minWidth: 260,
  },
  title: {
    color: colors.textOnDark,
    fontSize: scale(16),
    fontWeight: '800',
    textAlign: 'center',
  },
  detail: {
    color: colors.textOnDarkMuted,
    fontSize: scale(12.5),
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoadingState;
