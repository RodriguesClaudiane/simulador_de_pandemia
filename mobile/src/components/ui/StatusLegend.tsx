import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

const items = [
  ['S', 'Suscetíveis', 'susceptible'],
  ['E', 'Expostos', 'exposed'],
  ['I', 'Infectados', 'infected'],
  ['R', 'Recuperados', 'recovered'],
  ['D', 'Falecidos', 'deceased'],
] as const;
export type StatusLegendProps = { counts?: readonly number[] };
export default function StatusLegend({ counts }: StatusLegendProps) {
  const { theme } = useTheme();
  const { colors, epidemiologyColors, spacing, radius, typography } = theme;
  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      {items.map(([symbol, label, key], i) => {
        const count = counts?.[i];
        return (
          <View key={key} style={[styles.item, { gap: spacing.xs }]}>
            <View style={[styles.dot, { backgroundColor: epidemiologyColors[key], borderRadius: radius.sm }]} />
            <Text style={[typography.caption, styles.text, { color: colors.text }]}>
              {symbol} — {label}{count !== undefined ? `: ${count.toLocaleString('pt-BR')}` : ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap' },
  item: { flexDirection: 'row', alignItems: 'center', maxWidth: '100%' },
  dot: { width: 12, height: 12 },
  text: { flexShrink: 1 },
});
