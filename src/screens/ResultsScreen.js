import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import ResultCard from '../components/ResultCard';
import PrimaryButton from '../components/PrimaryButton';
import { accuracy, resultTier } from '../utils/scoring';
import { saveScore } from '../storage/scoreStorage';
import { getCategoryMeta } from '../data/categories';
import { colors, radius, spacing } from '../constants/theme';
import { contentMaxWidth, scale } from '../utils/responsive';
import { finishFeedback } from '../utils/feedback';

export function ResultsScreen({ navigation, route }) {
  const { summary } = route.params ?? {};
  const { width } = useWindowDimensions();
  const maxWidth = contentMaxWidth(width);

  const [bestScore, setBestScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const score = summary?.score ?? 0;
  const total = summary?.total ?? 0;
  const correct = summary?.correct ?? 0;
  const incorrect = summary?.incorrect ?? 0;
  const difficulty = summary?.difficulty ?? 'Medium';
  const category = summary?.category ?? 'All';
  const percentage = accuracy(correct, total);
  const tier = resultTier(percentage);
  const categoryMeta = getCategoryMeta(category);

  // Persist the score once, on mount, and find out if it is a new record.
  useEffect(() => {
    let active = true;
    finishFeedback();
    saveScore(score, difficulty).then(({ best, isNewRecord: record }) => {
      if (!active) return;
      setBestScore(best[difficulty] ?? 0);
      setIsNewRecord(record);
    });
    return () => {
      active = false;
    };
  }, [score, difficulty]);

  const playAgain = () => {
    // replace() gives the quiz screen a fresh mount, and therefore a freshly
    // shuffled round rather than the one just played.
    navigation.replace('Quiz', { category, difficulty });
  };

  return (
    <GradientBackground variant="results">
      <ScrollView
        contentContainerStyle={[styles.scroll, { maxWidth, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>ROUND COMPLETE</Text>
          <View style={styles.contextPill}>
            <Text style={styles.contextText}>
              {categoryMeta.emoji} {category} · {difficulty}
            </Text>
          </View>
        </View>

        <ResultCard
          tier={tier}
          score={score}
          correct={correct}
          incorrect={incorrect}
          total={total}
          percentage={percentage}
          bestStreak={summary?.bestStreak ?? 0}
          isNewRecord={isNewRecord}
        />

        <View style={styles.bestRow}>
          <Text style={styles.bestText}>
            🏆 Best on {difficulty}: {bestScore.toLocaleString()} points
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Play Again" icon="🔄" variant="warm" onPress={playAgain} />
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  headerRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.textOnDarkMuted,
    fontSize: scale(11.5),
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  contextPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.overlayStrong,
  },
  contextText: {
    color: colors.textOnDark,
    fontSize: scale(12.5),
    fontWeight: '800',
  },
  bestRow: {
    alignItems: 'center',
  },
  bestText: {
    color: colors.textOnDark,
    fontSize: scale(14),
    fontWeight: '700',
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});

export default ResultsScreen;
