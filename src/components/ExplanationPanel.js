import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';

const HEADLINES = {
  correct: { emoji: '🎉', text: 'Correct!', tint: colors.correct },
  wrong: { emoji: '😅', text: 'Not quite', tint: colors.wrong },
  timeout: { emoji: '⏰', text: "Time's up!", tint: colors.amber },
};

/**
 * Post-answer feedback: a headline, the points earned and the correct answer.
 *
 * The Open Trivia Database does not ship explanations, so `explanation` is
 * optional — when it is absent the panel simply states the verified answer
 * rather than inventing prose about it. `meta` carries the category and
 * difficulty so the panel still has useful context to show.
 */
export function ExplanationPanel({ outcome, explanation, correctAnswer, points, meta }) {
  const anim = useRef(new Animated.Value(0)).current;
  const headline = HEADLINES[outcome] || HEADLINES.wrong;

  useEffect(() => {
    anim.setValue(0);
    const animation = Animated.timing(anim, {
      toValue: 1,
      duration: 340,
      delay: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [outcome, explanation, anim]);

  const animatedStyle = {
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  };

  return (
    <Animated.View style={[styles.card, shadows.medium, animatedStyle]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headline, { color: headline.tint }]}>
          {headline.emoji} {headline.text}
        </Text>
        {points > 0 && (
          <View style={styles.pointsPill}>
            <Text style={styles.pointsText}>+{points}</Text>
          </View>
        )}
      </View>

      <Text style={styles.answerLine}>
        {outcome === 'correct' ? 'You answered ' : 'Correct answer: '}
        <Text style={styles.answerStrong}>{correctAnswer}</Text>
      </Text>

      {!!explanation && <Text style={styles.explanation}>{explanation}</Text>}
      {!explanation && !!meta && <Text style={styles.meta}>{meta}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headline: {
    fontSize: scale(17),
    fontWeight: '900',
    flexShrink: 1,
  },
  pointsPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.correct,
  },
  pointsText: {
    color: colors.textOnDark,
    fontSize: scale(13),
    fontWeight: '900',
  },
  answerLine: {
    color: colors.textMuted,
    fontSize: scale(14),
    fontWeight: '600',
  },
  answerStrong: {
    color: colors.text,
    fontWeight: '900',
  },
  explanation: {
    color: colors.textMuted,
    fontSize: scale(14.5),
    lineHeight: scale(21),
    fontWeight: '600',
  },
  meta: {
    color: colors.textMuted,
    fontSize: scale(12.5),
    fontWeight: '600',
  },
});

export default ExplanationPanel;
