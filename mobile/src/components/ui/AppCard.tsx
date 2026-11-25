import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';

export interface AppCardProps extends ViewProps { selected?: boolean }
export function AppCard({ selected = false, style, ...props }: AppCardProps) {
  return <View {...props} style={[styles.card, selected && styles.selected, style]} />;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  selected: { backgroundColor: colors.selectedSurface, borderColor: colors.accent },
});
export default AppCard;
