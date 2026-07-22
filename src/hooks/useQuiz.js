import { useCallback, useMemo, useRef, useState } from 'react';
import { buildRound } from '../utils/questionPool';
import { pointsForAnswer, getDifficultyConfig } from '../utils/scoring';
import { QUESTIONS_PER_ROUND } from '../constants/gameConfig';

export const PHASE = {
  ASKING: 'asking',
  ANSWERED: 'answered',
  FINISHED: 'finished',
};

/**
 * Owns all gameplay state for one round: the questions, the current index,
 * the score, the streak and the per-question outcome log.
 *
 * The countdown itself lives in the screen (see useCountdown) and hands the
 * remaining seconds to `answer()` so time bonuses can be awarded.
 */
export function useQuiz({ category, difficulty, count = QUESTIONS_PER_ROUND }) {
  const difficultyConfig = getDifficultyConfig(difficulty);

  // Round number is bumped on replay to force a brand new shuffled set.
  const [roundId, setRoundId] = useState(0);

  const questions = useMemo(
    () => buildRound({ category, difficulty, count }),
    [category, difficulty, count, roundId],
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState(PHASE.ASKING);
  const [selected, setSelected] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastAward, setLastAward] = useState(null);
  const [log, setLog] = useState([]);

  // Guards against a double-tap or a timeout landing on an already-answered
  // question — whichever arrives first wins.
  const lockedRef = useRef(false);

  const current = questions[index] ?? null;
  const total = questions.length;
  const isLast = index >= total - 1;
  const correctCount = log.filter((entry) => entry.correct).length;

  const record = useCallback((entry) => {
    setLog((prev) => [...prev, entry]);
  }, []);

  /** Player picked an option. */
  const answer = useCallback(
    (option, secondsLeft) => {
      if (lockedRef.current || !current) return null;
      lockedRef.current = true;

      const correct = option === current.correctAnswer;
      const nextStreak = correct ? streak + 1 : 0;

      let award = { points: 0, timeBonus: 0, combo: 1 };
      if (correct) {
        award = pointsForAnswer({ secondsLeft, difficulty, streak: nextStreak });
        setScore((s) => s + award.points);
        setBestStreak((b) => Math.max(b, nextStreak));
      }

      setSelected(option);
      setTimedOut(false);
      setStreak(nextStreak);
      setLastAward(correct ? award : null);
      setPhase(PHASE.ANSWERED);
      record({
        id: current.id,
        question: current.question,
        correct,
        selected: option,
        correctAnswer: current.correctAnswer,
        points: award.points,
      });

      return { correct, ...award };
    },
    [current, difficulty, record, streak],
  );

  /** The clock hit zero without a selection. */
  const timeout = useCallback(() => {
    if (lockedRef.current || !current) return;
    lockedRef.current = true;

    setSelected(null);
    setTimedOut(true);
    setStreak(0);
    setLastAward(null);
    setPhase(PHASE.ANSWERED);
    record({
      id: current.id,
      question: current.question,
      correct: false,
      selected: null,
      correctAnswer: current.correctAnswer,
      points: 0,
    });
  }, [current, record]);

  /** Advance to the next question, or finish the round. */
  const next = useCallback(() => {
    if (phase !== PHASE.ANSWERED) return;

    if (isLast) {
      setPhase(PHASE.FINISHED);
      return;
    }

    lockedRef.current = false;
    setSelected(null);
    setTimedOut(false);
    setLastAward(null);
    setPhase(PHASE.ASKING);
    setIndex((i) => i + 1);
  }, [isLast, phase]);

  /** Start a completely fresh round with newly shuffled questions. */
  const restart = useCallback(() => {
    lockedRef.current = false;
    setRoundId((r) => r + 1);
    setIndex(0);
    setPhase(PHASE.ASKING);
    setSelected(null);
    setTimedOut(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLastAward(null);
    setLog([]);
  }, []);

  const summary = useMemo(
    () => ({
      score,
      total,
      correct: correctCount,
      incorrect: total - correctCount,
      bestStreak,
      difficulty,
      category,
      log,
    }),
    [score, total, correctCount, bestStreak, difficulty, category, log],
  );

  return {
    // data
    questions,
    current,
    index,
    total,
    questionNumber: index + 1,
    isLast,
    // state
    phase,
    selected,
    timedOut,
    score,
    streak,
    bestStreak,
    lastAward,
    correctCount,
    summary,
    secondsPerQuestion: difficultyConfig.seconds,
    // actions
    answer,
    timeout,
    next,
    restart,
  };
}

export default useQuiz;
