import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import ProgressBar from './ProgressBar';
import { colors, radius, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';

const DANGER_SECONDS = 5;

/**
 * Countdown display: a seconds badge that pulses and turns red in the final
 * few seconds, plus a depleting bar underneath.
 *
 * @param {number} secondsLeft whole seconds remaining
 * @param {number} progress    1 → 0 as the clock runs down
 * @param {boolean} paused     true while answer feedback is showing
 */
export function Timer({ secondsLeft, progress, paused }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const danger = secondsLeft <= DANGER_SECONDS && !paused;

  useEffect(() => {
    if (!danger) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [danger, pulse]);

  const pulseStyle = {
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.badge,
          danger && styles.badgeDanger,
          paused && styles.badgePaused,
          pulseStyle,
        ]}
      >
        <Text style={styles.icon}>{paused ? '⏸' : '⏱'}</Text>
        <Text style={styles.seconds}>{Math.max(0, secondsLeft)}s</Text>
      </Animated.View>

      <View style={styles.barWrap}>
        <ProgressBar
          progress={progress}
          height={8}
          animated={false}
          fillColors={danger ? colors.wrong : colors.textOnDark}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.overlayStrong,
  },
  badgeDanger: {
    backgroundColor: colors.wrong,
  },
  badgePaused: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  icon: {
    fontSize: scale(13),
  },
  seconds: {
    color: colors.textOnDark,
    fontSize: scale(15),
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    minWidth: scale(30),
    textAlign: 'center',
  },
  barWrap: {
    width: '100%',
  },
});

export default Timer;
