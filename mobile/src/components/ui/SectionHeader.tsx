import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme/theme';
import AppText from './AppText';

export interface SectionHeaderProps { title: string; eyebrow?: string; description?: string }
export function SectionHeader({ title, eyebrow, description }: SectionHeaderProps) {
  return <View style={styles.container}>
    {eyebrow ? <AppText variant="caption" tone="accent">{eyebrow}</AppText> : null}
    <AppText variant="section" accessibilityRole="header">{title}</AppText>
    {description ? <AppText tone="muted">{description}</AppText> : null}
  </View>;
}
const styles = StyleSheet.create({ container: { gap: spacing.xs } });
export default SectionHeader;
