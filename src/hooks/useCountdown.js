import { useCallback, useEffect, useRef, useState } from 'react';

const TICK_MS = 100;

/**
 * A per-question countdown.
 *
 * `resetKey` is the important part: whenever it changes (i.e. a new question
 * appears) the clock restarts from `duration`, which is what keeps time from
 * leaking between questions. Pausing (`running: false`) freezes the remaining
 * time rather than letting it drain in the background.
 *
 * @param {object}   options
 * @param {number}   options.duration seconds on the clock
 * @param {boolean}  options.running  whether the clock should be ticking
 * @param {any}      options.resetKey change this to restart the countdown
 * @param {Function} options.onExpire fired exactly once when time runs out
 */
export function useCountdown({ duration, running, resetKey, onExpire }) {
  const totalMs = Math.max(0, duration) * 1000;

  const [msLeft, setMsLeft] = useState(totalMs);
  const msLeftRef = useRef(totalMs);
  const firedRef = useRef(false);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);

  // Keep the latest callback without restarting the interval on every render.
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const setRemaining = useCallback((value) => {
    msLeftRef.current = value;
    setMsLeft(value);
  }, []);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Restart whenever the question changes or the duration is reconfigured.
  useEffect(() => {
    firedRef.current = false;
    setRemaining(totalMs);
  }, [resetKey, totalMs, setRemaining]);

  useEffect(() => {
    clear();
    if (!running || totalMs === 0) return undefined;

    // Anchor to a wall-clock deadline so a throttled interval cannot drift.
    const deadline = Date.now() + msLeftRef.current;

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, deadline - Date.now());
      setRemaining(remaining);

      if (remaining <= 0 && !firedRef.current) {
        firedRef.current = true;
        clear();
        onExpireRef.current?.();
      }
    }, TICK_MS);

    return clear;
  }, [running, resetKey, totalMs, clear, setRemaining]);

  return {
    msLeft,
    secondsLeft: Math.ceil(msLeft / 1000),
    progress: totalMs > 0 ? msLeft / totalMs : 0,
    expired: msLeft <= 0,
  };
}

export default useCountdown;
