import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchQuestions } from '../api/openTdb';
import { pointsForAnswer, getDifficultyConfig } from '../utils/scoring';
import { QUESTIONS_PER_ROUND } from '../constants/gameConfig';

export const PHASE = {
  LOADING: 'loading',
  ERROR: 'error',
  ASKING: 'asking',
  ANSWERED: 'answered',
  FINISHED: 'finished',
};

/**
 * Owns all gameplay state for one solo round.
 *
 * Questions come from the Open Trivia Database, fetched once when the round
 * starts. The countdown lives in the screen (see useCountdown) and passes the
 * remaining seconds into `answer()` so time bonuses can be awarded.
 */
export function useQuiz({ category, difficulty, count = QUESTIONS_PER_ROUND }) {
  const difficultyConfig = getDifficultyConfig(difficulty);

  const [questions, setQuestions] = useState([]);
  const [phase, setPhase] = useState(PHASE.LOADING);
  const [error, setError] = useState(null);

  const [index, setIndex] = useState(0);
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
  // Lets an in-flight fetch know it has been superseded (replay / unmount).
  const requestRef = useRef(0);

  const load = useCallback(() => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setPhase(PHASE.LOADING);
    setError(null);
    setIndex(0);
    setSelected(null);
    setTimedOut(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLastAward(null);
    setLog([]);
    lockedRef.current = false;

    fetchQuestions({ amount: count, category, difficulty })
      .then((fetched) => {
        if (requestRef.current !== requestId) return;
        setQuestions(fetched);
        setPhase(PHASE.ASKING);
      })
      .catch((err) => {
        if (requestRef.current !== requestId) return;
        setError({ message: err.message, retryable: err.retryable !== false });
        setPhase(PHASE.ERROR);
      });
  }, [category, difficulty, count]);

  useEffect(() => {
    load();
    return () => {
      // Any late response is ignored once this hook goes away.
      requestRef.current += 1;
    };
  }, [load]);

  const current = questions[index] ?? null;
  const total = questions.length;
  const isLast = index >= total - 1;
  const correctCount = log.filter((entry) => entry.correct).length;

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
      setLog((prev) => [
        ...prev,
        {
          id: current.id,
          question: current.question,
          correct,
          selected: option,
          correctAnswer: current.correctAnswer,
          points: award.points,
        },
      ]);

      return { correct, ...award };
    },
    [current, difficulty, streak],
  );

  const timeout = useCallback(() => {
    if (lockedRef.current || !current) return;
    lockedRef.current = true;

    setSelected(null);
    setTimedOut(true);
    setStreak(0);
    setLastAward(null);
    setPhase(PHASE.ANSWERED);
    setLog((prev) => [
      ...prev,
      {
        id: current.id,
        question: current.question,
        correct: false,
        selected: null,
        correctAnswer: current.correctAnswer,
        points: 0,
      },
    ]);
  }, [current]);

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

  /** Start a fresh round — fetches a new set from the API. */
  const restart = useCallback(() => load(), [load]);

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
    error,
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
    retry: load,
  };
}

export default useQuiz;
