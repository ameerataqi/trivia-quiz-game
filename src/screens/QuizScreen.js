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
import ScoreDisplay from '../components/ScoreDisplay';
import Timer from '../components/Timer';
import PrimaryButton from '../components/PrimaryButton';
import useQuiz, { PHASE } from '../hooks/useQuiz';
import useCountdown from '../hooks/useCountdown';
import { getDifficultyConfig } from '../utils/scoring';
import { ALL_CATEGORIES } from '../data/categories';
import { DEFAULT_DIFFICULTY } from '../constants/gameConfig';
import { colors, spacing } from '../constants/theme';
import { contentMaxWidth, scale } from '../utils/responsive';
import { correctFeedback, timeoutFeedback, wrongFeedback } from '../utils/feedback';

export function QuizScreen({ navigation, route }) {
  const { category = ALL_CATEGORIES, difficulty = DEFAULT_DIFFICULTY } = route.params ?? {};
  const { width } = useWindowDimensions();
  const maxWidth = contentMaxWidth(width);
  const scrollRef = useRef(null);

  const quiz = useQuiz({ category, difficulty });
  const { seconds } = getDifficultyConfig(difficulty);

  const isAnswered = quiz.phase === PHASE.ANSWERED;

  const handleExpire = useCallback(() => {
    timeoutFeedback();
    quiz.timeout();
  }, [quiz]);

  const countdown = useCountdown({
    duration: seconds,
    // The clock only runs while a question is open — feedback pauses it.
    running: quiz.phase === PHASE.ASKING && !!quiz.current,
    resetKey: `${quiz.index}-${quiz.current?.id ?? 'none'}`,
    onExpire: handleExpire,
  });

  // Navigate to the results once the final question is done.
  useEffect(() => {
    if (quiz.phase !== PHASE.FINISHED) return;
    navigation.replace('Results', { summary: quiz.summary });
  }, [quiz.phase, quiz.summary, navigation]);

  const confirmQuit = useCallback(() => {
    Alert.alert('Leave this round?', 'Your current score will be lost.', [
      { text: 'Keep playing', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: () => navigation.navigate('Home') },
    ]);
  }, [navigation]);

  // Android hardware back should ask before throwing the round away.
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

  if (!quiz.current) {
    return (
      <GradientBackground variant="quiz">
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No questions available for this selection.</Text>
          <PrimaryButton label="Back to Home" variant="ghost" onPress={() => navigation.navigate('Home')} />
        </View>
      </GradientBackground>
    );
  }

  const outcome = quiz.timedOut ? 'timeout' : quiz.selected === quiz.current.correctAnswer ? 'correct' : 'wrong';

  const stateForOption = (option) => {
    if (!isAnswered) return ANSWER_STATE.IDLE;
    if (option === quiz.current.correctAnswer) return ANSWER_STATE.CORRECT;
    if (option === quiz.selected) return ANSWER_STATE.WRONG;
    return ANSWER_STATE.DIMMED;
  };

  return (
    <GradientBackground variant="quiz">
      <View style={[styles.container, { maxWidth, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Quit round"
              onPress={confirmQuit}
              hitSlop={10}
              style={styles.quitButton}
            >
              <Text style={styles.quitText}>✕</Text>
            </Pressable>

            <View style={styles.counterWrap}>
              <Text style={styles.counter}>
                Question {quiz.questionNumber}
                <Text style={styles.counterMuted}> / {quiz.total}</Text>
              </Text>
            </View>

            <ScoreDisplay score={quiz.score} streak={quiz.streak} lastAward={quiz.lastAward} />
          </View>

          <ProgressBar progress={quiz.questionNumber / quiz.total} height={10} />

          <Timer
            secondsLeft={countdown.secondsLeft}
            progress={countdown.progress}
            paused={isAnswered}
          />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
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
            <ExplanationPanel
              outcome={outcome}
              explanation={quiz.current.explanation}
              correctAnswer={quiz.current.correctAnswer}
              points={quiz.lastAward?.points ?? 0}
            />
          )}
        </ScrollView>

        {isAnswered && (
          <View style={styles.footer}>
            <PrimaryButton
              label={quiz.isLast ? 'See Results' : 'Next Question'}
              icon={quiz.isLast ? '🏁' : '➡️'}
              variant={quiz.isLast ? 'success' : 'primary'}
              onPress={onNext}
              testID="next-question"
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  quitButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  quitText: {
    color: colors.textOnDark,
    fontSize: scale(16),
    fontWeight: '900',
  },
  counterWrap: {
    flex: 1,
    paddingTop: spacing.sm,
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
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  answers: {
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: 'transparent',
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

export default QuizScreen;
