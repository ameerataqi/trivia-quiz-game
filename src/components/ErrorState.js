import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';

/**
 * Shown when questions could not be fetched. The message comes from the API
 * layer (a TriviaError) so the player sees what actually went wrong rather
 * than a generic failure.
 */
export function ErrorState({ message, onRetry, onBack, retryable = true }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📡</Text>

      <View style={[styles.card, shadows.medium]}>
        <Text style={styles.title}>Could not load questions</Text>
        <Text style={styles.message}>{message || 'Something went wrong.'}</Text>
      </View>

      <View style={styles.actions}>
        {retryable && !!onRetry && (
          <PrimaryButton label="Try Again" icon="🔄" variant="warm" onPress={onRetry} testID="retry-fetch" />
        )}
        {!!onBack && <PrimaryButton label="Back" icon="🏠" variant="ghost" onPress={onBack} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing.xl,
  },
  emoji: {
    fontSize: scale(52),
  },
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  title: {
    color: colors.textOnDark,
    fontSize: scale(19),
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    color: colors.textOnDarkMuted,
    fontSize: scale(14),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: scale(20),
  },
  actions: {
    alignSelf: 'stretch',
    maxWidth: 420,
    width: '100%',
    gap: spacing.md,
  },
});

export default ErrorState;
