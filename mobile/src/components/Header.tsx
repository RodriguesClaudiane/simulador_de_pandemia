import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import ThemeSelector from './themeSelect';

type HeaderProps = { subtitle?: string };
export default function Header({ subtitle = 'SIMULADOR DE PANDEMIAS' }: HeaderProps) {
  const { theme } = useTheme();
  const { colors: c } = theme;
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: c.background }}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <View style={styles.identity}>
          <View style={styles.brand}>
            <View style={styles.bars} accessible={false}>
              {[8, 14, 10].map((height, index) => <View key={index} style={[styles.bar, { height, backgroundColor: c.accent }]} />)}
            </View>
            <Text accessibilityRole="header" style={[styles.logo, { color: c.text }]}>PeriferiaLab</Text>
          </View>
          <Text style={[styles.subtitle, { color: c.muted }]}>{subtitle}</Text>
        </View>
        <ThemeSelector />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  identity: { flex: 1, gap: 2 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 4, borderRadius: 1 },
  logo: { fontSize: 18, fontWeight: '700', flexShrink: 1 },
  subtitle: { fontSize: 10, letterSpacing: 0.5 },
});
