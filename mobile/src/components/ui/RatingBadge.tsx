import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import { AppText } from './AppText';
import { formatScore, iconSize, space, useTheme } from '../../theme';

/**
 * Score in olive: star + figure, plus an optional count ("· 2 valoraciones en este grupo").
 * Without ratings it shows `emptyLabel` with an outlined fork-and-knife icon.
 */
export function RatingBadge({ score, count, countSuffix = '', emptyLabel = 'Aún sin valoraciones' }: {
  score: number | null;
  count: number;
  /** Appended to the count, e.g. " en este grupo". */
  countSuffix?: string;
  emptyLabel?: string;
}) {
  const { colors } = useTheme();
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, alignItems: 'center' as const, gap: space.s1 };

  if (score === null || count === 0) {
    return (
      <View style={row}>
        <SymbolView accessible={false} name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }}
          size={iconSize.inline} tintColor={colors.rating} />
        <AppText variant="body" tone="muted">{emptyLabel}</AppText>
      </View>
    );
  }

  const countLabel = `${count} ${count === 1 ? 'valoración' : 'valoraciones'}${countSuffix}`;
  return (
    <View accessible accessibilityLabel={`Media ${formatScore(score)} sobre 10, ${countLabel}`} style={row}>
      <SymbolView accessible={false} name={{ ios: 'star.fill', android: 'star', web: 'star' }}
        size={iconSize.inline - 1} tintColor={colors.rating} />
      <AppText variant="score" style={{ color: colors.rating }}>{formatScore(score)}</AppText>
      <AppText variant="secondary" tone="muted">· {countLabel}</AppText>
    </View>
  );
}
