import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import ProgressBar from './ProgressBar';
import PrimaryButton from './PrimaryButton';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';

/**
 * The "call a friend" panel. It deliberately sits at the bottom rather than
 * covering the screen, so the team can still read the question aloud down the
 * phone. The question clock is paused for as long as this is up.
 */
export function FriendCallBar({ secondsLeft, progress, onEnd }) {
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, { toValue: 1, duration: 550, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 0, duration: 550, easing: Easing.linear, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [ring]);

  const wobble = {
    transform: [
      { rotate: ring.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '12deg'] }) },
    ],
  };

  const minutes = Math.floor(Math.max(0, secondsLeft) / 60);
  const seconds = Math.max(0, secondsLeft) % 60;

  return (
    <View style={[styles.bar, shadows.strong]}>
      <View style={styles.header}>
        <Animated.Text style={[styles.phone, wobble]}>📞</Animated.Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>Call in progress</Text>
          <Text style={styles.subtitle}>Question clock is paused</Text>
        </View>
        <Text style={styles.clock}>
          {minutes}:{String(seconds).padStart(2, '0')}
        </Text>
      </View>

      <ProgressBar progress={progress} height={8} animated={false} fillColors="#38BDF8" />

      <PrimaryButton label="End Call & Answer" icon="✅" variant="ghost" size="sm" onPress={onEnd} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(6,20,48,0.96)',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  phone: {
    fontSize: scale(26),
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.textOnDark,
    fontSize: scale(15),
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textOnDarkMuted,
    fontSize: scale(11.5),
    fontWeight: '600',
  },
  clock: {
    color: '#7DD3FC',
    fontSize: scale(26),
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
});

export default FriendCallBar;
