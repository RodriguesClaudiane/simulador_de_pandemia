import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet } from 'react-native';
import { layout, radius, spacing } from '../../theme/theme';
import { useTheme } from '../../theme/ThemeProvider';
import AppText from './AppText';

export interface AppButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}
export function AppButton({ label, variant = 'primary', loading = false, disabled = false, style, accessibilityState, ...props }: AppButtonProps) {
  const { theme: { colors } } = useTheme();
  const blocked = disabled || loading;
  const primary = variant === 'primary';
  const tone = blocked && !loading ? 'muted' : primary ? 'onPrimary' : 'text';
  return (
    <Pressable {...props} accessibilityRole="button" accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityState={{ ...accessibilityState, disabled: blocked, busy: loading }} disabled={blocked}
      style={state => [styles.base,
        primary ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.control, borderColor: colors.controlBorder },
        state.pressed && !blocked && styles.pressed,
        typeof style === 'function' ? style(state) : style,
        disabled && !loading && { backgroundColor: colors.control, borderColor: colors.controlBorder },
      ]}>
      {loading && <ActivityIndicator color={colors[tone]} />}
      <AppText variant="button" tone={tone} style={styles.label}>{label}</AppText>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: { minHeight: layout.minTouchTarget, minWidth: layout.minTouchTarget, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm, borderWidth: 1 },
  pressed: { opacity: 0.8 }, label: { textAlign: 'center', flexShrink: 1 },
});
export default AppButton;
