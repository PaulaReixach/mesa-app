import { StyleSheet } from 'react-native';

import type { ColorScheme } from './palette';
import { useTheme, type Theme } from './use-theme';

type NamedStyles<T> = StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<unknown>;

/**
 * Builds a hook that returns styles for the current color scheme.
 * Styles are created once per scheme, not on every render.
 */
export function createThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: Theme) => T,
): () => T {
  const cache: Partial<Record<ColorScheme, T>> = {};

  return function useThemedStyles(): T {
    const theme = useTheme();
    const cached = cache[theme.scheme];
    if (cached) return cached;
    const styles = StyleSheet.create(factory(theme));
    cache[theme.scheme] = styles;
    return styles;
  };
}
