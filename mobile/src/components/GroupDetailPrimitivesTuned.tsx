import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { GroupMember } from '../types/group-member';

export {
  GroupHeading,
  GroupHero,
  GroupInfoBanner,
  GroupRestaurantListCard,
  GroupTabs,
  OwnerStrip,
  PrimaryGroupAction,
} from './GroupDetailPrimitives';

export type {
  GroupDetailTab,
} from './GroupDetailPrimitives';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type StatKind =
  | 'restaurants'
  | 'members'
  | 'invitations'
  | 'collaborators'
  | 'followers';

const statPresentation: Record<
  StatKind,
  {
    icon: SymbolName;
    tint: string;
  }
> = {
  restaurants: {
    icon: {
      ios: 'fork.knife',
      android: 'restaurant',
      web: 'restaurant',
    },
    tint: colors.primary,
  },
  members: {
    icon: {
      ios: 'person.2.fill',
      android: 'group',
      web: 'group',
    },
    tint: '#617C3A',
  },
  invitations: {
    icon: {
      ios: 'envelope',
      android: 'mail_outline',
      web: 'mail_outline',
    },
    tint: colors.primary,
  },
  collaborators: {
    icon: {
      ios: 'person.3.fill',
      android: 'groups',
      web: 'groups',
    },
    tint: '#617C3A',
  },
  followers: {
    icon: {
      ios: 'person.2.wave.2.fill',
      android: 'diversity_1',
      web: 'diversity_1',
    },
    tint: colors.primary,
  },
};

export function GroupStat({
  kind,
  value,
  label,
}: {
  kind: StatKind;
  value: number;
  label: string;
}) {
  const presentation = statPresentation[kind];

  return (
    <View style={styles.stat}>
      <View style={styles.statValueRow}>
        <SymbolView
          name={presentation.icon}
          size={15}
          tintColor={presentation.tint}
        />
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text numberOfLines={1} style={styles.label}>{label}</Text>
    </View>
  );
}

export function EmptyTab({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: SymbolName;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <SymbolView name={icon} size={21} tintColor={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export function MemberPreview({
  members,
  title,
  actionLabel,
  onAction,
}: {
  members: GroupMember[];
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.members}>
      <View style={styles.membersHeader}>
        <Text style={styles.membersTitle}>{title}</Text>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onAction}
            style={({ pressed }) => pressed ? styles.pressed : null}
          >
            <Text style={styles.membersAction}>{actionLabel} ›</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.membersRow}>
        {members.slice(0, 4).map(member => {
          const avatar = member.avatarUrl
            ? resolveApiUrl(member.avatarUrl)
            : null;
          const owner = member.role === 'OWNER';

          return (
            <View key={member.id} style={styles.member}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                {owner ? (
                  <View style={styles.crown}>
                    <SymbolView
                      name={{
                        ios: 'crown.fill',
                        android: 'workspace_premium',
                        web: 'workspace_premium',
                      }}
                      size={8}
                      tintColor={colors.white}
                    />
                  </View>
                ) : null}
              </View>
              <Text numberOfLines={1} style={styles.memberName}>
                {member.name}
              </Text>
              {owner ? <Text style={styles.owner}>Creadora</Text> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 17,
    fontFamily: fonts.bold,
  },
  label: {
    color: colors.muted,
    fontSize: 8,
    lineHeight: 11,
    fontFamily: fonts.semiBold,
  },
  empty: {
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 24,
    paddingVertical: 19,
  },
  emptyIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderRadius: 20,
    backgroundColor: '#FBE9E2',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 12,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  emptyText: {
    maxWidth: 260,
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  members: {
    gap: 11,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  membersTitle: {
    color: colors.text,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  membersAction: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  member: {
    width: 54,
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 21,
    backgroundColor: '#F4E1D8',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  crown: {
    position: 'absolute',
    right: -2,
    bottom: -1,
    width: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
    borderRadius: 9,
    backgroundColor: colors.primary,
  },
  memberName: {
    maxWidth: '100%',
    marginTop: 4,
    color: colors.text,
    fontSize: 8,
    fontFamily: fonts.bold,
  },
  owner: {
    marginTop: 1,
    color: colors.primary,
    fontSize: 7,
    fontFamily: fonts.bold,
  },
  pressed: {
    opacity: 0.68,
  },
});
