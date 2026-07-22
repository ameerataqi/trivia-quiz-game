import AsyncStorage from '@react-native-async-storage/async-storage';

const BEST_SCORE_KEY = '@trivia_blast/best_score_v1';
const PREFS_KEY = '@trivia_blast/prefs_v1';

/** Best score is stored per difficulty plus an overall figure. */
const EMPTY_BEST = { overall: 0, Easy: 0, Medium: 0, Hard: 0 };

export async function loadBestScores() {
  try {
    const raw = await AsyncStorage.getItem(BEST_SCORE_KEY);
    if (!raw) return { ...EMPTY_BEST };
    return { ...EMPTY_BEST, ...JSON.parse(raw) };
  } catch (e) {
    return { ...EMPTY_BEST };
  }
}

/**
 * Saves the score if it beats the stored record.
 * @returns {Promise<{best: object, isNewRecord: boolean}>}
 */
export async function saveScore(score, difficulty) {
  const best = await loadBestScores();
  const previous = best[difficulty] ?? 0;
  const isNewRecord = score > previous;

  const next = {
    ...best,
    [difficulty]: Math.max(previous, score),
    overall: Math.max(best.overall ?? 0, score),
  };

  try {
    await AsyncStorage.setItem(BEST_SCORE_KEY, JSON.stringify(next));
  } catch (e) {
    // Storage failures should not interrupt the results screen.
  }

  return { best: next, isNewRecord };
}

export async function loadPrefs() {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function savePrefs(prefs) {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    // Preferences are a convenience, not a requirement.
  }
}

export async function resetProgress() {
  try {
    await AsyncStorage.multiRemove([BEST_SCORE_KEY, PREFS_KEY]);
  } catch (e) {
    // no-op
  }
}

export default { loadBestScores, saveScore, loadPrefs, savePrefs, resetProgress };
