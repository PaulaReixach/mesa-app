import { SymbolView } from 'expo-symbols';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';

export {
  EmptyTab,
  GroupHero,
  GroupInfoBanner,
  GroupRestaurantListCard,
  GroupStat,
  GroupTabs,
  MemberPreview,
  OwnerStrip,
  PrimaryGroupAction,
} from './GroupDetailPrimitivesCompact';

export type {
  GroupDetailTab,
} from './GroupDetailPrimitivesCompact';

type GroupHeadingProps = {
  title: string;
  privacyLabel: string;
  city: string | null;
  description?: string | null;
};

export function GroupHeading({
  title,
  privacyLabel,
  city,
}: GroupHeadingProps) {
  return (
    <View style={styles.heading}>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.68}
        numberOfLines={1}
        style={styles.title}
      >
        {title}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <SymbolView
            name={{
              ios: privacyLabel === 'Grupo privado'
                ? 'lock.fill'
                : 'globe.europe.africa.fill',
              android: privacyLabel === 'Grupo privado'
                ? 'lock'
                : 'public',
              web: privacyLabel === 'Grupo privado'
                ? 'lock'
                : 'public',
            }}
            size={14}
            tintColor={colors.muted}
          />
          <Text style={styles.metaText}>{privacyLabel}</Text>
        </View>

        {city ? (
          <>
            <Text style={styles.metaDot}>·</Text>
            <View style={styles.metaItem}>
              <SymbolView
                name={{
                  ios: 'mappin.and.ellipse',
                  android: 'location_on',
                  web: 'location_on',
                }}
                size={15}
                tintColor={colors.primary}
              />
              <Text style={styles.cityText}>{city}</Text>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: 7,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  metaDot: {
    color: colors.muted,
    fontSize: 12,
  },
  cityText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
