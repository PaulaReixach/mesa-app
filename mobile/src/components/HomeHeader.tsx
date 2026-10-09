import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';

import { NotificationBellButton } from './NotificationBellButton';
import { AppText } from './ui/AppText';
import { Avatar } from './ui/Avatar';
import { createThemedStyles, iconSize, radius, space, touchTarget, useTheme } from '../theme';

const wordmark = require('../../assets/images/brand/wordmark.svg');

/** Prototype header: bell left, "mesa" wordmark centred, profile right. */
export function HomeTopBar({ avatarUri, userName }: { avatarUri: string | null; userName: string }) {
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.topBar}>
      <NotificationBellButton />
      <Image source={wordmark} accessibilityLabel="Mesa" accessibilityRole="image" contentFit="contain"
        tintColor={colors.textPrimary} style={styles.wordmark} />
      <Pressable accessibilityLabel="Abrir perfil" accessibilityRole="button" onPress={() => router.push('/profile')}
        android_ripple={{ color: colors.overlay, borderless: true, radius: touchTarget / 2 }}
        style={({ pressed }) => [styles.avatarButton, pressed && Platform.OS === 'ios' && styles.pressed]}>
        <Avatar name={userName} uri={avatarUri} size={32} />
      </Pressable>
    </View>
  );
}

/** "¿Dónde nos sentamos hoy? 📍 Girona ▾". With one city it is plain text. */
export function HomeCityLine({ city, canChange, onPress }: { city: string; canChange: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const content = (
    <>
      <SymbolView accessible={false} name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
        size={iconSize.inline} tintColor={colors.secondary} />
      <AppText variant="secondaryStrong" tone="olive">{city}</AppText>
      {canChange && (
        <SymbolView accessible={false} name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          size={iconSize.inline} tintColor={colors.secondary} />
      )}
    </>
  );

  return (
    <View style={styles.cityLine}>
      <AppText variant="body" tone="muted">¿Dónde nos sentamos hoy?</AppText>
      {canChange ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Ciudad: ${city}. Cambiar ciudad`} onPress={onPress}
          style={({ pressed }) => [styles.cityButton, pressed && styles.pressed]}>
          {content}
        </Pressable>
      ) : (
        <View style={styles.cityButton} accessible accessibilityLabel={`Ciudad: ${city}`}>{content}</View>
      )}
    </View>
  );
}

/** Search trigger styled as in the prototype. Opens the map, which searches restaurants. */
export function HomeSearchTrigger() {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Buscar restaurantes en el mapa"
      onPress={() => router.push('/map')}
      android_ripple={{ color: colors.overlay, foreground: true }}
      style={({ pressed }) => [styles.search, pressed && Platform.OS === 'ios' && styles.searchPressed]}>
      <SymbolView accessible={false} name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        size={iconSize.search} tintColor={colors.secondary} />
      <AppText variant="body" tone="muted" numberOfLines={1} style={styles.flex}>Buscar restaurantes</AppText>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  flex: { flex: 1 },
  topBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -space.s2,
  },
  // Wordmark viewBox is 297 × 106.
  wordmark: { width: 76, height: 27 },
  avatarButton: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: touchTarget / 2,
  },
  pressed: { opacity: 0.6 },
  cityLine: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: space.s1 },
  cityButton: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    paddingHorizontal: space.s1,
  },
  search: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: space.s3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
  },
  searchPressed: { backgroundColor: colors.surfaceSecondary },
}));
