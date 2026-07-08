import { SymbolView } from 'expo-symbols';
import type { ComponentProps, ReactNode } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
          <View style={[styles.fallbackOrb, styles.fallbackOrbOne]} />
          <View style={[styles.fallbackOrb, styles.fallbackOrbTwo]} />
          <View style={styles.fallbackIconCircle}>
            <SymbolView
              name={{
                ios: 'fork.knife',
                android: 'restaurant',
                web: 'restaurant',
              }}
              size={32}
              tintColor={colors.white}
            />
          </View>
          <Text style={styles.fallbackInitial}>
            {fallbackInitial}
          </Text>
        </View>
      )}

      <View style={styles.heroOverlay} />

      <View style={styles.heroNavigation}>
        <RoundIconButton
          accessibilityLabel="Volver"
          icon={{
            ios: 'chevron.left',
            android: 'arrow_back',
            web: 'arrow_back',
          }}
          onPress={onBack}
        />

        <View style={styles.heroNavigationRight}>
          <RoundIconButton
            accessibilityLabel="Compartir grupo"
            icon={{
              ios: 'square.and.arrow.up',
              android: 'share',
              web: 'share',
            }}
            onPress={onShare}
          />
          <RoundIconButton
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

type RoundIconButtonProps = {
  accessibilityLabel: string;
  icon: SymbolName;
  onPress: () => void;
};

function RoundIconButton({
  accessibilityLabel,
  icon,
  onPress,
}: RoundIconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.roundIconButton,
        pressed ? styles.pressed : null,
      ]}
    >
      <SymbolView
        name={icon}
        size={20}
        tintColor={colors.text}
      />
    </Pressable>
  );
}

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
  description,
}: GroupHeadingProps) {
  return (
    <View style={styles.heading}>
      <Text style={styles.groupTitle}>{title}</Text>

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
            size={15}
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
                size={16}
                tintColor={colors.primary}
              />
              <Text style={styles.cityText}>{city}</Text>
            </View>
          </>
        ) : null}
      </View>

      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
}

type StatKind =
  | 'restaurants'
  | 'members'
  | 'invitations'
  | 'collaborators'
  | 'followers';

type GroupStatProps = {
  kind: StatKind;
  value: number;
  label: string;
};

const statPresentation: Record<
  StatKind,
  {
    icon: SymbolName;
    tintColor: string;
  }
> = {
  restaurants: {
    icon: {
      ios: 'fork.knife',
      android: 'restaurant',
      web: 'restaurant',
    },
    tintColor: colors.primary,
  },
  members: {
    icon: {
      ios: 'person.2.fill',
      android: 'group',
      web: 'group',
    },
    tintColor: '#60783D',
  },
  invitations: {
    icon: {
      ios: 'envelope.fill',
      android: 'mail',
      web: 'mail',
    },
    tintColor: colors.primary,
  },
  collaborators: {
    icon: {
      ios: 'person.3.fill',
      android: 'groups',
      web: 'groups',
    },
    tintColor: '#60783D',
  },
  followers: {
    icon: {
      ios: 'person.2.wave.2.fill',
      android: 'diversity_1',
      web: 'diversity_1',
    },
    tintColor: colors.primary,
  },
};

export function GroupStat({
  kind,
  value,
  label,
}: GroupStatProps) {
  const presentation = statPresentation[kind];

  return (
    <View style={styles.statCard}>
      <SymbolView
        name={presentation.icon}
        size={20}
        tintColor={presentation.tintColor}
      />
      <View style={styles.statText}>
        <Text style={styles.statValue}>{value}</Text>
        <Text numberOfLines={1} style={styles.statLabel}>
          {label}
        </Text>
      </View>
    </View>
  );
}

type GroupTabsProps<T extends string> = {
  tabs: GroupDetailTab<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
};

