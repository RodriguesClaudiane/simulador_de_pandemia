import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet } from 'react-native';
import { colors, layout, radius, spacing } from '../../theme/theme';
import AppText from './AppText';

export interface AppButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}
export function AppButton({ label, variant = 'primary', loading = false, disabled = false, style, accessibilityState, ...props }: AppButtonProps) {
  const blocked = disabled || loading;
  return <Pressable {...props} accessibilityRole="button" accessibilityLabel={props.accessibilityLabel ?? label} accessibilityState={{ ...accessibilityState, disabled: blocked, busy: loading }} disabled={blocked} style={state => [styles.base, variant === 'primary' ? styles.primary : styles.secondary, state.pressed && styles.pressed, blocked && styles.disabled, typeof style === 'function' ? style(state) : style]}>
    {loading && <ActivityIndicator color={colors.onPrimary} />}
    <AppText variant="button" tone={variant === 'primary' ? 'onPrimary' : 'text'} style={styles.label}>{label}</AppText>
  </Pressable>;
}
const styles = StyleSheet.create({
  base: { minHeight: layout.minTouchTarget, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.control, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.8 }, disabled: { opacity: 0.5 }, label: { textAlign: 'center', flexShrink: 1 },
});
export default AppButton;
