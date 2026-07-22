import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';

/**
 * The hand-over card shown between turns. Nothing starts — crucially, not the
 * clock — until the team taps, so passing a single phone around is fair.
 */
export function TurnCard({ team, opponent, questionNumber, questionsPerTeam, onReady }) {
  const anim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    const entrance = Animated.timing(anim, {
      toValue: 1,
      duration: 480,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    });
    entrance.start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();

    return () => {
      entrance.stop();
      loop.stop();
    };
  }, [team.id, questionNumber, anim, pulse]);

  const cardStyle = {
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) },
    ],
  };

  const badgeStyle = {
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
  };

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.card, shadows.strong, cardStyle]}>
        <Text style={styles.eyebrow}>PASS THE DEVICE TO</Text>

        <Animated.View style={[styles.badge, { backgroundColor: team.accent }, badgeStyle]}>
          <Text style={styles.badgeEmoji}>{team.emoji}</Text>
        </Animated.View>

        <Text style={styles.teamName} numberOfLines={2}>
          {team.name}
        </Text>

        <Text style={styles.progress}>
          Question {questionNumber} of {questionsPerTeam}
        </Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreCell}>
            <Text style={styles.scoreLabel}>YOU</Text>
            <Text style={[styles.scoreValue, { color: team.accent }]}>
              {team.score.toLocaleString()}
            </Text>
          </View>
          <Text style={styles.vs}>VS</Text>
          <View style={styles.scoreCell}>
            <Text style={styles.scoreLabel} numberOfLines={1}>
              {opponent.name.toUpperCase()}
            </Text>
            <Text style={styles.scoreValue}>{opponent.score.toLocaleString()}</Text>
          </View>
        </View>

        <PrimaryButton
          label="We're Ready"
          icon="🎬"
          variant="success"
          onPress={onReady}
          testID="turn-ready"
        />

        <Text style={styles.footnote}>The clock starts when you tap.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(4,6,26,0.86)',
    zIndex: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: '#171238',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  eyebrow: {
    color: colors.textOnDarkMuted,
    fontSize: scale(11),
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  badge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: scale(40),
  },
  teamName: {
    color: colors.textOnDark,
    fontSize: scale(28),
    fontWeight: '900',
    textAlign: 'center',
  },
  progress: {
    color: colors.textOnDarkMuted,
    fontSize: scale(13),
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  scoreCell: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    color: colors.textOnDarkMuted,
    fontSize: scale(9.5),
    fontWeight: '900',
    letterSpacing: 1,
  },
  scoreValue: {
    color: colors.textOnDark,
    fontSize: scale(22),
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  vs: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: scale(13),
    fontWeight: '900',
  },
  footnote: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: scale(11.5),
    fontWeight: '600',
  },
});

export default TurnCard;
