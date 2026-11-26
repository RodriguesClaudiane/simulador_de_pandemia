import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from './theme';
import type { Theme, ThemeMode } from './theme';

const STORAGE_KEY = '@periferialab/theme-mode';
type ThemeContextValue = {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  ready: boolean;
  storageError: string | null;
};
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const isMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemMode = useColorScheme();
  const [mode, updateMode] = useState<ThemeMode>('dark');
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writes = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && isMode(saved)) updateMode(saved);
      } catch {
        if (active) setStorageError('Não foi possível restaurar o tema.');
      } finally {
        if (active) setReady(true);
      }
    }
    void restore();
    return () => { active = false; };
  }, []);
  const setMode = useCallback((next: ThemeMode) => {
    if (!ready || !isMode(next)) return;
    updateMode(next);
    writes.current = writes.current.then(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, next);
        setStorageError(null);
      } catch {
        setStorageError('Não foi possível salvar a preferência de tema.');
      }
    });
  }, [ready]);
  const resolvedMode = mode === 'system' ? (systemMode === 'light' ? 'light' : 'dark') : mode;
  const value = useMemo<ThemeContextValue>(() => ({
    mode, resolvedMode, theme: resolvedMode === 'light' ? lightTheme : darkTheme,
    setMode, ready, storageError,
  }), [mode, resolvedMode, setMode, ready, storageError]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser utilizado dentro de ThemeProvider.');
  return context;
}
