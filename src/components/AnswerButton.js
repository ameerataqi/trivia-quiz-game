import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { answerPalette, colors, gradients, radius, shadows, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';

const LETTERS = ['A', 'B', 'C', 'D'];

/** Visual states an answer can be in once the question has been resolved. */
export const ANSWER_STATE = {
  IDLE: 'idle',
  CORRECT: 'correct',
  WRONG: 'wrong',
  DIMMED: 'dimmed',
};

function facesFor(state, index) {
  switch (state) {
    case ANSWER_STATE.CORRECT:
      return gradients.correct;
    case ANSWER_STATE.WRONG:
      return gradients.wrong;
    case ANSWER_STATE.DIMMED:
      return ['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.22)'];
    default:
      return answerPalette[index % answerPalette.length].face;
  }
}

/**
 * One of the four answer options.
 *
 * Idle options each get their own colour from the palette. Once answered the
 * correct option turns green, an incorrect pick turns red and shakes, and the
 * remaining options fade back so the feedback reads instantly.
 */
export function AnswerButton({ label, index, state = ANSWER_STATE.IDLE, disabled, onPress }) {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const entrance = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Staggered entrance so the four options cascade in.
  useEffect(() => {
    entrance.setValue(0);
    const animation = Animated.timing(entrance, {
      toValue: 1,
      duration: 320,
      delay: 90 + index * 70,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [entrance, index, label]);

  // Celebrate a correct answer, shake a wrong one.
  useEffect(() => {
    if (state === ANSWER_STATE.CORRECT) {
      Animated.sequence([
        Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 14 }),
        Animated.spring(pulseAnim, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 8 }),
      ]).start();
    }

    if (state === ANSWER_STATE.WRONG) {
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0.6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -0.4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [state, pulseAnim, shakeAnim]);

  const animatedStyle = {
    opacity: Animated.multiply(
      entrance,
      state === ANSWER_STATE.DIMMED ? 0.65 : 1,
    ),
    transform: [
      { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) },
      { translateX: shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] }) },
      {
        scale: Animated.add(
          pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] }),
          pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.04] }),
        ),
      },
    ],
  };

  const animateTo = (value) =>
    Animated.spring(pressAnim, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 4 }).start();

  const badgeColor =
    state === ANSWER_STATE.IDLE
      ? answerPalette[index % answerPalette.length].badge
      : 'rgba(0,0,0,0.22)';

  return (
    <Animated.View style={[styles.wrapper, shadows.soft, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Option ${LETTERS[index]}: ${label}`}
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPressIn={() => animateTo(1)}
        onPressOut={() => animateTo(0)}
        onPress={onPress}
        style={styles.pressable}
      >
        <LinearGradient
          colors={facesFor(state, index)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.face}
        >
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{LETTERS[index]}</Text>
          </View>

          <Text style={styles.label} numberOfLines={3}>
            {label}
          </Text>

          {state === ANSWER_STATE.CORRECT && <Text style={styles.mark}>✓</Text>}
          {state === ANSWER_STATE.WRONG && <Text style={styles.mark}>✕</Text>}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
  },
  pressable: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 62,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.textOnDark,
    fontSize: scale(15),
    fontWeight: '900',
  },
  label: {
    flex: 1,
    color: colors.textOnDark,
    fontSize: scale(15.5),
    fontWeight: '700',
    lineHeight: scale(21),
  },
  mark: {
    color: colors.textOnDark,
    fontSize: scale(20),
    fontWeight: '900',
    marginLeft: spacing.xs,
  },
});

export default AnswerButton;
