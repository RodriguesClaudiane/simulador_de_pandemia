
import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors, typography } from '../../theme/theme';
import { useTheme } from '../../theme/ThemeProvider';

export interface AppTextProps extends TextProps {
  variant?: keyof typeof typography;
  tone?: keyof typeof colors;
}

export function AppText({
  variant = 'body',
  tone = 'text',
  style,
  ...props
}: AppTextProps) {
  const { theme } = useTheme();

  return (
    <Text
      {...props}
      style={[
        theme.typography[variant],
        { color: theme.colors[tone] },
        style,
      ]}
    />
  );
}

export default AppText;
