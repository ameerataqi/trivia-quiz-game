import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { loadBestScores } from '../storage/scoreStorage';

/**
 * Reads the stored best scores and refreshes them every time the screen
 * regains focus, so returning from a round shows an updated record instantly.
 */
export function useBestScores() {
  const [best, setBest] = useState({ overall: 0, Easy: 0, Medium: 0, Hard: 0 });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    let active = true;
    loadBestScores().then((value) => {
      if (!active) return;
      setBest(value);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(refresh);

  return { best, loading, refresh };
}

export default useBestScores;
