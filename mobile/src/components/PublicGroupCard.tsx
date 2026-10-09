import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { colors, loginColors as palette } from '../theme/colors';
import type { PublicGroupSummary } from '../types/group';
import { GroupArtwork } from './GroupArtwork';
import { groupListStyles as styles } from './GroupList.styles';
import { groupFocusStyle } from './GroupsPrimitives';

export function PublicGroupCard({ group, onPress }: { group: PublicGroupSummary; onPress: () => void }) {
  const [focused, setFocused] = useState(false);
  const { fontScale } = useWindowDimensions();
  const stacked = fontScale > 1.3;
  const restaurantLabel = `${group.restaurantCount} ${group.restaurantCount === 1 ? 'restaurante' : 'restaurantes'}`;
  const followerLabel = `${group.followerCount} ${group.followerCount === 1 ? 'seguidor' : 'seguidores'}`;
  return (
    <View style={styles.wrapper}>
      <Pressable accessibilityRole="button"
        accessibilityLabel={`Abrir ${group.name}, por @${group.owner.username}. ${restaurantLabel}, ${followerLabel}${group.city ? '. ' + group.city : ''}${group.following ? '. Siguiendo' : ''}`}
        onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={({ pressed }) => [styles.card, stacked && styles.stackedCard, pressed && styles.pressed, focused && groupFocusStyle]}>
        <GroupArtwork imageUrl={group.imageUrl} name={group.name} />
        <View style={[styles.content, stacked && styles.stackedContent]}>
          <Text style={styles.title}>{group.name}</Text>
          <Text style={styles.owner}>Por @{group.owner.username}</Text>
          <Text style={styles.meta}>{restaurantLabel} · {followerLabel}</Text>
          {group.city && (
            <View style={styles.location}>
              <SymbolView accessible={false} name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }} size={16} tintColor={palette.muted} />
              <Text style={styles.locationText}>{group.city}</Text>
            </View>
          )}
          {group.following && (
            <View style={[styles.badge, styles.publicBadge]}>
              <SymbolView accessible={false} name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={14} tintColor={colors.olivePressed} />
              <Text style={[styles.badgeText, styles.publicText]}>Siguiendo</Text>
            </View>
          )}
        </View>
        <View style={stacked && styles.stackedChevron}>
          <SymbolView accessible={false} name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={20} tintColor={palette.muted} />
        </View>
      </Pressable>
    </View>
  );
}
