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
        <View style={styles.titleRow}>
          <Text
            numberOfLines={2}
            style={styles.title}
          >
            {group.name}
          </Text>

          {group.following ? (
            <View style={styles.followingBadge}>
              <SymbolView
                name={{
                  ios: 'checkmark',
                  android: 'check',
                  web: 'check',
                }}
                size={12}
                tintColor="#607349"
              />
              <Text style={styles.followingText}>
                Siguiendo
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.owner}>
          por @{group.owner.username}
        </Text>

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
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  cardPressed: {
    opacity: 0.72,
  },
  imageContainer: {
    width: 78,
    height: 78,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#F3DED5',
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
    fontSize: 28,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  owner: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
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
    fontSize: 9,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: colors.muted,
    fontSize: 9,
  },
  followingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E8EEDD',
  },
  followingText: {
    color: '#607349',
    fontSize: 8,
    fontWeight: '900',
  },
});
