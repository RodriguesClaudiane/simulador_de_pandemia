
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import {
  colors,
  spacing,
  radius,
  typography,
  layout,
} from '../../theme/theme';

type Props<T extends string> = {
  options: readonly {
    label: string;
    value: T;
  }[];
  value: T;
  onChange: (value: T) => void;
};

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          accessibilityRole="tab"
          accessibilityState={{
            selected: value === option.value,
          }}
          onPress={() => onChange(option.value)}
          style={[
            styles.item,
            value === option.value && styles.active,
          ]}
        >
          <Text
            style={[
              styles.text,
              value === option.value && styles.selected,
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.control,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  active: {
    backgroundColor: colors.selectedSurface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  text: {
    ...typography.button,
    color: colors.muted,
    textAlign: 'center',
  },
  selected: {
    color: colors.accent,
  },
});
