import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { AppText } from './AppText';
import { createThemedStyles, iconSize, radius, useTheme } from '../../theme';
import type { GroupRestaurantStatus } from '../../types/restaurant';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

// Labels match the rest of the app ("Queremos ir"); see pending decision in DESIGN.md › Migración pendiente.
const statusMeta: Record<GroupRestaurantStatus, { label: string; icon: SymbolName }> = {
  WANT_TO_GO: { label: 'Queremos ir', icon: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' } },
  VISITED: { label: 'Visitado', icon: { ios: 'checkmark', android: 'check', web: 'check' } },
  FAVORITE: { label: 'Favorito', icon: { ios: 'heart.fill', android: 'favorite', web: 'favorite' } },
  WANT_TO_REPEAT: { label: 'Queremos repetir', icon: { ios: 'arrow.2.squarepath', android: 'repeat', web: 'repeat' } },
  DO_NOT_REPEAT: { label: 'No repetir', icon: { ios: 'xmark', android: 'close', web: 'close' } },
  ARCHIVED: { label: 'Archivado', icon: { ios: 'archivebox', android: 'archive', web: 'archive' } },
};

export function StatusChip({ status }: { status: GroupRestaurantStatus }) {
  const { status: statusColors } = useTheme();
  const styles = useStyles();
  const { foreground, background } = statusColors[status];
  const { label, icon } = statusMeta[status];

  return (
    <View style={[styles.chip, { backgroundColor: background }]}>
      <SymbolView accessible={false} name={icon} size={iconSize.status} tintColor={foreground} />
      <AppText variant="label" maxFontSizeMultiplier={1.6} style={{ color: foreground }}>{label}</AppText>
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: radius.xs,
    borderCurve: 'continuous',
  },
}));
