import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeMode } from '../theme/theme';

const options: { mode: ThemeMode; title: string; description: string; symbol: string }[] = [
  { mode: 'light', title: 'Claro', description: 'Fundos claros e textos escuros', symbol: '☀' },
  { mode: 'dark', title: 'Escuro', description: 'Aparência original do PeriferiaLab', symbol: '☾' },
  { mode: 'system', title: 'Sistema', description: 'Segue a aparência do dispositivo', symbol: '◐' },
];

export default function ThemeSelector() {
  const { theme, mode, setMode, storageError, ready } = useTheme();
  const { colors: c } = theme;
  const [open, setOpen] = useState(false);
  const current = options.find(option => option.mode === mode)!;
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`Aparência: ${current.title}`} accessibilityHint="Abre as opções de tema" accessibilityState={{ expanded: open, disabled: !ready }} disabled={!ready} onPress={() => setOpen(true)} style={[styles.trigger, { backgroundColor: c.control, borderColor: c.controlBorder }]}>
      <Text style={[styles.symbol, { color: c.text }]}>{current.symbol}</Text>
    </Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={[styles.overlay, { backgroundColor: c.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessible={false} importantForAccessibility="no" />
        <View accessibilityViewIsModal style={[styles.panel, { backgroundColor: c.surface, borderColor: c.border }]}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>Aparência</Text>
            <Text style={{ color: c.muted, fontSize: 14 }}>Escolha o tema de sua preferência.</Text>
            {options.map(option => {
              const selected = mode === option.mode;
              return <Pressable key={option.mode} accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={`${option.title}. ${option.description}`} onPress={() => setMode(option.mode)} style={[styles.option, { backgroundColor: selected ? c.selectedSurface : c.control, borderColor: selected ? c.accent : c.controlBorder }]}>
                <Text style={[styles.symbol, { color: selected ? c.accent : c.text }]}>{option.symbol}</Text>
                <View style={styles.label}>
                  <Text style={[styles.optionTitle, { color: c.text }]}>{option.title}</Text>
                  <Text style={{ color: c.muted, fontSize: 13 }}>{option.description}</Text>
                </View>
                <Text style={{ color: selected ? c.accent : c.muted, fontSize: 18 }}>{selected ? '✓' : '○'}</Text>
              </Pressable>;
            })}
            {storageError ? <Text accessibilityLiveRegion="polite" style={{ color: c.danger }}>{storageError}</Text> : null}
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={[styles.done, { backgroundColor: c.primary }]}>
              <Text style={{ color: c.onPrimary, fontWeight: '700', fontSize: 14 }}>Concluir</Text>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  trigger: { minWidth: 48, minHeight: 48, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 6 },
  symbol: { fontSize: 23, fontWeight: '600' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  panel: { width: '100%', maxWidth: 440, maxHeight: '90%', borderWidth: 1, borderRadius: 14 },
  content: { padding: 16, gap: 12 },
  heading: { fontSize: 20, fontWeight: '700' },
  option: { minHeight: 48, borderWidth: 1, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '700' },
  done: { minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 12 },
});
