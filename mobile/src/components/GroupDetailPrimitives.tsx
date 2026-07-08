import { SymbolView } from 'expo-symbols';
import type { ComponentProps, ReactNode } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { restaurantFallbackImages } from '../constants/restaurant-fallback-images';
import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type { GroupMember } from '../types/group-member';
import type {
  GroupRestaurant,
  GroupRestaurantStatus,
} from '../types/restaurant';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

export type GroupDetailTab<T extends string> = {
  key: T;
  label: string;
};

type GroupHeroProps = {
  imageUri: string | null;
  fallbackInitial: string;
  onBack: () => void;
  onShare: () => void;
  onMenu: () => void;
};

export function GroupHero({
  imageUri,
  fallbackInitial,
  onBack,
  onShare,
  onMenu,
}: GroupHeroProps) {
  return (
    <View style={styles.hero}>
      {imageUri ? (
        <Image
          resizeMode="cover"
          source={{ uri: imageUri }}
          style={styles.heroImage}
        />
      ) : (
        <View style={styles.heroFallback}>
          <View style={styles.heroFallbackGlowOne} />
          <View style={styles.heroFallbackGlowTwo} />
          <View style={styles.heroFallbackIcon}>
            <SymbolView
              name={{
                ios: 'fork.knife',
                android: 'restaurant',
                web: 'restaurant',
              }}
              size={27}
              tintColor={colors.white}
            />
          </View>
          <Text style={styles.heroFallbackInitial}>
            {fallbackInitial}
          </Text>
        </View>
      )}

      <View style={styles.heroOverlay} />

      <View style={styles.heroNavigation}>
        <RoundHeroButton
          accessibilityLabel="Volver"
          icon={{
            ios: 'chevron.left',
            android: 'arrow_back',
            web: 'arrow_back',
          }}
          onPress={onBack}
        />

        <View style={styles.heroNavigationRight}>
          <RoundHeroButton
            accessibilityLabel="Compartir grupo"
            icon={{
              ios: 'square.and.arrow.up',
              android: 'share',
              web: 'share',
            }}
            onPress={onShare}
          />
          <RoundHeroButton
            accessibilityLabel="Más opciones"
            icon={{
              ios: 'ellipsis',
              android: 'more_horiz',
              web: 'more_horiz',
            }}
            onPress={onMenu}
          />
        </View>
      </View>
    </View>
  );
}

function RoundHeroButton({
  accessibilityLabel,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  icon: SymbolName;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.heroButton,
        pressed ? styles.pressed : null,
      ]}
    >
      <SymbolView
        name={icon}
        size={18}
        tintColor={colors.text}
      />
    </Pressable>
  );
}

