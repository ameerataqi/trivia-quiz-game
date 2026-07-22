import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, shadows, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';
import { tapFeedback } from '../utils/feedback';

const VARIANTS = {
  primary: gradients.primaryButton,
  success: gradients.successButton,
  warm: gradients.warmButton,
  ghost: gradients.ghostButton,
};

/**
 * The app's main call-to-action button: gradient face, springy press
 * animation, large touch target and an optional leading emoji.
 */
export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  fullWidth = true,
  size = 'lg',
  style,
  testID,
}) {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const animateTo = (value) =>
    Animated.spring(pressAnim, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  const scaleStyle = {
    transform: [
      {
        scale: pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] }),
      },
    ],
  };

  const handlePress = () => {
    if (disabled) return;
    tapFeedback();
    onPress?.();
  };

  const isCompact = size === 'sm';

  return (
    <Animated.View
      style={[
        scaleStyle,
        fullWidth && styles.fullWidth,
        variant !== 'ghost' && shadows.medium,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        testID={testID}
        disabled={disabled}
        onPressIn={() => animateTo(1)}
        onPressOut={() => animateTo(0)}
        onPress={handlePress}
        style={styles.pressable}
      >
        <LinearGradient
          colors={VARIANTS[variant] || VARIANTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.face,
            isCompact ? styles.faceCompact : styles.faceRegular,
            variant === 'ghost' && styles.ghostFace,
          ]}
        >
          <View style={styles.content}>
            {!!icon && <Text style={[styles.icon, isCompact && styles.iconCompact]}>{icon}</Text>}
            <Text
              numberOfLines={1}
              style={[styles.label, isCompact && styles.labelCompact]}
            >
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressable: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  faceRegular: {
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  faceCompact: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  ghostFace: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: scale(20),
  },
  iconCompact: {
    fontSize: scale(15),
  },
  label: {
    color: colors.textOnDark,
    fontSize: scale(17),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  labelCompact: {
    fontSize: scale(14),
  },
  disabled: {
    opacity: 0.45,
  },
});

export default PrimaryButton;
