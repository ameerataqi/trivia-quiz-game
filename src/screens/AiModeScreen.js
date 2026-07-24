import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import PrimaryButton from '../components/PrimaryButton';
import SelectorChip from '../components/SelectorChip';
import { PICKABLE_CATEGORIES } from '../data/categories';
import { hasAiKey, AI_MODEL } from '../api/aiOpponent';
import { colors, radius, shadows, spacing } from '../constants/theme';
import { contentMaxWidth, scale } from '../utils/responsive';

const GENERAL_KNOWLEDGE = 'General Knowledge';

/**
 * Sits between the home screen and a solo round: do you want the AI playing
 * against you? The default subject is General Knowledge; choosing the AI opens
 * a category picker so the match can be fought on any topic.
 */
export function AiModeScreen({ navigation, route }) {
  const { category: homeCategory, difficulty } = route.params ?? {};
  const { width } = useWindowDimensions();
  const maxWidth = contentMaxWidth(width);

  const [vsAi, setVsAi] = useState(false);
  const [aiCategory, setAiCategory] = useState(GENERAL_KNOWLEDGE);
  const keyPresent = hasAiKey();

  const playSolo = () => navigation.replace('Quiz', { category: homeCategory, difficulty });
  const playVsAi = () => navigation.replace('AiQuiz', { category: aiCategory, difficulty });

  return (
    <GradientBackground variant="app">
      <ScrollView
        contentContainerStyle={[styles.scroll, { maxWidth, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🤖</Text>
          <Text style={styles.title}>Play against the AI?</Text>
          <Text style={styles.subtitle}>
            Face an AI opponent on General Knowledge — it answers every question you do, and the
            most correct answers wins.
          </Text>
        </View>

        <View style={styles.choiceRow}>
          <SelectorChip
            label="Challenge the AI"
            emoji="🤖"
            sublabel="Head to head"
            selected={vsAi}
            colors={['#38BDF8', '#0284C7']}
            onPress={() => setVsAi(true)}
            layout="stack"
            style={styles.choice}
          />
          <SelectorChip
            label="Just me"
            emoji="🧠"
            sublabel="Classic solo"
            selected={!vsAi}
            colors={['#7C5CFF', '#B14CE0']}
            onPress={() => setVsAi(false)}
            layout="stack"
            style={styles.choice}
          />
        </View>

        {vsAi && (
          <View style={[styles.pickerCard, shadows.medium]}>
            <Text style={styles.pickerTitle}>Pick the battleground</Text>
            <Text style={styles.pickerHint}>
              General Knowledge is the classic — but you can drag the AI onto your turf.
            </Text>
            <View style={styles.categoryGrid}>
              {PICKABLE_CATEGORIES.map((item) => (
                <SelectorChip
                  key={item.id}
                  label={item.shortName}
                  emoji={item.emoji}
                  selected={aiCategory === item.id}
                  colors={item.colors}
                  onPress={() => setAiCategory(item.id)}
                  style={styles.categoryChip}
                />
              ))}
            </View>

            {!keyPresent && (
              <View style={styles.keyWarning}>
                <Text style={styles.keyWarningTitle}>⚠️ No AI key configured</Text>
                <Text style={styles.keyWarningText}>
                  The AI opponent ({AI_MODEL}) needs an OpenRouter API key. Add
                  EXPO_PUBLIC_OPENROUTER_API_KEY to your .env.local and restart — until then the
                  AI will forfeit every question.
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <PrimaryButton
            label={vsAi ? 'Start the Match' : 'Start Solo Round'}
            icon={vsAi ? '⚔️' : '🚀'}
            variant="warm"
            onPress={vsAi ? playVsAi : playSolo}
            testID="ai-mode-start"
          />
          <PrimaryButton label="Back" icon="🏠" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: scale(52),
  },
  title: {
    color: colors.textOnDark,
    fontSize: scale(28),
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textOnDarkMuted,
    fontSize: scale(14),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: scale(20),
  },
  choiceRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  choice: {
    flex: 1,
  },
  pickerCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(8,4,32,0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(56,189,248,0.55)',
  },
  pickerTitle: {
    color: colors.textOnDark,
    fontSize: scale(17),
    fontWeight: '800',
  },
  pickerHint: {
    color: colors.textOnDarkMuted,
    fontSize: scale(12.5),
    fontWeight: '600',
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
  keyWarning: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(251,191,36,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.6)',
  },
  keyWarningTitle: {
    color: '#FCD34D',
    fontSize: scale(13),
    fontWeight: '900',
  },
  keyWarningText: {
    color: colors.textOnDarkMuted,
    fontSize: scale(12),
    fontWeight: '600',
    lineHeight: scale(17),
  },
  footer: {
    gap: spacing.md,
  },
});

export default AiModeScreen;
