import React, { ReactNode, useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SegmentedControl from './ui/SegmentedControl';
import AppButton from './ui/AppButton';
import type { Theme } from '../theme/theme';
import { useTheme } from '../theme/ThemeProvider';

type Props = { visible: boolean; onClose: () => void; basic: ReactNode; advanced: ReactNode };

export default function SettingsPanel({ visible, onClose, basic, advanced }: Props) {
  const [tab, setTab] = useState<'basic' | 'advanced'>('basic');
  const { width } = useWindowDimensions();
  const { theme, resolvedMode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {visible && <StatusBar barStyle={resolvedMode === 'dark' ? 'light-content' : 'dark-content'} />}
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar configurações" />
        <SafeAreaView style={[styles.panel, { width: Math.min(460, width * 0.92) }]} accessibilityViewIsModal>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>Configurações</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar configurações" style={styles.close}>
              <Text style={styles.title}>×</Text>
            </Pressable>
          </View>
          <SegmentedControl options={[{ label: 'Básicas', value: 'basic' }, { label: 'Avançadas', value: 'advanced' }]} value={tab} onChange={setTab} />
          <ScrollView key={tab} style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {tab === 'basic' ? basic : advanced}
          </ScrollView>
          <Text style={styles.note}>Alterações salvas automaticamente nesta sessão.</Text>
          <AppButton label="Aplicar e fechar" onPress={onClose} />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function createStyles({ colors, spacing, typography, radius, layout }: Theme) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'flex-end' },
    panel: { flex: 1, backgroundColor: colors.background, padding: spacing.md, borderLeftWidth: 1, borderLeftColor: colors.border, gap: spacing.sm },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    title: { ...typography.section, color: colors.text, flexShrink: 1 },
    close: { minWidth: layout.minTouchTarget, minHeight: layout.minTouchTarget, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.control, borderWidth: 1, borderColor: colors.controlBorder, borderRadius: radius.md },
    content: { paddingVertical: spacing.md },
    note: { ...typography.caption, color: colors.muted },
  });
}
