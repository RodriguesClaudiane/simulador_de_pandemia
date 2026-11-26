import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

function AppContent() {
  const { ready, theme } = useTheme();
  if (!ready) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator color={theme.colors.accent} accessibilityLabel="Carregando preferências" />
    </View>;
  }
  return <AppNavigator />;
}

export default function App() {
  return <ThemeProvider><AppContent /></ThemeProvider>;
}
