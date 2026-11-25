import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors, typography } from '../../theme/theme';

export interface AppTextProps extends TextProps {
  variant?: keyof typeof typography;
  tone?: keyof typeof colors;
}
export function AppText({ variant = 'body', tone = 'text', style, ...props }: AppTextProps) {
  return <Text {...props} style={[typography[variant], { color: colors[tone] }, style]} />;
}
export default AppText;
