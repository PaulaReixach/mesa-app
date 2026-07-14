import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export {
  EmptyTab,
  GroupHeading,
  GroupHero,
  GroupInfoBanner,
  GroupRestaurantListCard,
  GroupTabs,
  MemberPreview,
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
    <View style={styles.card}>
      <SymbolView
        name={presentation.icon}
        size={17}
        tintColor={presentation.tint}
      />
      <View style={styles.copy}>
        <Text style={styles.value}>{value}</Text>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          numberOfLines={1}
          style={styles.label}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: '#FFFDF8',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 15,
    fontFamily: fonts.bold,
  },
  label: {
    color: colors.muted,
    fontSize: 8,
    lineHeight: 10,
    fontFamily: fonts.semiBold,
  },
});