export function GroupTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: GroupTabsProps<T>) {
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

type PrimaryGroupActionProps = {
  title: string;
  icon: SymbolName;
  onPress: () => void;
  outline?: boolean;
  loading?: boolean;
};

export function PrimaryGroupAction({
  title,
  icon,
  onPress,
  outline = false,
  loading = false,
}: PrimaryGroupActionProps) {
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
        size={19}
        tintColor={outline ? colors.primary : colors.white}
      />
      <Text
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

type GroupInfoBannerProps = {
  icon: SymbolName;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onPress?: () => void;
  tone?: 'warm' | 'green';
  trailing?: ReactNode;
};

export function GroupInfoBanner({
  icon,
  title,
  subtitle,
  actionLabel,
  onPress,
  tone = 'warm',
  trailing,
}: GroupInfoBannerProps) {
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
          size={20}
          tintColor={green ? '#60783D' : colors.primary}
        />
      </View>

      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoSubtitle}>{subtitle}</Text>
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
            size={16}
            tintColor={green ? '#60783D' : colors.primary}
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
    backgroundColor: string;
    textColor: string;
  }
> = {
  WANT_TO_GO: {
    label: 'Pendiente',
    backgroundColor: '#FFF0D9',
    textColor: '#A46B16',
  },
  VISITED: {
    label: 'Visitado',
    backgroundColor: '#E8EEDD',
    textColor: '#607349',
  },
  FAVORITE: {
    label: 'Favorito',
    backgroundColor: '#F9E1DC',
    textColor: colors.primary,
  },
  WANT_TO_REPEAT: {
    label: 'Repetir',
    backgroundColor: '#E8EEDD',
    textColor: '#607349',
  },
  DO_NOT_REPEAT: {
    label: 'No repetir',
    backgroundColor: '#FFF1EE',
    textColor: colors.danger,
  },
  ARCHIVED: {
    label: 'Archivado',
    backgroundColor: '#ECE8E6',
    textColor: colors.muted,
  },
};

const artworkPalettes = [
  ['#523A31', '#D7A987'],
  ['#6B4E3D', '#E6C6A8'],
  ['#365448', '#BDD0C4'],
  ['#7A4E3D', '#E4B7A5'],
  ['#485B3D', '#CFD6B8'],
];

function paletteForName(name: string): string[] {
  const code = Array.from(name).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return artworkPalettes[code % artworkPalettes.length];
}

type GroupRestaurantListCardProps = {
  item: GroupRestaurant;
  mode: 'private' | 'public';
  onPress: () => void;
};

export function GroupRestaurantListCard({
  item,
  mode,
  onPress,
}: GroupRestaurantListCardProps) {
  const location = [
    item.restaurant.address,
    item.restaurant.city,
  ]
    .filter(Boolean)
    .join(' · ');
  const average = item.averageScore == null
    ? null
    : item.averageScore.toFixed(1).replace('.', ',');
  const status = statusPresentation[item.status];
  const palette = paletteForName(item.restaurant.name);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.restaurantCard,
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.restaurantArtwork,
          { backgroundColor: palette[0] },
        ]}
      >
        <View
          style={[
            styles.restaurantArtworkGlow,
            { backgroundColor: palette[1] },
          ]}
        />
        <SymbolView
          name={{
            ios: 'fork.knife.circle.fill',
            android: 'restaurant',
            web: 'restaurant',
          }}
          size={27}
          tintColor={colors.white}
        />
      </View>

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
            size={13}
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
              { backgroundColor: status.backgroundColor },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: status.textColor },
              ]}
            >
              {status.label}
            </Text>
          </View>
        ) : null}

        <View style={styles.ratingPill}>
          <Text style={styles.ratingStar}>★</Text>
          <Text style={styles.ratingValue}>
            {average ?? '—'}
          </Text>
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
        size={17}
        tintColor={colors.muted}
      />
    </Pressable>
  );
}

