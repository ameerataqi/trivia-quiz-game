import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import ProgressBar from '../components/ProgressBar';
import Timer from '../components/Timer';
import PrimaryButton from '../components/PrimaryButton';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import useQuiz, { PHASE } from '../hooks/useQuiz';
import useCountdown from '../hooks/useCountdown';
import { askAi } from '../api/aiOpponent';
import { getDifficultyConfig } from '../utils/scoring';
import { DEFAULT_DIFFICULTY } from '../constants/gameConfig';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { contentMaxWidth, scale } from '../utils/responsive';
import { correctFeedback, timeoutFeedback, wrongFeedback } from '../utils/feedback';

/**
 * Solo round with an AI opponent. The model is asked each question as soon as
 * it appears — while the player is still thinking — and its pick is revealed
 * only after the player commits. Most correct answers at the end wins.
 */
export function AiQuizScreen({ navigation, route }) {
  const { category, difficulty = DEFAULT_DIFFICULTY } = route.params ?? {};
  const { width } = useWindowDimensions();
  const maxWidth = contentMaxWidth(width);
  const scrollRef = useRef(null);

  const quiz = useQuiz({ category, difficulty });
  const { seconds } = getDifficultyConfig(difficulty);

  // AI answers keyed by question id: {pending} | {ok, answer, correct} | {ok:false}
  const [aiResults, setAiResults] = useState({});
  const askedRef = useRef(new Set());

  const isAnswered = quiz.phase === PHASE.ANSWERED;

  // Fire the AI request the moment a question opens.
  useEffect(() => {
    const q = quiz.current;
    if (!q || quiz.phase !== PHASE.ASKING || askedRef.current.has(q.id)) return;
    askedRef.current.add(q.id);
    setAiResults((prev) => ({ ...prev, [q.id]: { pending: true } }));

    askAi(q).then((result) => {
      setAiResults((prev) => ({
        ...prev,
        [q.id]: {
          pending: false,
          ok: result.ok,
          answer: result.answer,
          correct: result.ok && result.answer === q.correctAnswer,
        },
      }));
    });
  }, [quiz.current, quiz.phase]);

  const aiCorrect = Object.values(aiResults).filter((r) => !r.pending && r.correct).length;

  const handleExpire = useCallback(() => {
    timeoutFeedback();
    quiz.timeout();
  }, [quiz]);

  const countdown = useCountdown({
    duration: seconds,
    running: quiz.phase === PHASE.ASKING && !!quiz.current,
    resetKey: `${quiz.index}-${quiz.current?.id ?? 'none'}`,
    onExpire: handleExpire,
  });

  const confirmQuit = useCallback(() => {
    Alert.alert('Leave the match?', 'The AI will claim a walkover.', [
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
    const result = quiz.answer(option, countdown.secondsLeft);
    if (!result) return;
    if (result.correct) correctFeedback();
    else wrongFeedback();
  };

  const onNext = () => {
    quiz.next();
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const restartMatch = () => {
    askedRef.current = new Set();
    setAiResults({});
    quiz.restart();
  };

  if (quiz.phase === PHASE.LOADING) {
    return (
      <GradientBackground variant="app">
        <LoadingState title="Setting up the match…" detail={`${category} · ${difficulty} · vs AI`} />
      </GradientBackground>
    );
  }

  if (quiz.phase === PHASE.ERROR) {
    return (
      <GradientBackground variant="app">
        <ErrorState
          message={quiz.error?.message}
          retryable={quiz.error?.retryable}
          onRetry={quiz.retry}
          onBack={() => navigation.navigate('Home')}
        />
      </GradientBackground>
    );
  }

  // ---- Final whistle ------------------------------------------------------
  if (quiz.phase === PHASE.FINISHED) {
    const playerWins = quiz.correctCount > aiCorrect;
    const draw = quiz.correctCount === aiCorrect;
    return (
      <GradientBackground variant="app">
        <View style={styles.finalWrap}>
          <View style={[styles.finalCard, shadows.strong]}>
            <Text style={styles.finalEmoji}>{draw ? '🤝' : playerWins ? '🏆' : '🤖'}</Text>
            <Text style={styles.finalTitle}>
              {draw ? "It's a draw!" : playerWins ? 'You beat the AI!' : 'The AI takes it!'}
            </Text>

            <View style={styles.finalScores}>
              <View style={styles.finalScoreCell}>
                <Text style={styles.finalScoreLabel}>YOU</Text>
                <Text style={[styles.finalScoreValue, playerWins && styles.finalWinner]}>
                  {quiz.correctCount}/{quiz.total}
                </Text>
              </View>
              <Text style={styles.finalVs}>VS</Text>
              <View style={styles.finalScoreCell}>
                <Text style={styles.finalScoreLabel}>AI</Text>
                <Text style={[styles.finalScoreValue, !playerWins && !draw && styles.finalWinner]}>
                  {aiCorrect}/{quiz.total}
                </Text>
              </View>
            </View>

            <Text style={styles.finalPoints}>Your points this round: {quiz.score.toLocaleString()}</Text>
          </View>

          <View style={styles.finalActions}>
            <PrimaryButton label="Rematch" icon="🔄" variant="warm" onPress={restartMatch} />
            <PrimaryButton label="Home" icon="🏠" variant="ghost" onPress={() => navigation.navigate('Home')} />
          </View>
        </View>
      </GradientBackground>
    );
  }

  if (!quiz.current) return null;

  const ai = aiResults[quiz.current.id] ?? { pending: true };
  const outcome = quiz.timedOut ? 'timeout' : quiz.selected === quiz.current.correctAnswer ? 'correct' : 'wrong';

  const stateForOption = (option) => {
    if (!isAnswered) return ANSWER_STATE.IDLE;
    if (option === quiz.current.correctAnswer) return ANSWER_STATE.CORRECT;
    if (option === quiz.selected) return ANSWER_STATE.WRONG;
    return ANSWER_STATE.DIMMED;
  };

  return (
    <GradientBackground variant="app">
      <View style={[styles.container, { maxWidth, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Quit match"
              onPress={confirmQuit}
              hitSlop={10}
              style={styles.quitButton}
            >
              <Text style={styles.quitText}>✕</Text>
            </Pressable>

            <Text style={styles.counter}>
              Q{quiz.questionNumber}
              <Text style={styles.counterMuted}> / {quiz.total}</Text>
            </Text>

            <View style={styles.scorePills}>
              <View style={[styles.scorePill, styles.youPill]}>
                <Text style={styles.scorePillLabel}>YOU</Text>
                <Text style={styles.scorePillValue}>{quiz.correctCount}</Text>
              </View>
              <View style={[styles.scorePill, styles.aiPill]}>
                <Text style={styles.scorePillLabel}>🤖</Text>
                <Text style={styles.scorePillValue}>{aiCorrect}</Text>
              </View>
            </View>
          </View>

          <ProgressBar progress={quiz.questionNumber / quiz.total} height={8} />

          <Timer secondsLeft={countdown.secondsLeft} progress={countdown.progress} paused={isAnswered} />
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <QuestionCard
            question={quiz.current.question}
            category={quiz.current.category}
            difficulty={quiz.current.difficulty}
          />

          <View style={styles.answers}>
            {quiz.current.options.map((option, index) => (
              <AnswerButton
                key={`${quiz.current.id}-${option}`}
                label={option}
                index={index}
                state={stateForOption(option)}
                disabled={isAnswered}
                onPress={() => onSelect(option)}
              />
            ))}
          </View>

          {isAnswered && (
            <View style={[styles.aiPanel, shadows.medium]}>
              <Text style={styles.aiPanelTitle}>
                {outcome === 'correct' ? '🎉 You got it!' : outcome === 'timeout' ? "⏰ Time's up!" : '😅 Not quite'}
                {'  ·  '}
                Answer: <Text style={styles.aiPanelStrong}>{quiz.current.correctAnswer}</Text>
              </Text>

              {ai.pending ? (
                <Text style={styles.aiLine}>🤖 The AI is still thinking…</Text>
              ) : !ai.ok ? (
                <Text style={styles.aiLine}>🤖 The AI failed to answer — that one goes to you.</Text>
              ) : (
                <Text style={styles.aiLine}>
                  🤖 The AI picked <Text style={styles.aiPanelStrong}>{ai.answer}</Text> —{' '}
                  {ai.correct ? 'correct ✅' : 'wrong ❌'}
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        {isAnswered && (
          <View style={styles.footer}>
            <PrimaryButton
              label={quiz.isLast ? 'Final Score' : 'Next Question'}
              icon={quiz.isLast ? '🏁' : '➡️'}
              variant={quiz.isLast ? 'success' : 'primary'}
              onPress={onNext}
              testID="ai-next"
            />
          </View>
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
    gap: spacing.sm,
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
  counter: {
    color: colors.textOnDark,
    fontSize: scale(15),
    fontWeight: '800',
  },
  counterMuted: {
    color: colors.textOnDarkMuted,
    fontWeight: '700',
  },
  scorePills: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scorePill: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.md,
    minWidth: 52,
  },
  youPill: {
    backgroundColor: 'rgba(124,92,255,0.55)',
  },
  aiPill: {
    backgroundColor: 'rgba(56,189,248,0.4)',
  },
  scorePillLabel: {
    color: colors.textOnDarkMuted,
    fontSize: scale(9),
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  scorePillValue: {
    color: colors.textOnDark,
    fontSize: scale(17),
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  answers: {
    gap: spacing.md,
  },
  aiPanel: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  aiPanelTitle: {
    color: colors.text,
    fontSize: scale(14.5),
    fontWeight: '800',
    lineHeight: scale(21),
  },
  aiPanelStrong: {
    fontWeight: '900',
  },
  aiLine: {
    color: colors.textMuted,
    fontSize: scale(14),
    fontWeight: '700',
    lineHeight: scale(20),
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  finalWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing.xl,
  },
  finalCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
  },
  finalEmoji: {
    fontSize: scale(56),
  },
  finalTitle: {
    color: colors.text,
    fontSize: scale(25),
    fontWeight: '900',
    textAlign: 'center',
  },
  finalScores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  finalScoreCell: {
    alignItems: 'center',
    minWidth: 90,
  },
  finalScoreLabel: {
    color: colors.textMuted,
    fontSize: scale(11),
    fontWeight: '900',
    letterSpacing: 1,
  },
  finalScoreValue: {
    color: colors.text,
    fontSize: scale(34),
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  finalWinner: {
    color: colors.correct,
  },
  finalVs: {
    color: colors.textMuted,
    fontSize: scale(14),
    fontWeight: '900',
  },
  finalPoints: {
    color: colors.textMuted,
    fontSize: scale(13),
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  finalActions: {
    gap: spacing.md,
  },
});

export default AiQuizScreen;
