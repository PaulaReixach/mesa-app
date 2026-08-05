import { SymbolView } from 'expo-symbols';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type { PublicGroupSummary } from '../types/group';
import { fonts } from '../theme/fonts';

type PublicGroupCardProps = {
  group: PublicGroupSummary;
  onPress: () => void;
};

export function PublicGroupCard({
  group,
  onPress,
}: PublicGroupCardProps) {
  const imageUri = group.imageUrl
    ? resolveApiUrl(group.imageUrl)
    : null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageInitial}>
              {group.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={styles.title}
        >
          {group.name}
        </Text>

        <View style={styles.ownerRow}>
          <Text numberOfLines={1} style={styles.owner}>
            por @{group.owner.username}
          </Text>

          {group.following ? (
            <View style={styles.followingState}>
              <View style={styles.metaDot} />
              <SymbolView
                name={{
                  ios: 'checkmark',
                  android: 'check',
                  web: 'check',
                }}
                size={11}
                tintColor={colors.olive}
              />
              <Text style={styles.followingText}>
                Siguiendo
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {group.restaurantCount}{' '}
            {group.restaurantCount === 1
              ? 'restaurante'
              : 'restaurantes'}
          </Text>

          <View style={styles.metaDot} />

          <Text style={styles.metaText}>
            {group.followerCount}{' '}
            {group.followerCount === 1
              ? 'seguidor'
              : 'seguidores'}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <SymbolView
            name={{
              ios: 'mappin',
              android: 'location_on',
              web: 'location_on',
            }}
            size={13}
            tintColor={colors.primary}
          />
          <Text style={styles.locationText}>
            {group.city ?? 'Sin ciudad'}
          </Text>
        </View>
      </View>

      <SymbolView
        name={{
          ios: 'chevron.right',
          android: 'chevron_right',
          web: 'chevron_right',
        }}
        size={20}
        tintColor={colors.muted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cardPressed: {
    opacity: 0.7,
  },
  imageContainer: {
    width: 76,
    height: 76,
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageInitial: {
    color: colors.primary,
    fontSize: 26,
    fontFamily: fonts.bold,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 19,
    fontFamily: fonts.bold,
  },
  owner: {
    maxWidth: '66%',
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.semiBold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  metaText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  followingState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  followingText: {
    color: colors.olive,
    fontSize: 9.5,
    fontFamily: fonts.semiBold,
  },
});