export function GroupHeading({
  title,
  privacyLabel,
  city,
}: {
  title: string;
  privacyLabel: string;
  city: string | null;
  description?: string | null;
}) {
  return (
    <View style={styles.heading}>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.62}
        numberOfLines={1}
        style={styles.groupTitle}
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
    <View style={styles.statCard}>
      <SymbolView
        name={presentation.icon}
        size={18}
        tintColor={presentation.tint}
      />
      <View style={styles.statTextWrap}>
        <Text style={styles.statValue}>{value}</Text>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          numberOfLines={1}
          style={styles.statLabel}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

export function PrimaryGroupAction({
  title,
  icon,
  onPress,
  outline = false,
  loading = false,
}: {
  title: string;
  icon: SymbolName;
  onPress: () => void;
  outline?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryAction,
        outline ? styles.primaryActionOutline : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <SymbolView
        name={icon}
        size={18}
        tintColor={outline ? colors.primary : colors.white}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.primaryActionText,
          outline ? styles.primaryActionTextOutline : null,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function GroupTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: GroupDetailTab<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
}) {
  return (
    <View style={styles.tabs}>
      {tabs.map(tab => {
        const active = tab.key === activeTab;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={styles.tab}
          >
            <Text
              style={[
                styles.tabText,
                active ? styles.tabTextActive : null,
              ]}
            >
              {tab.label}
            </Text>
            <View
              style={[
                styles.tabIndicator,
                active ? styles.tabIndicatorActive : null,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export function GroupInfoBanner({
  icon,
  title,
  subtitle,
  actionLabel,
  onPress,
  tone = 'warm',
  trailing,
}: {
  icon: SymbolName;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onPress?: () => void;
  tone?: 'warm' | 'green';
  trailing?: ReactNode;
}) {
  const green = tone === 'green';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.infoBanner,
        green ? styles.infoBannerGreen : null,
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.infoIcon,
          green ? styles.infoIconGreen : null,
        ]}
      >
        <SymbolView
          name={icon}
          size={18}
          tintColor={green ? '#617C3A' : colors.primary}
        />
      </View>

      <View style={styles.infoTextWrap}>
        <Text numberOfLines={1} style={styles.infoTitle}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.infoSubtitle}>
          {subtitle}
        </Text>
      </View>

      {trailing ?? (actionLabel ? (
        <View style={styles.infoAction}>
          <Text
            style={[
              styles.infoActionText,
              green ? styles.infoActionTextGreen : null,
            ]}
          >
            {actionLabel}
          </Text>
          <SymbolView
            name={{
              ios: 'chevron.right',
              android: 'chevron_right',
              web: 'chevron_right',
            }}
            size={15}
            tintColor={green ? '#617C3A' : colors.primary}
          />
        </View>
      ) : null)}
    </Pressable>
  );
}

const statusPresentation: Record<
  GroupRestaurantStatus,
  {
    label: string;
    background: string;
    text: string;
  }
> = {
  WANT_TO_GO: {
    label: 'Pendiente',
    background: '#FFF0D9',
    text: '#A46B16',
  },
  VISITED: {
    label: 'Visitado',
    background: '#E8EEDD',
    text: '#607349',
  },
  FAVORITE: {
    label: 'Favorito',
    background: '#F9E1DC',
    text: colors.primary,
  },
  WANT_TO_REPEAT: {
    label: 'Repetir',
    background: '#E8EEDD',
    text: '#607349',
  },
  DO_NOT_REPEAT: {
    label: 'No repetir',
    background: '#FFF1EE',
    text: colors.danger,
  },
  ARCHIVED: {
    label: 'Archivado',
    background: '#ECE8E6',
    text: colors.muted,
  },
};

function fallbackImageFor(name: string): string {
  const index = Array.from(name).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  ) % restaurantFallbackImages.length;

  return restaurantFallbackImages[index];
}

export function GroupRestaurantListCard({
  item,
  mode,
  onPress,
}: {
  item: GroupRestaurant;
  mode: 'private' | 'public';
  onPress: () => void;
}) {
  const location = [
    item.restaurant.address,
    item.restaurant.city,
  ]
    .filter(Boolean)
    .join(' · ');
  const status = statusPresentation[item.status];
  const average = item.averageScore == null
    ? '—'
    : item.averageScore.toFixed(1).replace('.', ',');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.restaurantCard,
        pressed ? styles.pressed : null,
      ]}
    >
      <Image
        resizeMode="cover"
        source={{ uri: fallbackImageFor(item.restaurant.name) }}
        style={styles.restaurantImage}
      />

      <View style={styles.restaurantContent}>
        <Text numberOfLines={1} style={styles.restaurantName}>
          {item.restaurant.name}
        </Text>
        <Text numberOfLines={1} style={styles.restaurantCategory}>
          {item.restaurant.category ?? 'Restaurante'}
        </Text>
        <View style={styles.restaurantLocationRow}>
          <SymbolView
            name={{
              ios: 'mappin',
              android: 'location_on',
              web: 'location_on',
            }}
            size={12}
            tintColor={colors.muted}
          />
          <Text numberOfLines={1} style={styles.restaurantLocation}>
            {location || 'Sin ubicación'}
          </Text>
        </View>
      </View>

      <View style={styles.restaurantTrailing}>
        {mode === 'private' ? (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: status.background },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: status.text },
              ]}
            >
              {status.label}
            </Text>
          </View>
        ) : null}

        <View style={styles.ratingPill}>
          <Text style={styles.ratingStar}>★</Text>
          <Text style={styles.ratingValue}>{average}</Text>
        </View>

        {mode === 'public' && item.ratingsCount > 0 ? (
          <Text style={styles.ratingCount}>
            {item.ratingsCount} valoraciones
          </Text>
        ) : null}
      </View>

      <SymbolView
        name={{
          ios: 'chevron.right',
          android: 'chevron_right',
          web: 'chevron_right',
        }}
        size={16}
        tintColor={colors.muted}
      />
    </Pressable>
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
  const previewMembers = members.slice(0, 4);

  return (
    <View style={styles.memberPreview}>
      <View style={styles.memberPreviewHeader}>
        <Text style={styles.memberPreviewTitle}>{title}</Text>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={styles.memberPreviewAction}
          >
            <Text style={styles.memberPreviewActionText}>
              {actionLabel}
            </Text>
            <SymbolView
              name={{
                ios: 'chevron.right',
                android: 'chevron_right',
                web: 'chevron_right',
              }}
              size={14}
              tintColor="#617C3A"
            />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.memberPreviewList}>
        {previewMembers.map(member => {
          const avatarUri = member.avatarUrl
            ? resolveApiUrl(member.avatarUrl)
            : null;
          const owner = member.role === 'OWNER';

          return (
            <View key={member.id} style={styles.memberPreviewItem}>
              <View style={styles.previewAvatarWrap}>
                <View style={styles.previewAvatar}>
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      style={styles.previewAvatarImage}
                    />
                  ) : (
                    <Text style={styles.previewAvatarText}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                {owner ? (
                  <View style={styles.ownerCrown}>
                    <SymbolView
                      name={{
                        ios: 'crown.fill',
                        android: 'workspace_premium',
                        web: 'workspace_premium',
                      }}
                      size={9}
                      tintColor={colors.white}
                    />
                  </View>
                ) : null}
              </View>
              <Text numberOfLines={1} style={styles.previewName}>
                {member.name}
              </Text>
              {owner ? (
                <Text style={styles.previewOwner}>Creadora</Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function OwnerStrip({
  name,
  username,
  avatarUrl,
  onPress,
}: {
  name: string;
  username: string;
  avatarUrl: string | null;
  onPress?: () => void;
}) {
  const resolvedAvatar = avatarUrl
    ? resolveApiUrl(avatarUrl)
    : null;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ownerStrip,
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View style={styles.ownerStripAvatar}>
        {resolvedAvatar ? (
          <Image
            source={{ uri: resolvedAvatar }}
            style={styles.ownerStripAvatarImage}
          />
        ) : (
          <Text style={styles.ownerStripInitial}>
            {name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.ownerStripText}>
        <Text style={styles.ownerStripTitle}>
          Creado por <Text style={styles.ownerStripAccent}>{name}</Text>
        </Text>
        <Text style={styles.ownerStripSubtitle}>@{username}</Text>
      </View>
      <SymbolView
        name={{
          ios: 'chevron.right',
          android: 'chevron_right',
          web: 'chevron_right',
        }}
        size={16}
        tintColor={colors.muted}
      />
    </Pressable>
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
    <View style={styles.emptyTab}>
      <View style={styles.emptyTabIcon}>
        <SymbolView
          name={icon}
          size={22}
          tintColor={colors.primary}
        />
      </View>
      <Text style={styles.emptyTabTitle}>{title}</Text>
      <Text style={styles.emptyTabText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 154,
    overflow: 'hidden',
    backgroundColor: '#694437',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#784C3C',
  },
  heroFallbackGlowOne: {
    position: 'absolute',
    width: 170,
    height: 170,
    top: -70,
    right: -25,
    borderRadius: 85,
    backgroundColor: 'rgba(223,164,127,0.42)',
  },
  heroFallbackGlowTwo: {
    position: 'absolute',
    width: 135,
    height: 135,
    bottom: -65,
    left: -20,
    borderRadius: 68,
    backgroundColor: 'rgba(168,183,146,0.42)',
  },
  heroFallbackIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  heroFallbackInitial: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(24,16,12,0.12)',
  },
  heroNavigation: {
    position: 'absolute',
    top: 12,
    right: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroNavigationRight: {
    flexDirection: 'row',
    gap: 8,
  },
  heroButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#2B2421',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 3,
  },
  heading: {
    gap: 6,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  metaDot: {
    color: colors.muted,
    fontSize: 11,
  },
  cityText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: '#FFFCFA',
  },
  statTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 17,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '600',
  },
  primaryAction: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  primaryActionOutline: {
    backgroundColor: colors.surface,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  primaryActionTextOutline: {
    color: colors.primary,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 39,
    paddingHorizontal: 4,
  },
  tabText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  tabIndicator: {
    width: '84%',
    height: 2,
    marginTop: 8,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  tabIndicatorActive: {
    backgroundColor: colors.primary,
  },
  infoBanner: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#FFF7EC',
  },
  infoBannerGreen: {
    backgroundColor: '#F1F3E9',
  },
  infoIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FFE5C2',
  },
  infoIconGreen: {
    backgroundColor: '#E0E9CF',
  },
  infoTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
  },
  infoSubtitle: {
    color: colors.muted,
    fontSize: 7,
    lineHeight: 10,
  },
  infoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  infoActionText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  infoActionTextGreen: {
    color: '#617C3A',
  },
  restaurantCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  restaurantImage: {
    width: 72,
    height: 72,
    borderRadius: 13,
    backgroundColor: '#E8DED8',
  },
  restaurantContent: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  restaurantName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  restaurantCategory: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '600',
  },
  restaurantLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  restaurantLocation: {
    flex: 1,
    color: colors.muted,
    fontSize: 8,
  },
  restaurantTrailing: {
    alignItems: 'flex-end',
    gap: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 7,
    fontWeight: '900',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 11,
    backgroundColor: '#FFF5E5',
  },
  ratingStar: {
    color: '#E7A52C',
    fontSize: 11,
  },
  ratingValue: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '900',
  },
  ratingCount: {
    maxWidth: 62,
    color: colors.muted,
    fontSize: 7,
    textAlign: 'right',
  },
  memberPreview: {
    gap: 10,
    padding: 13,
    borderRadius: 18,
    backgroundColor: '#FFF8EE',
  },
  memberPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  memberPreviewTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  memberPreviewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  memberPreviewActionText: {
    color: '#617C3A',
    fontSize: 9,
    fontWeight: '900',
  },
  memberPreviewList: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 22,
  },
  memberPreviewItem: {
    width: 54,
    alignItems: 'center',
  },
  previewAvatarWrap: {
    position: 'relative',
  },
  previewAvatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DCCDC4',
    borderRadius: 21,
    backgroundColor: '#F4E1D8',
  },
  previewAvatarImage: {
    width: '100%',
    height: '100%',
  },
  previewAvatarText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  ownerCrown: {
    position: 'absolute',
    right: -2,
    bottom: -1,
    width: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF8EE',
    borderRadius: 9,
    backgroundColor: colors.primary,
  },
  previewName: {
    maxWidth: '100%',
    marginTop: 4,
    color: colors.text,
    fontSize: 8,
    fontWeight: '800',
  },
  previewOwner: {
    marginTop: 1,
    color: colors.primary,
    fontSize: 7,
    fontWeight: '800',
  },
  ownerStrip: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  ownerStripAvatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#FBE9E2',
  },
  ownerStripAvatarImage: {
    width: '100%',
    height: '100%',
  },
  ownerStripInitial: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  ownerStripText: {
    flex: 1,
    gap: 2,
  },
  ownerStripTitle: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  ownerStripAccent: {
    color: colors.primary,
    fontWeight: '900',
  },
  ownerStripSubtitle: {
    color: colors.muted,
    fontSize: 8,
  },
  emptyTab: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  emptyTabIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderRadius: 16,
    backgroundColor: '#FBE9E2',
  },
  emptyTabTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyTabText: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
