import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props<T extends string> = {
  options: readonly { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};
export default function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const { theme } = useTheme();
  const { colors, radius, typography, layout } = theme;
  return (
    <View style={[styles.row, { backgroundColor: colors.control, borderRadius: radius.md }]}>
      {options.map(option => {
        const selected = value === option.value;
        return (
          <Pressable key={option.value} accessibilityRole="tab"
            accessibilityLabel={option.label} accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.item, { minHeight: layout.minTouchTarget, borderRadius: radius.sm,
              backgroundColor: selected ? colors.selectedSurface : colors.control,
              borderColor: selected ? colors.accent : colors.controlBorder }]}>
            <Text style={[typography.button, styles.text, { color: selected ? colors.accent : colors.muted }]}>
              {selected ? '✓ ' : ''}{option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', padding: 3, gap: 3 },
  item: { flex: 1, minWidth: 48, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, paddingHorizontal: 6, borderWidth: 1 },
  text: { textAlign: 'center' },
});
