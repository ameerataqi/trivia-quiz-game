import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import GradientBackground from '../components/GradientBackground';
import PrimaryButton from '../components/PrimaryButton';
import SelectorChip from '../components/SelectorChip';
import { CATEGORIES, ALL_CATEGORIES, getCategoryMeta } from '../data/categories';
import { DIFFICULTIES, DEFAULT_DIFFICULTY, QUESTIONS_PER_ROUND } from '../constants/gameConfig';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { loadPrefs, savePrefs } from '../storage/scoreStorage';
import useBestScores from '../hooks/useBestScores';
import { contentMaxWidth, scale } from '../utils/responsive';

const WELCOME_MESSAGES = [
  'Ready to prove what you know?',
  'Ten questions. One shot. Go.',
  'Your brain called — it wants a workout.',
  'Think fast, score big.',
  'Let’s see that winning streak.',
];

export function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const maxWidth = contentMaxWidth(width);

  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const { best } = useBestScores();

  // Chosen once per mount so the greeting changes between visits.
  const welcome = useRef(
    WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)],
  ).current;

  const logoAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Restore the player's last picks so the app opens where they left off.
  useEffect(() => {
    let active = true;
    loadPrefs().then((prefs) => {
      if (!active || !prefs) return;
      if (prefs.difficulty) setDifficulty(prefs.difficulty);
      if (prefs.category) setCategory(prefs.category);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    savePrefs({ difficulty, category });
  }, [difficulty, category]);

  useEffect(() => {
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [logoAnim, floatAnim]);

  const logoStyle = {
    opacity: logoAnim,
    transform: [
      { scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
      { translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
    ],
  };

  const bestForDifficulty = best[difficulty] ?? 0;
  const activeLevel = DIFFICULTIES.find((d) => d.id === difficulty) ?? DIFFICULTIES[1];
  const activeCategory = getCategoryMeta(category);

  // Solo starts via the "play against the AI?" ask-screen.
  const startGame = () => {
    navigation.navigate('AiMode', { category, difficulty });
  };

  return (
    <GradientBackground variant="home">
      <ScrollView
        contentContainerStyle={[styles.scroll, { maxWidth, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.hero, logoStyle]}>
          <View style={[styles.logoBubble, shadows.strong]}>
            <Text style={styles.logoEmoji}>🧠</Text>
          </View>
          <Text style={styles.logoTitle}>Trivia Blast</Text>
          <Text style={styles.tagline}>{welcome}</Text>
        </Animated.View>

        <View style={[styles.bestCard, shadows.medium]}>
          <View style={styles.bestRow}>
            <View>
              <Text style={styles.bestLabel}>BEST SCORE · {difficulty.toUpperCase()}</Text>
              <Text style={styles.bestValue}>{bestForDifficulty.toLocaleString()}</Text>
            </View>
            <View style={styles.trophyCircle}>
              <Text style={styles.trophy}>🏆</Text>
            </View>
          </View>
          <Text style={styles.bestHint}>
            All-time best: {(best.overall ?? 0).toLocaleString()} points
          </Text>
        </View>

        <View style={[styles.battleCard, shadows.medium]}>
          <Text style={styles.battleTitle}>⚔️ Team Battle</Text>
          <Text style={styles.battleBlurb}>
            Two teams, three categories each, one wildcard — and three powers apiece. Highest score
            takes it.
          </Text>
          <PrimaryButton
            label="Start a Battle"
            icon="🔥"
            variant="primary"
            onPress={() => navigation.navigate('TeamSetup')}
            testID="start-battle-cta"
          />
        </View>

        <View style={styles.soloHeader}>
          <View style={styles.rule} />
          <Text style={styles.soloHeaderText}>OR PLAY SOLO</Text>
          <View style={styles.rule} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose your difficulty</Text>
          <View style={styles.difficultyRow}>
            {DIFFICULTIES.map((level) => (
              <SelectorChip
                key={level.id}
                label={level.label}
                emoji={level.emoji}
                sublabel={`${level.seconds}s · ${level.multiplier}× pts`}
                selected={difficulty === level.id}
                colors={level.colors}
                onPress={() => setDifficulty(level.id)}
                layout="stack"
                style={styles.difficultyChip}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pick a category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((item) => (
              <SelectorChip
                key={item.id}
                label={item.shortName}
                emoji={item.emoji}
                selected={category === item.id}
                colors={item.colors}
                onPress={() => setCategory(item.id)}
                style={styles.categoryChip}
              />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.availability}>
            {QUESTIONS_PER_ROUND} live questions · {activeCategory.shortName} · {activeLevel.blurb}
          </Text>

          <PrimaryButton
            label="Start Game"
            icon="🚀"
            variant="warm"
            onPress={startGame}
            testID="start-game"
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
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  logoBubble: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  logoEmoji: {
    fontSize: scale(52),
  },
  logoTitle: {
    color: colors.textOnDark,
    fontSize: scale(38),
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: spacing.sm,
  },
  tagline: {
    color: colors.textOnDarkMuted,
    fontSize: scale(15),
    fontWeight: '600',
    textAlign: 'center',
  },
  bestCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    gap: spacing.sm,
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bestLabel: {
    color: colors.textOnDarkMuted,
    fontSize: scale(10.5),
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  bestValue: {
    color: colors.textOnDark,
    fontSize: scale(30),
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  trophyCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  trophy: {
    fontSize: scale(26),
  },
  bestHint: {
    color: colors.textOnDarkMuted,
    fontSize: scale(12.5),
    fontWeight: '600',
  },
  battleCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(12,4,44,0.42)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  battleTitle: {
    color: colors.textOnDark,
    fontSize: scale(21),
    fontWeight: '900',
  },
  battleBlurb: {
    color: colors.textOnDarkMuted,
    fontSize: scale(13),
    fontWeight: '600',
    lineHeight: scale(19),
  },
  soloHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  soloHeaderText: {
    color: colors.textOnDarkMuted,
    fontSize: scale(10.5),
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textOnDark,
    fontSize: scale(17),
    fontWeight: '800',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  difficultyChip: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    width: '48%',
    flexGrow: 1,
  },
  footer: {
    gap: spacing.md,
  },
  availability: {
    color: colors.textOnDarkMuted,
    fontSize: scale(12.5),
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen;
