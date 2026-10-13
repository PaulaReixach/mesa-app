import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';

import { NotificationBellButton } from './NotificationBellButton';
import { AppText } from './ui/AppText';
import { Avatar } from './ui/Avatar';
import { createThemedStyles, fonts, space, touchTarget, useTheme } from '../theme';

const symbol = require('../../assets/images/brand/symbol.svg');
const wordmark = require('../../assets/images/brand/wordmark.svg');

/** Inicio v2 top bar: logo on the left; bell and profile on the right. */
export function HomeTopBar({ avatarUri, userName }: { avatarUri: string | null; userName: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.bar}>
      <View style={styles.logo} accessible accessibilityRole="image" accessibilityLabel="Mesa">
        <Image source={symbol} style={styles.symbol} contentFit="contain" />
        <Image source={wordmark} style={styles.wordmark} contentFit="contain" tintColor={colors.textPrimary} />
      </View>
      <View style={styles.actions}>
        <NotificationBellButton />
        <Pressable accessibilityLabel="Tu perfil" accessibilityRole="button" onPress={() => router.push('/profile')}
          style={styles.profile}>
          <Avatar name={userName || 'Tú'} uri={avatarUri} size={34} />
        </Pressable>
      </View>
    </View>
  );
}

/** Search trigger pill and, when there is more than one city, the city chip. */
export function HomeSearchRow({ city, canChangeCity, onCityPress }: {
  city: string | null;
  canChangeCity: boolean;
  onCityPress: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.searchRow}>
      <Pressable accessibilityRole="search" accessibilityLabel="Busca sitios o grupos" onPress={() => router.push('/map')}
        style={({ pressed }) => [styles.search, pressed && styles.pressed]}>
        <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={18}
          tintColor={colors.textSecondary} />
        <AppText style={styles.searchText} numberOfLines={1}>Busca sitios o grupos</AppText>
      </Pressable>
      {city && (
        <Pressable accessibilityRole="button" disabled={!canChangeCity} onPress={onCityPress}
          accessibilityLabel={canChangeCity ? `Ciudad: ${city}. Cambiar` : `Ciudad: ${city}`}
          style={({ pressed }) => [styles.city, pressed && styles.pressed]}>
          <SymbolView name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }} size={16}
            tintColor={colors.onSecondarySoft} />
          <AppText style={styles.cityText} numberOfLines={1}>{city}</AppText>
          <SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} size={13}
            tintColor={colors.onSecondarySoft} />
        </Pressable>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  bar: { height: touchTarget, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  symbol: { width: 17, height: 19 },
  wordmark: { width: 64, height: 20 },
  actions: { flexDirection: 'row', alignItems: 'center', marginRight: -space.s2 },
  profile: { width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', gap: space.s2 },
  search: {
    flex: 1, height: 46, borderRadius: 23, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: space.s4, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  searchText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, flexShrink: 1 },
  city: {
    height: 46, maxWidth: 150, borderRadius: 23, flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingLeft: space.s3, paddingRight: 14, backgroundColor: colors.secondarySoft,
  },
  cityText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.onSecondarySoft, flexShrink: 1 },
  pressed: { opacity: 0.8 },
}));
