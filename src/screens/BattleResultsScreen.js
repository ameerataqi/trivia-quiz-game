import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import PrimaryButton from '../components/PrimaryButton';
import AnimatedNumber from './../components/AnimatedNumber';
import { BATTLE_VERDICTS, DRAW_VERDICT, POWERS } from '../constants/teamConfig';
import { APP_BACKDROP, colors, radius, shadows, spacing } from '../constants/theme';
import { contentMaxWidth, scale } from '../utils/responsive';
import { finishFeedback } from '../utils/feedback';

/** A tied battle gets its own copy; otherwise the highest tier the margin clears. */
function verdictFor(margin, draw) {
  if (draw) return DRAW_VERDICT;
  return [...BATTLE_VERDICTS].reverse().find((v) => margin >= v.min) || BATTLE_VERDICTS[0];
}

function powerLabel(id) {
  const power = POWERS.find((p) => p.id === id);
  return power ? `${power.emoji} ${power.label}` : id;
}

export function BattleResultsScreen({ navigation, route }) {
  const { summary, teams: teamInput, difficulty } = route.params ?? {};
  const { width } = useWindowDimensions();
  const maxWidth = contentMaxWidth(width);

  const teams = summary?.teams ?? [];
  const winner = summary?.winner ?? null;
  const draw = summary?.draw ?? false;
  const verdict = verdictFor(summary?.margin ?? 0, draw);

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    finishFeedback();
    const animation = Animated.timing(anim, {
      toValue: 1,
      duration: 620,
      easing: Easing.out(Easing.back(1.3)),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [anim]);

  const crownStyle = {
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) },
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
    ],
  };

  // A win is celebrated in the winner's colours; a draw falls back to the
  // shared app backdrop since neither side owns the screen.
  const backdrop = (!draw && winner?.backdrop) || APP_BACKDROP;

  return (
    <GradientBackground colors={backdrop}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { maxWidth, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.crown, crownStyle]}>
          <Text style={styles.verdictEmoji}>{verdict.emoji}</Text>
          <Text style={styles.verdictTitle}>{verdict.title}</Text>
          <Text style={styles.winnerLine}>
            {draw ? "Nobody wins — it's a dead heat." : `${winner.emoji} ${winner.name} wins!`}
          </Text>
          <Text style={styles.verdictLine}>{verdict.line}</Text>
          {!draw && (
            <View style={styles.marginPill}>
              <Text style={styles.marginText}>
                by {summary.margin.toLocaleString()} points
              </Text>
            </View>
          )}
        </Animated.View>

        {teams.map((team) => {
          const isWinner = !draw && team.id === winner?.id;
          return (
            <View
              key={team.id}
              style={[
                styles.teamCard,
                shadows.medium,
                { borderColor: isWinner ? team.accent : 'rgba(255,255,255,0.16)' },
              ]}
            >
              <View style={styles.teamHeader}>
                <Text style={styles.teamName} numberOfLines={1}>
                  {team.emoji} {team.name}
                </Text>
                {isWinner && (
                  <View style={[styles.winnerBadge, { backgroundColor: team.accent }]}>
                    <Text style={styles.winnerBadgeText}>WINNER</Text>
                  </View>
                )}
              </View>

              <AnimatedNumber
                value={team.score}
                duration={900}
                style={[styles.teamScore, { color: team.accent }]}
              />

              <View style={styles.statRow}>
                <Text style={styles.stat}>
                  ✅ {team.correct}/{summary.questionsPerTeam} correct
                </Text>
                <Text style={styles.stat}>🔥 Best streak {team.bestStreak}</Text>
              </View>

              <Text style={styles.powersLine}>
                {team.powersUsed.length
                  ? `Powers used: ${team.powersUsed.map(powerLabel).join(' · ')}`
                  : 'No powers used — pure knowledge.'}
              </Text>
            </View>
          );
        })}

        <View style={styles.actions}>
          <PrimaryButton
            label="Rematch"
            icon="⚔️"
            variant="warm"
            onPress={() => navigation.replace('Battle', { teams: teamInput, difficulty })}
          />
          <PrimaryButton
            label="New Teams"
            icon="👥"
            variant="primary"
            onPress={() => navigation.replace('TeamSetup')}
          />
          <PrimaryButton
            label="Home"
            icon="🏠"
            variant="ghost"
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  crown: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  verdictEmoji: {
    fontSize: scale(64),
  },
  verdictTitle: {
    color: colors.textOnDark,
    fontSize: scale(28),
    fontWeight: '900',
    textAlign: 'center',
  },
  winnerLine: {
    color: colors.textOnDark,
    fontSize: scale(19),
    fontWeight: '800',
    textAlign: 'center',
  },
  verdictLine: {
    color: colors.textOnDarkMuted,
    fontSize: scale(13.5),
    fontWeight: '600',
    textAlign: 'center',
  },
  marginPill: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  marginText: {
    color: colors.textOnDark,
    fontSize: scale(12),
    fontWeight: '800',
  },
  teamCard: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(6,3,26,0.55)',
    borderWidth: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  teamName: {
    flex: 1,
    color: colors.textOnDark,
    fontSize: scale(17),
    fontWeight: '900',
  },
  winnerBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  winnerBadgeText: {
    color: '#0B0620',
    fontSize: scale(10),
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  teamScore: {
    fontSize: scale(38),
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  stat: {
    color: colors.textOnDarkMuted,
    fontSize: scale(12.5),
    fontWeight: '700',
  },
  powersLine: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: scale(11.5),
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});

export default BattleResultsScreen;
