import { useCallback, useMemo, useRef, useState } from 'react';
import { buildBattle } from '../utils/battleBuilder';
import { pointsForAnswer, getDifficultyConfig } from '../utils/scoring';
import {
  DOUBLE_MULTIPLIER,
  POWER,
  QUESTIONS_PER_TEAM,
  TEAM_THEMES,
} from '../constants/teamConfig';

export const BATTLE_PHASE = {
  /** "Pass the device to X" card — gates the clock between turns. */
  TURN_INTRO: 'turnIntro',
  ASKING: 'asking',
  ANSWERED: 'answered',
  FINISHED: 'finished',
};

const freshPowers = () => ({
  [POWER.DOUBLE]: true,
  [POWER.FRIEND]: true,
  [POWER.SWAP]: true,
});

/**
 * Owns an entire two-team battle: both queues, whose turn it is, both scores
 * and each team's remaining powers.
 *
 * Turn order alternates, so turn `t` belongs to team `t % 2` and is that
 * team's question number `floor(t / 2)`.
 */
export function useTeamBattle({ teams: teamInput, difficulty }) {
  const difficultyConfig = getDifficultyConfig(difficulty);
  const [battleId, setBattleId] = useState(0);

  const built = useMemo(
    () => buildBattle({ teams: teamInput, difficulty }),
    [teamInput, difficulty, battleId],
  );

  const [queues, setQueues] = useState(built.queues);
  const [spares, setSpares] = useState(built.spares);

  const [teams, setTeams] = useState(() =>
    teamInput.map((team, index) => ({
      ...team,
      ...TEAM_THEMES[index],
      name: team.name?.trim() || TEAM_THEMES[index].defaultName,
      score: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      powers: freshPowers(),
      powersUsed: [],
    })),
  );

  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState(BATTLE_PHASE.TURN_INTRO);
  const [selected, setSelected] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [lastAward, setLastAward] = useState(null);
  const [doubleActive, setDoubleActive] = useState(false);
  const [callActive, setCallActive] = useState(false);
  /** Bumped on swap/new question so the countdown component restarts. */
  const [questionNonce, setQuestionNonce] = useState(0);

  // Whichever of "answer" or "timeout" lands first wins the turn.
  const lockedRef = useRef(false);

  const totalTurns = QUESTIONS_PER_TEAM * teams.length;
  const activeIndex = turn % teams.length;
  const questionIndex = Math.floor(turn / teams.length);
  const activeTeam = teams[activeIndex];
  const opponent = teams[(activeIndex + 1) % teams.length];
  const entry = queues[activeIndex]?.[questionIndex] ?? null;
  const current = entry?.question ?? null;

  const patchActiveTeam = useCallback(
    (patch) => {
      setTeams((prev) =>
        prev.map((team, index) => (index === activeIndex ? { ...team, ...patch } : team)),
      );
    },
    [activeIndex],
  );

  /** Dismiss the "pass the device" card and start the clock. */
  const beginTurn = useCallback(() => {
    if (phase !== BATTLE_PHASE.TURN_INTRO) return;
    lockedRef.current = false;
    setPhase(BATTLE_PHASE.ASKING);
    setQuestionNonce((n) => n + 1);
  }, [phase]);

  const answer = useCallback(
    (option, secondsLeft) => {
      if (lockedRef.current || !current) return null;
      lockedRef.current = true;

      const correct = option === current.correctAnswer;
      const nextStreak = correct ? activeTeam.streak + 1 : 0;

      let award = { points: 0, timeBonus: 0, combo: 1 };
      if (correct) {
        award = pointsForAnswer({ secondsLeft, difficulty, streak: nextStreak });
        if (doubleActive) award = { ...award, points: award.points * DOUBLE_MULTIPLIER };
      }

      patchActiveTeam({
        score: activeTeam.score + award.points,
        correct: activeTeam.correct + (correct ? 1 : 0),
        streak: nextStreak,
        bestStreak: Math.max(activeTeam.bestStreak, nextStreak),
      });

      setSelected(option);
      setTimedOut(false);
      setLastAward(correct ? { ...award, doubled: doubleActive } : null);
      setCallActive(false);
      setPhase(BATTLE_PHASE.ANSWERED);

      return { correct, ...award };
    },
    [activeTeam, current, difficulty, doubleActive, patchActiveTeam],
  );

  const timeout = useCallback(() => {
    if (lockedRef.current || !current) return;
    lockedRef.current = true;

    patchActiveTeam({ streak: 0 });
    setSelected(null);
    setTimedOut(true);
    setLastAward(null);
    setCallActive(false);
    setPhase(BATTLE_PHASE.ANSWERED);
  }, [current, patchActiveTeam]);

  /** Hand over to the other team, or end the battle. */
  const next = useCallback(() => {
    if (phase !== BATTLE_PHASE.ANSWERED) return;

    setSelected(null);
    setTimedOut(false);
    setLastAward(null);
    setDoubleActive(false);
    setCallActive(false);

    if (turn + 1 >= totalTurns) {
      setPhase(BATTLE_PHASE.FINISHED);
      return;
    }

    lockedRef.current = false;
    setTurn((t) => t + 1);
    setPhase(BATTLE_PHASE.TURN_INTRO);
  }, [phase, turn, totalTurns]);

  /**
   * Spend one of the active team's three powers. Each can be used once, and
   * only while a question is actually open.
   */
  const usePower = useCallback(
    (powerId) => {
      if (phase !== BATTLE_PHASE.ASKING) return false;
      if (!activeTeam.powers[powerId]) return false;

      if (powerId === POWER.SWAP) {
        if (!spares.length) return false;

        const [replacement, ...restSpares] = spares;
        setSpares(restSpares);
        setQueues((prev) =>
          prev.map((queue, index) =>
            index !== activeIndex
              ? queue
              : queue.map((item, i) =>
                  i === questionIndex ? { ...replacement, source: item.source } : item,
                ),
          ),
        );
        // Fresh question means a fresh clock.
        setQuestionNonce((n) => n + 1);
        lockedRef.current = false;
      }

      if (powerId === POWER.DOUBLE) setDoubleActive(true);
      if (powerId === POWER.FRIEND) setCallActive(true);

      patchActiveTeam({
        powers: { ...activeTeam.powers, [powerId]: false },
        powersUsed: [...activeTeam.powersUsed, powerId],
      });

      return true;
    },
    [activeIndex, activeTeam, phase, questionIndex, spares, patchActiveTeam],
  );

  const endCall = useCallback(() => setCallActive(false), []);

  /** Same teams, same categories, brand new questions. */
  const rematch = useCallback(() => {
    const rebuilt = buildBattle({ teams: teamInput, difficulty });
    setBattleId((b) => b + 1);
    setQueues(rebuilt.queues);
    setSpares(rebuilt.spares);
    setTeams((prev) =>
      prev.map((team) => ({
        ...team,
        score: 0,
        correct: 0,
        streak: 0,
        bestStreak: 0,
        powers: freshPowers(),
        powersUsed: [],
      })),
    );
    setTurn(0);
    setPhase(BATTLE_PHASE.TURN_INTRO);
    setSelected(null);
    setTimedOut(false);
    setLastAward(null);
    setDoubleActive(false);
    setCallActive(false);
    lockedRef.current = false;
  }, [teamInput, difficulty]);

  const summary = useMemo(() => {
    const ranked = [...teams].sort((a, b) => b.score - a.score);
    const draw = ranked.length > 1 && ranked[0].score === ranked[1].score;
    return {
      teams,
      winner: draw ? null : ranked[0],
      margin: ranked.length > 1 ? ranked[0].score - ranked[1].score : 0,
      draw,
      difficulty,
      questionsPerTeam: QUESTIONS_PER_TEAM,
    };
  }, [teams, difficulty]);

  return {
    // data
    teams,
    activeTeam,
    opponent,
    activeIndex,
    current,
    source: entry?.source,
    questionIndex,
    questionNumber: questionIndex + 1,
    questionsPerTeam: QUESTIONS_PER_TEAM,
    turn,
    totalTurns,
    secondsPerQuestion: difficultyConfig.seconds,
    questionNonce,
    // state
    phase,
    selected,
    timedOut,
    lastAward,
    doubleActive,
    callActive,
    summary,
    // actions
    beginTurn,
    answer,
    timeout,
    next,
    usePower,
    endCall,
    rematch,
  };
}

export default useTeamBattle;
