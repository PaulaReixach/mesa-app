import { SymbolView } from 'expo-symbols';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { useAuth } from '../contexts/auth-context';
import { colors, loginColors as palette } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import { GroupArtwork } from './GroupArtwork';
import { groupListStyles as styles } from './GroupList.styles';
import { groupFocusStyle } from './GroupsPrimitives';

type GroupCardProps = {
  group: RestaurantGroup;
  onPress: () => void;
  selectionMode?: boolean;
};

export function GroupCard({ group, onPress, selectionMode = false }: GroupCardProps) {
  const { user } = useAuth();
  const { fontScale } = useWindowDimensions();
  const stacked = fontScale > 1.3;
  const [focused, setFocused] = useState<'card' | 'manage' | null>(null);
  const isPublic = group.privacy === 'PUBLIC';
  const collaborating = group.currentUserRole === 'CONTRIBUTOR';
  const canManageCollaboration = isPublic && group.ownerUserId === user?.id && !selectionMode;
  const privacyLabel = isPublic ? 'Público' : 'Privado';

  function handlePress(): void {
    if (collaborating && !selectionMode) {
      router.push(`/groups/public/${group.id}` as Href);
      return;
    }
    onPress();
  }

  return (
    <View style={styles.wrapper}>
      <Pressable accessibilityRole="button"
        accessibilityLabel={`${selectionMode ? 'Elegir' : 'Abrir'} ${group.name}. ${privacyLabel}${collaborating ? '. Colaboras en este grupo' : ''}${group.city ? '. ' + group.city : ''}`}
        onPress={handlePress} onFocus={() => setFocused('card')} onBlur={() => setFocused(null)}
        style={({ pressed }) => [styles.card, stacked && styles.stackedCard, pressed && styles.pressed, focused === 'card' && groupFocusStyle]}>
        <GroupArtwork imageUrl={group.imageUrl} name={group.name} />
        <View style={[styles.content, stacked && styles.stackedContent]}>
          <Text style={styles.title}>{group.name}</Text>
          {group.description && <Text numberOfLines={2} style={styles.description}>{group.description}</Text>}
          {group.city && (
            <View style={styles.location}>
              <SymbolView accessible={false} name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }} size={16} tintColor={palette.muted} />
              <Text style={styles.locationText}>{group.city}</Text>
            </View>
          )}
          <View style={styles.badges}>
            <View style={[styles.badge, isPublic && styles.publicBadge]}>
              <SymbolView accessible={false} name={isPublic
                ? { ios: 'globe', android: 'public', web: 'public' }
                : { ios: 'lock', android: 'lock', web: 'lock' }} size={14} tintColor={isPublic ? colors.olivePressed : palette.primaryPressed} />
              <Text style={[styles.badgeText, isPublic && styles.publicText]}>{privacyLabel}</Text>
            </View>
            {collaborating && <Text style={styles.meta}>Colaboras</Text>}
          </View>
        </View>
        <View style={stacked && styles.stackedChevron}>
          <SymbolView accessible={false} name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={20} tintColor={palette.muted} />
        </View>
      </Pressable>
      {canManageCollaboration && (
        <Pressable accessibilityRole="button" accessibilityLabel={`Gestionar colaboración de ${group.name}`}
          onFocus={() => setFocused('manage')} onBlur={() => setFocused(null)}
          onPress={() => router.push({ pathname: '/groups/[groupId]/collaboration-requests', params: { groupId: group.id } })}
          style={({ pressed }) => [styles.manage, pressed && styles.pressed, focused === 'manage' && groupFocusStyle]}>
          <SymbolView accessible={false} name={{ ios: 'person.2.badge.gearshape', android: 'manage_accounts', web: 'manage_accounts' }} size={20} tintColor={palette.primary} />
          <Text style={styles.manageText}>Gestionar colaboración</Text>
          <SymbolView accessible={false} name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={palette.primary} />
        </Pressable>
      )}
    </View>
  );
}
