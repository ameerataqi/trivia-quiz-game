import React, { useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import GradientBackground from '../components/GradientBackground';
import QuestionCard from '../components/QuestionCard';
import AnswerButton, { ANSWER_STATE } from '../components/AnswerButton';
import ExplanationPanel from '../components/ExplanationPanel';
import ProgressBar from '../components/ProgressBar';
import Timer from '../components/Timer';
import PrimaryButton from '../components/PrimaryButton';
import PowerButton from '../components/PowerButton';
import TeamScoreboard from '../components/TeamScoreboard';
import TurnCard from '../components/TurnCard';
import FriendCallBar from '../components/FriendCallBar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import useTeamBattle, { BATTLE_PHASE } from '../hooks/useTeamBattle';
import useCountdown from '../hooks/useCountdown';
import { SOURCE } from '../utils/battleBuilder';
import { FRIEND_CALL_SECONDS, POWER, POWERS } from '../constants/teamConfig';
import { colors, radius, spacing } from '../constants/theme';
import { contentMaxWidth, scale } from '../utils/responsive';
import { correctFeedback, timeoutFeedback, wrongFeedback } from '../utils/feedback';

export function BattleScreen({ navigation, route }) {
  const { teams: teamInput, difficulty } = route.params ?? {};
  const { width } = useWindowDimensions();
  const maxWidth = contentMaxWidth(width);
  const scrollRef = useRef(null);

  const battle = useTeamBattle({ teams: teamInput, difficulty });
  const isAnswered = battle.phase === BATTLE_PHASE.ANSWERED;
  const isAsking = battle.phase === BATTLE_PHASE.ASKING;

  const handleExpire = useCallback(() => {
    timeoutFeedback();
    battle.timeout();
  }, [battle]);

  // The question clock: paused during the turn card, and during a friend call.
  const countdown = useCountdown({
    duration: battle.secondsPerQuestion,
    running: isAsking && !battle.callActive && !!battle.current,
    resetKey: `${battle.turn}-${battle.questionNonce}`,
    onExpire: handleExpire,
  });

  // The separate 60-second call clock.
  const callCountdown = useCountdown({
    duration: FRIEND_CALL_SECONDS,
    running: battle.callActive,
    resetKey: `call-${battle.turn}-${battle.callActive}`,
    onExpire: battle.endCall,
  });

  useEffect(() => {
    if (battle.phase !== BATTLE_PHASE.FINISHED) return;
    navigation.replace('BattleResults', {
      summary: battle.summary,
      teams: teamInput,
      difficulty,
    });
  }, [battle.phase, battle.summary, navigation, teamInput, difficulty]);

  const confirmQuit = useCallback(() => {
    Alert.alert('Abandon the battle?', 'Both teams lose their scores.', [
      { text: 'Keep playing', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: () => navigation.navigate('Home') },
    ]);
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmQuit();
      return true;
    });
    return () => subscription.remove();
  }, [confirmQuit]);

  const onSelect = (option) => {
    const result = battle.answer(option, countdown.secondsLeft);
    if (!result) return;
    if (result.correct) correctFeedback();
    else wrongFeedback();
  };

  const onNext = () => {
    battle.next();
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const onPower = (powerId) => {
    const spent = battle.usePower(powerId);
    if (spent && powerId === POWER.SWAP) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  if (battle.phase === BATTLE_PHASE.LOADING) {
    const { done, total, label } = battle.progress;
    return (
      <GradientBackground colors={battle.activeTeam.backdrop}>
        <LoadingState
          title="Building the battle…"
          detail={
            total
              ? `${label ? `${label} · ` : ''}${done} of ${total} loaded`
              : 'Contacting the trivia database'
          }
        />
      </GradientBackground>
    );
  }

  if (battle.phase === BATTLE_PHASE.ERROR) {
    return (
      <GradientBackground colors={battle.activeTeam.backdrop}>
        <ErrorState
          message={battle.error?.message}
          retryable={battle.error?.retryable}
          onRetry={battle.retry}
          onBack={() => navigation.navigate('Home')}
        />
      </GradientBackground>
    );
  }

  if (!battle.current) {
    return (
      <GradientBackground colors={battle.activeTeam.backdrop}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Could not build this battle.</Text>
          <PrimaryButton label="Back to Home" variant="ghost" onPress={() => navigation.navigate('Home')} />
        </View>
      </GradientBackground>
    );
  }

  const outcome = battle.timedOut
    ? 'timeout'
    : battle.selected === battle.current.correctAnswer
      ? 'correct'
      : 'wrong';

  const stateForOption = (option) => {
    if (!isAnswered) return ANSWER_STATE.IDLE;
    if (option === battle.current.correctAnswer) return ANSWER_STATE.CORRECT;
    if (option === battle.selected) return ANSWER_STATE.WRONG;
    return ANSWER_STATE.DIMMED;
  };

  // A question is a surprise whenever it is not from one of the team's own
  // categories — whether it was dealt as the wildcard or used as a fallback
  // fill when a category fetch came up short.
  const isWildcard =
    battle.source === SOURCE.WILDCARD ||
    !(battle.activeTeam.categories || []).includes(battle.current.category);

  return (
    <GradientBackground colors={battle.activeTeam.backdrop}>
      <View style={[styles.container, { maxWidth, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abandon battle"
              onPress={confirmQuit}
              hitSlop={10}
              style={styles.quitButton}
            >
              <Text style={styles.quitText}>✕</Text>
            </Pressable>
            <Text style={styles.turnCounter}>
              Turn {battle.turn + 1}
              <Text style={styles.turnCounterMuted}> / {battle.totalTurns}</Text>
            </Text>
            <View style={styles.quitButton} />
          </View>

          <TeamScoreboard teams={battle.teams} activeIndex={battle.activeIndex} />

          <ProgressBar progress={(battle.turn + 1) / battle.totalTurns} height={8} />

          <Timer
            secondsLeft={countdown.secondsLeft}
            progress={countdown.progress}
            paused={isAnswered || battle.callActive}
          />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sourceRow}>
            <View
              style={[
                styles.sourceTag,
                { backgroundColor: isWildcard ? 'rgba(251,191,36,0.9)' : 'rgba(255,255,255,0.20)' },
              ]}
            >
              <Text style={styles.sourceText}>
                {isWildcard ? '🎲 WILDCARD — NOT YOUR CATEGORY' : '⭐ YOUR CATEGORY'}
              </Text>
            </View>
            {battle.doubleActive && (
              <View style={styles.doubleTag}>
                <Text style={styles.doubleText}>⚡ 2× POINTS</Text>
              </View>
            )}
          </View>

          <QuestionCard
            question={battle.current.question}
            category={battle.current.category}
            difficulty={battle.current.difficulty}
          />

          <View style={styles.answers}>
            {battle.current.options.map((option, index) => (
              <AnswerButton
                key={`${battle.current.id}-${option}`}
                label={option}
                index={index}
                state={stateForOption(option)}
                disabled={!isAsking || battle.callActive}
                onPress={() => onSelect(option)}
              />
            ))}
          </View>

          {battle.callActive && (
            <FriendCallBar
              secondsLeft={callCountdown.secondsLeft}
              progress={callCountdown.progress}
              onEnd={battle.endCall}
            />
          )}

          {isAsking && !battle.callActive && (
            <View style={styles.powersBlock}>
              <Text style={styles.powersLabel}>
                {battle.activeTeam.name.toUpperCase()} · POWERS (ONE USE EACH)
              </Text>
              <View style={styles.powersRow}>
                {POWERS.map((power) => (
                  <PowerButton
                    key={power.id}
                    power={power}
                    available={battle.activeTeam.powers[power.id]}
                    active={power.id === POWER.DOUBLE && battle.doubleActive}
                    onPress={() => onPower(power.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {isAnswered && (
            <ExplanationPanel
              outcome={outcome}
              explanation={battle.current.explanation}
              correctAnswer={battle.current.correctAnswer}
              points={battle.lastAward?.points ?? 0}
              meta={`${battle.current.category} · ${battle.current.difficulty}`}
            />
          )}
        </ScrollView>

        {isAnswered && (
          <View style={styles.footer}>
            <PrimaryButton
              label={battle.turn + 1 >= battle.totalTurns ? 'See Who Won' : `Hand to ${battle.opponent.name}`}
              icon={battle.turn + 1 >= battle.totalTurns ? '🏆' : '➡️'}
              variant={battle.turn + 1 >= battle.totalTurns ? 'success' : 'primary'}
              onPress={onNext}
              testID="battle-next"
            />
          </View>
        )}

        {battle.phase === BATTLE_PHASE.TURN_INTRO && (
          <TurnCard
            team={battle.activeTeam}
            opponent={battle.opponent}
            questionNumber={battle.questionNumber}
            questionsPerTeam={battle.questionsPerTeam}
            onReady={battle.beginTurn}
          />
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  quitText: {
    color: colors.textOnDark,
    fontSize: scale(15),
    fontWeight: '900',
  },
  turnCounter: {
    color: colors.textOnDark,
    fontSize: scale(14),
    fontWeight: '800',
  },
  turnCounterMuted: {
    color: colors.textOnDarkMuted,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  sourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sourceTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  sourceText: {
    color: colors.textOnDark,
    fontSize: scale(10),
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  doubleTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: '#FBBF24',
  },
  doubleText: {
    color: '#3B2500',
    fontSize: scale(10),
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  answers: {
    gap: spacing.md,
  },
  powersBlock: {
    gap: spacing.sm,
  },
  powersLabel: {
    color: colors.textOnDarkMuted,
    fontSize: scale(10),
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  powersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textOnDark,
    fontSize: scale(16),
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default BattleScreen;
