import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { getCategoryMeta } from '../data/categories';
import { scale } from '../utils/responsive';

const DIFFICULTY_TINT = {
  Easy: '#22C55E',
  Medium: '#F59E0B',
  Hard: '#EF4444',
};

/**
 * White card holding the question text plus its category and difficulty tags.
 * Re-animates on every new question so each one feels like a fresh card.
 */
export function QuestionCard({ question, category, difficulty }) {
  const anim = useRef(new Animated.Value(0)).current;
  const meta = getCategoryMeta(category);

  useEffect(() => {
    anim.setValue(0);
    const animation = Animated.timing(anim, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [question, anim]);

  const animatedStyle = {
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) },
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
    ],
  };

  return (
    <Animated.View style={[styles.card, shadows.strong, animatedStyle]}>
      <View style={styles.tags}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {meta.emoji} {category}
          </Text>
        </View>
        <View
          style={[
            styles.tag,
            { backgroundColor: `${DIFFICULTY_TINT[difficulty] || colors.primary}22` },
          ]}
        >
          <Text style={[styles.tagText, { color: DIFFICULTY_TINT[difficulty] || colors.primary }]}>
            {difficulty}
          </Text>
        </View>
      </View>

      <Text style={styles.question} accessibilityRole="header">
        {question}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.cardMuted,
  },
  tagText: {
    color: colors.textMuted,
    fontSize: scale(11.5),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  question: {
    color: colors.text,
    fontSize: scale(21),
    lineHeight: scale(29),
    fontWeight: '800',
  },
});

export default QuestionCard;
