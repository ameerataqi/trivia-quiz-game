import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import GradientBackground from '../components/GradientBackground';
import PrimaryButton from '../components/PrimaryButton';
import SelectorChip from '../components/SelectorChip';
import { CATEGORIES, ALL_CATEGORIES } from '../data/categories';
import { DIFFICULTIES, DEFAULT_DIFFICULTY } from '../constants/gameConfig';
import {
  CATEGORIES_PER_TEAM,
  QUESTIONS_PER_TEAM,
  TEAM_THEMES,
} from '../constants/teamConfig';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { contentMaxWidth, scale } from '../utils/responsive';

/** "All" is a solo-mode convenience; teams pick real categories. */
const PICKABLE = CATEGORIES.filter((c) => c.id !== ALL_CATEGORIES);

export function TeamSetupScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const maxWidth = contentMaxWidth(width);

  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const [names, setNames] = useState(['', '']);
  const [picks, setPicks] = useState([[], []]);

  const toggleCategory = (teamIndex, categoryId) => {
    setPicks((prev) =>
      prev.map((list, index) => {
        if (index !== teamIndex) return list;
        if (list.includes(categoryId)) return list.filter((c) => c !== categoryId);
        if (list.length >= CATEGORIES_PER_TEAM) return list; // hard cap at three
        return [...list, categoryId];
      }),
    );
  };

  const ready = picks.every((list) => list.length === CATEGORIES_PER_TEAM);

  const teams = useMemo(
    () =>
      TEAM_THEMES.map((theme, index) => ({
        id: theme.id,
        name: names[index].trim() || theme.defaultName,
        categories: picks[index],
      })),
    [names, picks],
  );

  const startBattle = () => {
    if (!ready) return;
    navigation.navigate('Battle', { teams, difficulty });
  };

  return (
    <GradientBackground variant="app">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { maxWidth, alignSelf: 'center', width: '100%' }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>⚔️ Team Battle</Text>
            <Text style={styles.subtitle}>
              Two teams, {QUESTIONS_PER_TEAM} questions each — {CATEGORIES_PER_TEAM} from your own
              categories and 1 wildcard nobody sees coming.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Difficulty</Text>
            <View style={styles.difficultyRow}>
              {DIFFICULTIES.map((level) => (
                <SelectorChip
                  key={level.id}
                  label={level.label}
                  emoji={level.emoji}
                  sublabel={`${level.seconds}s per Q`}
                  selected={difficulty === level.id}
                  colors={level.colors}
                  onPress={() => setDifficulty(level.id)}
                  layout="stack"
                  style={styles.flex}
                />
              ))}
            </View>
          </View>

          {TEAM_THEMES.map((theme, index) => {
            const chosen = picks[index];
            const remaining = CATEGORIES_PER_TEAM - chosen.length;

            return (
              <View
                key={theme.id}
                style={[styles.teamCard, shadows.medium, { borderColor: theme.accent }]}
              >
                <View style={styles.teamHeader}>
                  <View style={[styles.teamBadge, { backgroundColor: theme.accent }]}>
                    <Text style={styles.teamBadgeEmoji}>{theme.emoji}</Text>
                  </View>
                  <TextInput
                    value={names[index]}
                    onChangeText={(text) =>
                      setNames((prev) => prev.map((n, i) => (i === index ? text : n)))
                    }
                    placeholder={theme.defaultName}
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    maxLength={18}
                    style={styles.nameInput}
                    accessibilityLabel={`Name for team ${index + 1}`}
                    returnKeyType="done"
                  />
                </View>

                <Text style={styles.pickPrompt}>
                  {remaining > 0
                    ? `Pick ${remaining} more categor${remaining === 1 ? 'y' : 'ies'}`
                    : '✅ Categories locked in'}
                </Text>

                <View style={styles.categoryGrid}>
                  {PICKABLE.map((category) => {
                    const selected = chosen.includes(category.id);
                    const full = !selected && remaining === 0;
                    return (
                      <SelectorChip
                        key={category.id}
                        label={category.name}
                        emoji={category.emoji}
                        selected={selected}
                        colors={theme.chip}
                        onPress={() => toggleCategory(index, category.id)}
                        style={[styles.categoryChip, full && styles.categoryChipFull]}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}

          <View style={styles.footer}>
            {!ready && (
              <Text style={styles.hint}>
                Both teams need {CATEGORIES_PER_TEAM} categories before the battle can start.
              </Text>
            )}
            <PrimaryButton
              label="Start Battle"
              icon="⚔️"
              variant="warm"
              disabled={!ready}
              onPress={startBattle}
              testID="start-battle"
            />
            <PrimaryButton
              label="Back"
              icon="🏠"
              variant="ghost"
              onPress={() => navigation.goBack()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textOnDark,
    fontSize: scale(32),
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textOnDarkMuted,
    fontSize: scale(14),
    fontWeight: '600',
    lineHeight: scale(20),
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
  teamCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(8,4,32,0.55)',
    borderWidth: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  teamBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeEmoji: {
    fontSize: scale(22),
  },
  nameInput: {
    flex: 1,
    color: colors.textOnDark,
    fontSize: scale(19),
    fontWeight: '900',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  pickPrompt: {
    color: colors.textOnDarkMuted,
    fontSize: scale(12.5),
    fontWeight: '700',
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
  categoryChipFull: {
    opacity: 0.4,
  },
  footer: {
    gap: spacing.md,
  },
  hint: {
    color: colors.textOnDarkMuted,
    fontSize: scale(12.5),
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default TeamSetupScreen;
