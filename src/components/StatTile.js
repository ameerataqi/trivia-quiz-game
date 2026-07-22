import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';

/** Small labelled figure used on the home and results screens. */
export function StatTile({ label, value, emoji, tint, style }) {
  return (
    <View style={[styles.tile, style]}>
      {!!emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.value, tint && { color: tint }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.cardMuted,
  },
  emoji: {
    fontSize: scale(17),
  },
  value: {
    color: colors.text,
    fontSize: scale(19),
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default StatTile;
