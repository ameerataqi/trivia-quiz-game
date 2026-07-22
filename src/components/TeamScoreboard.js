import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AnimatedNumber from './AnimatedNumber';
import { colors, radius, spacing } from '../constants/theme';
import { scale } from '../utils/responsive';

/**
 * Both teams' running scores side by side, with the team currently answering
 * lifted and outlined in its own colour.
 */
export function TeamScoreboard({ teams, activeIndex }) {
  return (
    <View style={styles.row}>
      {teams.map((team, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={team.id}
            style={[
              styles.card,
              isActive && styles.cardActive,
              isActive && { borderColor: team.accent },
            ]}
          >
            <Text style={[styles.name, isActive && styles.nameActive]} numberOfLines={1}>
              {team.emoji} {team.name}
            </Text>
            <AnimatedNumber
              value={team.score}
              style={[styles.score, isActive && { color: team.accent }]}
            />
            {isActive && <Text style={styles.turnFlag}>ANSWERING</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
    gap: 1,
  },
  cardActive: {
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  name: {
    color: colors.textOnDarkMuted,
    fontSize: scale(11.5),
    fontWeight: '800',
  },
  nameActive: {
    color: colors.textOnDark,
  },
  score: {
    color: colors.textOnDarkMuted,
    fontSize: scale(21),
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  turnFlag: {
    color: colors.textOnDarkMuted,
    fontSize: scale(9),
    fontWeight: '900',
    letterSpacing: 1.1,
  },
});

export default TeamScoreboard;
