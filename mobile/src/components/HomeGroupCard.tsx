import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import { AppText } from './ui/AppText';
import { AvatarStack } from './ui/Avatar';
import { PressableCard } from './ui/PressableCard';
import { resolveApiUrl } from '../lib/api';
import { createThemedStyles, iconSize, radius, space, useTheme } from '../theme';
import type { RestaurantGroup } from '../types/group';
import type { GroupMember } from '../types/group-member';

/**
 * Group card from the prototype: name + chevron, saved count, member faces and
 * "N por probar" (places marked "Queremos ir") or "Todo al día".
 */
export function HomeGroupCard({ group, members, restaurantCount, pendingCount, onPress }: {
  group: RestaurantGroup;
  members: GroupMember[];
  /** null when the group's restaurants could not be loaded. */
  restaurantCount: number | null;
  pendingCount: number | null;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const saved = restaurantCount === null ? null
    : `${restaurantCount} ${restaurantCount === 1 ? 'restaurante guardado' : 'restaurantes guardados'}`;
  const pending = pendingCount === null ? null : pendingCount > 0 ? `${pendingCount} por probar` : 'Todo al día';
  const membersLabel = members.length > 0 ? `${members.length} ${members.length === 1 ? 'miembro' : 'miembros'}` : null;

  return (
    <PressableCard onPress={onPress}
      accessibilityLabel={[group.name, saved, membersLabel, pending].filter(Boolean).join('. ')}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <AppText variant="cardTitle" style={styles.flex}>{group.name}</AppText>
          <SymbolView accessible={false} name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={iconSize.link} tintColor={colors.secondary} />
        </View>
        {saved && <AppText variant="secondary" tone="muted">{saved}</AppText>}
        {(members.length > 0 || pending) && (
          <View style={styles.social}>
            <AvatarStack people={members} ringColor={colors.surface} resolveUri={resolveApiUrl} />
            {pending && (
              <View style={styles.pending}>
                <AppText variant="label" tone="olive">{pending}</AppText>
              </View>
            )}
          </View>
        )}
      </View>
    </PressableCard>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  content: { gap: space.s1, paddingHorizontal: 15, paddingVertical: 13 },
  flex: { flex: 1 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  social: {
    minHeight: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s2,
    marginTop: 7,
  },
  pending: {
    marginLeft: 'auto',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderCurve: 'continuous',
    backgroundColor: colors.tint,
  },
}));
