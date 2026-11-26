
import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { radius, spacing } from '../../theme/theme';
import { useTheme } from '../../theme/ThemeProvider';

export interface AppCardProps extends ViewProps {
  selected?: boolean;
}

export function AppCard({
  selected = false,
  style,
  ...props
}: AppCardProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        selected && {
          backgroundColor: colors.selectedSurface,
          borderColor: colors.accent,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});

export default AppCard;
