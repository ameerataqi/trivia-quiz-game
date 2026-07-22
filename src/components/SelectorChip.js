import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';
import { tapFeedback } from '../utils/feedback';

/**
 * Selectable chip used by both the difficulty and the category pickers.
 * Selected chips fill with their own gradient; unselected ones stay glassy.
 */
export function SelectorChip({
  label,
  emoji,
  sublabel,
  selected,
  colors: faceColors,
  onPress,
  style,
  // 'row' puts the emoji beside the text; 'stack' centres it above, which
  // keeps labels readable when several chips share a narrow row.
  layout = 'row',
}) {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const stacked = layout === 'stack';

  const animateTo = (value) =>
    Animated.spring(pressAnim, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  const animatedStyle = {
    transform: [{ scale: pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] }) }],
  };

  const content = (
    <View style={[styles.content, stacked && styles.contentStacked]}>
      {!!emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <View style={[styles.textCol, stacked && styles.textColStacked]}>
        <Text
          style={[
            styles.label,
            stacked && styles.labelStacked,
            !selected && styles.labelUnselected,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {!!sublabel && (
          <Text
            style={[
              styles.sublabel,
              stacked && styles.sublabelStacked,
              !selected && styles.sublabelUnselected,
            ]}
            numberOfLines={1}
          >
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <Animated.View style={[animatedStyle, selected && shadows.soft, style]}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: !!selected }}
        accessibilityLabel={label}
        onPressIn={() => animateTo(1)}
        onPressOut={() => animateTo(0)}
        onPress={() => {
          tapFeedback();
          onPress?.();
        }}
        style={styles.pressable}
      >
        {selected ? (
          <LinearGradient
            colors={faceColors || ['#7C5CFF', '#B14CE0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.face}
          >
            {content}
          </LinearGradient>
        ) : (
          <View style={[styles.face, styles.unselectedFace]}>{content}</View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  face: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    justifyContent: 'center',
  },
  unselectedFace: {
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contentStacked: {
    flexDirection: 'column',
    gap: 2,
  },
  textCol: {
    flex: 1,
  },
  textColStacked: {
    // Explicit values rather than `flex: 0` — a zero flex-basis inside a
    // column container collapses the text to zero height.
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    alignItems: 'center',
  },
  emoji: {
    fontSize: scale(18),
  },
  label: {
    color: colors.textOnDark,
    fontSize: scale(14),
    fontWeight: '800',
  },
  labelStacked: {
    textAlign: 'center',
  },
  labelUnselected: {
    color: colors.textOnDarkMuted,
  },
  sublabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: scale(11),
    fontWeight: '600',
    marginTop: 1,
  },
  sublabelStacked: {
    textAlign: 'center',
  },
  sublabelUnselected: {
    color: 'rgba(255,255,255,0.6)',
  },
});

export default SelectorChip;
