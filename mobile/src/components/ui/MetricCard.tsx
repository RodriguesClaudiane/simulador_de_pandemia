import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/theme';

export type MetricCardProps = {
  label: string;
  value: number | string;
  color?: string;
  description?: string;
  state?: keyof Theme['epidemiologyColors'];
  scenario?: keyof Theme['scenarioColors'];
};
export default function MetricCard({ label, value, color, description, state, scenario }: MetricCardProps) {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = theme;
  const valueColor = state ? theme.epidemiologyColors[state] : scenario ? theme.scenarioColors[scenario] : color ?? colors.accent;
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: spacing.xs }]}>
      <Text style={[typography.caption, { color: colors.muted }]}>{label}</Text>
      <Text style={[typography.metric, { color: valueColor }]}>{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</Text>
      {description ? <Text style={[typography.caption, { color: colors.muted }]}>{description}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({ card: { flexGrow: 1, minWidth: 0, borderWidth: 1 } });
