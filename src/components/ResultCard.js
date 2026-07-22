import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import AnimatedNumber from './AnimatedNumber';
import ProgressBar from './ProgressBar';
import StatTile from './StatTile';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';

/**
 * The summary card on the results screen: animated final score, accuracy bar
 * and the correct/incorrect breakdown.
 */
export function ResultCard({ tier, score, correct, incorrect, total, percentage, bestStreak, isNewRecord }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [anim]);

  const animatedStyle = {
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
    ],
  };

  return (
    <Animated.View style={[styles.card, shadows.strong, animatedStyle]}>
      <Text style={styles.emoji}>{tier.emoji}</Text>
      <Text style={styles.title}>{tier.title}</Text>
      <Text style={styles.message}>{tier.message}</Text>

      {isNewRecord && (
        <View style={styles.recordBadge}>
          <Text style={styles.recordText}>🏅 NEW PERSONAL BEST</Text>
        </View>
      )}

      <View style={styles.scoreBlock}>
        <Text style={styles.scoreLabel}>FINAL SCORE</Text>
        <AnimatedNumber value={score} duration={900} style={styles.score} />
      </View>

      <View style={styles.accuracyBlock}>
        <View style={styles.accuracyRow}>
          <Text style={styles.accuracyLabel}>Accuracy</Text>
          <Text style={styles.accuracyValue}>{percentage}%</Text>
        </View>
        <ProgressBar
          progress={percentage / 100}
          height={12}
          trackColor={colors.cardMuted}
          fillColors={percentage >= 60 ? colors.correct : colors.amber}
        />
      </View>

      <View style={styles.stats}>
        <StatTile emoji="✅" label="Correct" value={String(correct)} tint={colors.correct} />
        <StatTile emoji="❌" label="Incorrect" value={String(incorrect)} tint={colors.wrong} />
        <StatTile emoji="🔥" label="Best streak" value={String(bestStreak)} />
      </View>

      <Text style={styles.footnote}>
        {correct} of {total} questions answered correctly
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: scale(52),
  },
  title: {
    color: colors.text,
    fontSize: scale(25),
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    fontSize: scale(14),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: scale(20),
  },
  recordBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#FFF3C4',
  },
  recordText: {
    color: '#A16207',
    fontSize: scale(11.5),
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  scoreBlock: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  score: {
    color: colors.primary,
    fontSize: scale(46),
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  accuracyBlock: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  accuracyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accuracyLabel: {
    color: colors.textMuted,
    fontSize: scale(13),
    fontWeight: '800',
  },
  accuracyValue: {
    color: colors.text,
    fontSize: scale(15),
    fontWeight: '900',
  },
  stats: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  footnote: {
    color: colors.textMuted,
    fontSize: scale(12.5),
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default ResultCard;