type MemberPreviewProps = {
  members: GroupMember[];
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function MemberPreview({
  members,
  title,
  actionLabel,
  onAction,
}: MemberPreviewProps) {
  const previewMembers = members.slice(0, 5);

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
              size={15}
              tintColor="#60783D"
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
                      size={10}
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

type OwnerStripProps = {
  name: string;
  username: string;
  avatarUrl: string | null;
  onPress?: () => void;
};

export function OwnerStrip({
  name,
  username,
  avatarUrl,
  onPress,
}: OwnerStripProps) {
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
        size={17}
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
          size={24}
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
    height: 245,
    overflow: 'hidden',
    backgroundColor: '#6C4637',
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
  fallbackOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.42,
  },
  fallbackOrbOne: {
    width: 210,
    height: 210,
    top: -65,
    right: -35,
    backgroundColor: '#DFA47F',
  },
  fallbackOrbTwo: {
    width: 170,
    height: 170,
    bottom: -75,
    left: -25,
    backgroundColor: '#A8B792',
  },
  fallbackIconCircle: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  fallbackInitial: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24,16,12,0.18)',
  },
  heroNavigation: {
    position: 'absolute',
    top: 16,
    right: 18,
    left: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroNavigationRight: {
    flexDirection: 'row',
    gap: 10,
  },
  roundIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.93)',
    shadowColor: '#2B2421',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  heading: {
    gap: 9,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  metaDot: {
    color: colors.muted,
    fontSize: 13,
  },
  cityText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    backgroundColor: '#FFFCFA',
  },
  statText: {
    flex: 1,
    gap: 1,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '600',
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
    minHeight: 52,
    paddingHorizontal: 5,
  },
  tabText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  tabIndicator: {
    width: '100%',
    height: 2,
    marginTop: 13,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  tabIndicatorActive: {
    backgroundColor: colors.primary,
  },
  primaryAction: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  primaryActionOutline: {
    backgroundColor: colors.surface,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  primaryActionTextOutline: {
    color: colors.primary,
  },
  infoBanner: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 18,
    backgroundColor: '#FFF7EC',
  },
  infoBannerGreen: {
    backgroundColor: '#F1F3E9',
  },
  infoIcon: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFE5C2',
  },
  infoIconGreen: {
    backgroundColor: '#E0E9CF',
  },
  infoText: {
    flex: 1,
    gap: 3,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  infoSubtitle: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
  },
  infoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  infoActionText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  infoActionTextGreen: {
    color: '#60783D',
  },
  restaurantCard: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    backgroundColor: colors.surface,
  },
  restaurantArtwork: {
    position: 'relative',
    width: 88,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 15,
  },
  restaurantArtworkGlow: {
    position: 'absolute',
    width: 78,
    height: 78,
    top: -30,
    right: -24,
    borderRadius: 39,
    opacity: 0.62,
  },
  restaurantContent: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  restaurantName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  restaurantCategory: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  restaurantLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  restaurantLocation: {
    flex: 1,
    color: colors.muted,
    fontSize: 9,
  },
  restaurantTrailing: {
    alignItems: 'flex-end',
    gap: 7,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFF5E5',
  },
  ratingStar: {
    color: '#E7A52C',
    fontSize: 13,
  },
  ratingValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  ratingCount: {
    maxWidth: 70,
    color: colors.muted,
    fontSize: 7,
    textAlign: 'right',
  },
  memberPreview: {
    gap: 14,
    padding: 16,
    borderRadius: 20,
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
    fontSize: 13,
    fontWeight: '900',
  },
  memberPreviewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  memberPreviewActionText: {
    color: '#60783D',
    fontSize: 10,
    fontWeight: '900',
  },
  memberPreviewList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  memberPreviewItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  previewAvatarWrap: {
    position: 'relative',
  },
  previewAvatar: {
    width: 49,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DCCDC4',
    borderRadius: 25,
    backgroundColor: '#F4E1D8',
  },
  previewAvatarImage: {
    width: '100%',
    height: '100%',
  },
  previewAvatarText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  ownerCrown: {
    position: 'absolute',
    right: -2,
    bottom: -1,
    width: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF8EE',
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  previewName: {
    maxWidth: '100%',
    marginTop: 6,
    color: colors.text,
    fontSize: 9,
    fontWeight: '800',
  },
  previewOwner: {
    marginTop: 1,
    color: colors.primary,
    fontSize: 8,
    fontWeight: '800',
  },
  ownerStrip: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  ownerStripAvatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 21,
    backgroundColor: '#FBE9E2',
  },
  ownerStripAvatarImage: {
    width: '100%',
    height: '100%',
  },
  ownerStripInitial: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  ownerStripText: {
    flex: 1,
    gap: 3,
  },
  ownerStripTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  ownerStripAccent: {
    color: colors.primary,
    fontWeight: '900',
  },
  ownerStripSubtitle: {
    color: colors.muted,
    fontSize: 9,
  },
  emptyTab: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 34,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  emptyTabIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    borderRadius: 18,
    backgroundColor: '#FBE9E2',
  },
  emptyTabTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyTabText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
