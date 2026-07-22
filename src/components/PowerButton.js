import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';
import { tapFeedback } from '../utils/feedback';

/**
 * One of a team's three single-use powers. Spent powers stay visible but go
 * flat and struck through, so each side can always see what it has left.
 */
export function PowerButton({ power, available, active, disabled, onPress }) {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const spent = !available;
  const inert = spent || disabled;

  const animateTo = (value) =>
    Animated.spring(pressAnim, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 8 }).start();

  const animatedStyle = {
    transform: [{ scale: pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.93] }) }],
  };

  return (
    <Animated.View style={[styles.wrapper, animatedStyle, !inert && shadows.soft]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${power.label}. ${spent ? 'Already used' : power.hint}`}
        accessibilityState={{ disabled: inert }}
        disabled={inert}
        onPressIn={() => animateTo(1)}
        onPressOut={() => animateTo(0)}
        onPress={() => {
          tapFeedback();
          onPress?.();
        }}
        style={styles.pressable}
      >
        {spent || disabled ? (
          <View style={[styles.face, styles.spentFace]}>
            <Text style={[styles.emoji, spent && styles.emojiSpent]}>{power.emoji}</Text>
            <Text style={[styles.label, styles.labelSpent]} numberOfLines={1}>
              {spent ? 'Used' : power.label}
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={power.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.face, active && styles.activeFace]}
          >
            <Text style={styles.emoji}>{power.emoji}</Text>
            <Text style={styles.label} numberOfLines={1}>
              {power.label}
            </Text>
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  pressable: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 58,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  activeFace: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  spentFace: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  emoji: {
    fontSize: scale(19),
  },
  emojiSpent: {
    opacity: 0.35,
  },
  label: {
    color: colors.textOnDark,
    fontSize: scale(10.5),
    fontWeight: '800',
    textAlign: 'center',
  },
  labelSpent: {
    color: 'rgba(255,255,255,0.45)',
  },
});

export default PowerButton;
