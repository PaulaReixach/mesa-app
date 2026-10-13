import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from './ui/AppText';
import { resolveApiUrl } from '../lib/api';
import { createThemedStyles, fonts, space, useTheme } from '../theme';
import type { RestaurantGroup } from '../types/group';
import type { GroupMember } from '../types/group-member';

const CIRCLE = 72;
const INNER = 64;

export function openGroup(group: RestaurantGroup): void {
  if (group.privacy === 'PUBLIC') {
    router.push(`/groups/public/${group.id}` as Href);
    return;
  }
  router.push({ pathname: '/groups/[groupId]', params: { groupId: group.id } });
}

function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(word => word.length > 2 || /^\p{Lu}/u.test(word));
  const letters = (words.length > 1 ? words.slice(0, 2) : [name.trim()]).map(word => word.charAt(0));
  return (letters.join('') || '·').toUpperCase().slice(0, 2);
}

/** «Tus grupos»: a row of 72 pt circles (cover, faces or monogram) and «Nuevo grupo». */
export function HomeGroupCircles({ groups, membersByGroup }: {
  groups: RestaurantGroup[];
  membersByGroup: Record<string, GroupMember[]>;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {groups.map(group => {
        const unseen = group.unseenCount ?? 0;
        return (
          <Pressable key={group.id} onPress={() => openGroup(group)} accessibilityRole="button"
            accessibilityLabel={unseen > 0 ? `Abrir ${group.name}, ${unseen} ${unseen === 1 ? 'novedad' : 'novedades'}` : `Abrir ${group.name}`}
            style={styles.item}>
            <View style={[styles.ring, unseen > 0 && styles.ringNews]}>
              <GroupFace group={group} members={membersByGroup[group.id] ?? []} />
              {unseen > 0 && (
                <View style={styles.badge}>
                  <AppText style={styles.badgeText} maxFontSizeMultiplier={1.2}>{unseen > 9 ? '9+' : unseen}</AppText>
                </View>
              )}
            </View>
            <AppText style={[styles.name, unseen === 0 && styles.nameQuiet]} numberOfLines={2}>{group.name}</AppText>
          </Pressable>
        );
      })}
      <Pressable onPress={() => router.push('/groups/create')} accessibilityRole="button"
        accessibilityLabel="Nuevo grupo" style={styles.item}>
        <View style={styles.dashed}>
          <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={24} tintColor={colors.secondary} />
        </View>
        <AppText style={[styles.name, styles.newName]} numberOfLines={2}>Nuevo grupo</AppText>
      </Pressable>
    </ScrollView>
  );
}

function GroupFace({ group, members }: { group: RestaurantGroup; members: GroupMember[] }) {
  const styles = useStyles();
  const { cover } = useTheme();
  if (group.imageUrl) {
    return <Image source={{ uri: resolveApiUrl(group.imageUrl) }} style={styles.inner} contentFit="cover" accessible={false} />;
  }
  const faces = members.filter(member => member.avatarUrl).slice(0, 2);
  if (faces.length === 2) {
    return (
      <View style={[styles.inner, styles.split]}>
        {faces.map(member => (
          <Image key={member.id} source={{ uri: resolveApiUrl(member.avatarUrl ?? '') }} style={styles.half}
            contentFit="cover" accessible={false} />
        ))}
      </View>
    );
  }
  const tone = cover[Array.from(group.name).reduce((sum, char) => sum + char.charCodeAt(0), 0) % cover.length];
  return (
    <View style={[styles.inner, styles.center, { backgroundColor: tone.background }]}>
      <AppText style={[styles.monogram, { color: tone.ink }]} maxFontSizeMultiplier={1}>{monogram(group.name)}</AppText>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: space.s1, gap: 10 },
  item: { width: 76, alignItems: 'center', gap: space.s2 },
  ring: {
    width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2, padding: 3,
    borderWidth: 1, borderColor: colors.separator, alignItems: 'center', justifyContent: 'center',
  },
  ringNews: { borderWidth: 2.5, borderColor: colors.accent, padding: 1.5 },
  badge: {
    position: 'absolute', right: -6, bottom: -4, minWidth: 27, height: 27, paddingHorizontal: 6, borderRadius: 13.5,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent,
    borderWidth: 2.5, borderColor: colors.background,
  },
  badgeText: { fontFamily: fonts.semiBold, fontSize: 12, lineHeight: 15, color: colors.onAccent, fontVariant: ['tabular-nums'] },
  nameQuiet: { color: colors.textSecondary },
  inner: { width: INNER, height: INNER, borderRadius: INNER / 2, overflow: 'hidden' },
  split: { flexDirection: 'row' },
  half: { width: INNER / 2, height: INNER },
  center: { alignItems: 'center', justifyContent: 'center' },
  monogram: { fontFamily: fonts.display, fontSize: 19, letterSpacing: -0.5 },
  dashed: {
    width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2, borderWidth: 1.5, borderStyle: 'dashed',
    borderColor: colors.borderInput, alignItems: 'center', justifyContent: 'center',
  },
  name: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 15, textAlign: 'center', color: colors.textPrimary },
  newName: { fontFamily: fonts.semiBold, color: colors.secondary },
}));
