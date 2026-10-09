import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useIsFocused } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator, Image, Keyboard, Pressable, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, View, useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, loginColors as palette } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii, spacing } from '../theme/layout';

export type GroupFilter = 'ALL' | 'PRIVATE' | 'PUBLIC';
export const groupFocusStyle = { outlineWidth: 2, outlineOffset: 2, outlineColor: palette.primary } as const;

export function GroupsPage({ children, refreshing, onRefresh }: {
  children: ReactNode; refreshing: boolean; onRefresh: () => void;
}) {
  const focused = useIsFocused();
  const tabHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.page}>
      {focused && <StatusBar style="dark" />}
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} colors={[palette.primary]} />}
        contentContainerStyle={[styles.content, {
          paddingHorizontal: width - insets.left - insets.right < 360 ? 20 : 24,
          paddingBottom: tabHeight + spacing.xl,
        }]}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function GroupsHeader({ explore = false, selecting = false, manual = false }: {
  explore?: boolean; selecting?: boolean; manual?: boolean;
}) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 380 || fontScale > 1.15;
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.header}>
      {selecting && (
        <Pressable accessibilityRole="button" accessibilityLabel="Volver"
          onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <SymbolView accessible={false} name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={22} tintColor={palette.text} />
          <Text style={styles.secondaryText}>Elegir grupo</Text>
        </Pressable>
      )}
      <View style={[styles.headingRow, stacked && styles.headingStacked]}>
        <Text accessibilityRole="header" style={styles.title}>
          {selecting ? '¿Dónde lo guardamos?' : explore ? 'Descubre grupos' : 'Mis grupos'}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Crear un nuevo grupo"
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onPress={() => router.push('/groups/create')}
          style={({ pressed }) => [styles.createButton, pressed && styles.createPressed, focused && groupFocusStyle]}>
          <SymbolView accessible={false} name={{ ios: 'plus', android: 'add', web: 'add' }} size={20} tintColor={colors.white} />
          <Text style={styles.createText}>Nuevo grupo</Text>
        </Pressable>
      </View>
      <View style={styles.introRow}>
        <Text style={styles.subtitle}>
          {selecting ? (manual ? 'Selecciona el grupo donde quieres crear el restaurante.' : 'Selecciona el grupo donde quieres añadir el restaurante.')
            : explore ? 'Encuentra listas públicas para tus próximos planes.' : 'Tus listas y los planes que compartís.'}
        </Text>
        {!explore && !selecting && width >= 360 && fontScale <= 1.15 && (
          <Image accessible={false} importantForAccessibility="no" resizeMode="contain"
            source={require('../../assets/images/groups-header-illustration.png')} style={styles.illustration} />
        )}
      </View>
    </View>
  );
}

export function GroupsTabs({ active }: { active: 'mine' | 'explore' }) {
  return (
    <View accessibilityRole="tablist" style={styles.tabs}>
      {(['mine', 'explore'] as const).map(tab => (
        <Pressable key={tab} accessibilityRole="tab" accessibilityState={{ selected: active === tab }}
          aria-selected={active === tab}
          onPress={() => {
            Keyboard.dismiss();
            if (tab !== active) {
              tab === 'mine' ? router.dismissTo('/groups') : router.navigate('/groups/explore');
            }
          }}
          style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
          <Text style={[styles.tabText, active === tab && styles.tabActive]}>{tab === 'mine' ? 'Mis grupos' : 'Explorar'}</Text>
          {active === tab && <View style={styles.indicator} />}
        </Pressable>
      ))}
    </View>
  );
}

export function GroupsSearch({ query, onChange, explore = false, filter, onFilterChange }: {
  query: string; onChange: (value: string) => void; explore?: boolean;
  filter?: GroupFilter; onFilterChange?: (value: GroupFilter) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const filterLabel = filter === 'PRIVATE' ? 'Privados' : 'Públicos';
  return (
    <View style={styles.searchBlock}>
      <View style={[styles.search, focused && styles.searchFocused]}>
        <SymbolView accessible={false} name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={22} tintColor={palette.muted} />
        <TextInput accessibilityLabel={explore ? 'Buscar grupos, creadores o ciudades' : 'Buscar grupos por nombre o ciudad'}
          value={query} onChangeText={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          autoCapitalize="none" autoCorrect={false} returnKeyType="search" onSubmitEditing={Keyboard.dismiss}
          placeholder={explore ? 'Buscar grupos o creadores' : 'Buscar nombre o ciudad'} placeholderTextColor={palette.muted}
          style={styles.searchInput} />
        {query.length > 0 && (
          <Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => onChange('')} style={styles.iconButton}>
            <SymbolView accessible={false} name={{ ios: 'xmark', android: 'close', web: 'close' }} size={20} tintColor={palette.muted} />
          </Pressable>
        )}
        {onFilterChange && (
          <Pressable accessibilityRole="button" accessibilityLabel={filter === 'ALL' ? 'Filtrar grupos' : `Filtrar grupos. Filtro actual: ${filterLabel}`}
            accessibilityState={{ expanded }} aria-expanded={expanded} onPress={() => setExpanded(value => !value)}
            style={({ pressed }) => [styles.iconButton, filter !== 'ALL' && styles.filterActive, pressed && styles.pressed]}>
            <SymbolView accessible={false} name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }} size={22} tintColor={palette.primary} />
          </Pressable>
        )}
      </View>
      {expanded && onFilterChange && (
        <View style={styles.filters}>
          {([['ALL', 'Todos'], ['PRIVATE', 'Privados'], ['PUBLIC', 'Públicos']] as const).map(([value, label]) => (
            <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: filter === value }}
              aria-checked={filter === value}
              onPress={() => onFilterChange(value)} style={({ pressed }) => [styles.filter, filter === value && styles.filterActive, pressed && styles.pressed]}>
              <Text style={[styles.filterText, filter === value && styles.tabActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {!expanded && filter && filter !== 'ALL' && onFilterChange && (
        <Pressable accessibilityRole="button" accessibilityLabel={`Quitar filtro ${filterLabel}`}
          onPress={() => onFilterChange('ALL')} style={styles.activeFilter}>
          <Text style={styles.secondaryText}>{filterLabel}</Text>
          <SymbolView accessible={false} name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} tintColor={palette.primary} />
        </Pressable>
      )}
    </View>
  );
}

export function GroupsSection({ title, count, description, children }: {
  title: string; count: number; description?: string; children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.count}>{count} {count === 1 ? 'grupo' : 'grupos'}</Text>
      </View>
      {description && <Text style={styles.subtitle}>{description}</Text>}
      <View style={styles.list}>{children}</View>
    </View>
  );
}

export function GroupsMessage({ title, message, action, onAction, busy = false, error = false, children }: {
  title: string; message: string; action?: string; onAction?: () => void;
  busy?: boolean; error?: boolean; children?: ReactNode;
}) {
  return (
    <View accessibilityLiveRegion="polite" style={[styles.message, error && styles.error]}>
      <Text accessibilityRole="header" style={styles.messageTitle}>{title}</Text>
      <Text style={styles.subtitle}>{message}</Text>
      {children}
      {action && onAction && <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy, busy }}
        disabled={busy} onPress={onAction} style={({ pressed }) => [styles.messageAction, pressed && styles.pressed]}>
        <Text style={styles.secondaryText}>{busy ? 'Actualizando…' : action}</Text>
      </Pressable>}
    </View>
  );
}

export function GroupsLoading() {
  return (
    <View style={styles.loading} accessibilityLiveRegion="polite" accessibilityState={{ busy: true }}>
      <ActivityIndicator color={palette.primary} />
      <Text style={styles.subtitle}>Cargando grupos…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.surface
  },
  content: {
    flexGrow: 1,
    gap: spacing.xl,
    paddingTop: spacing.md
  },
  header: { gap: spacing.sm },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm
  },
  headingStacked: { flexDirection: 'column' },
  title: {
    flexShrink: 1,
    flexGrow: 1,
    color: palette.text,
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 35,
    letterSpacing: -0.5
  },
  createButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: palette.primary
  },
  createPressed: { backgroundColor: palette.primaryPressed },
  createText: {
    flexShrink: 1,
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20
  },
  introRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  subtitle: {
    flexShrink: 1,
    color: palette.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23
  },
  illustration: {
    width: 108,
    height: 72
  },
  back: {
    minHeight: 48,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong
  },
  tab: {
    flex: 1,
    minHeight: 52,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabText: {
    color: palette.muted,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center'
  },
  tabActive: {
    color: palette.primary,
    fontFamily: fonts.semiBold
  },
  indicator: {
    position: 'absolute',
    bottom: -1,
    width: 56,
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.primary
  },
  searchBlock: { gap: spacing.xs },
  search: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    padding: 1,
    paddingLeft: 13,
    borderColor: palette.inputBorder,
    borderRadius: radii.md,
    backgroundColor: colors.white
  },
  searchFocused: {
    borderWidth: 2,
    padding: 0,
    paddingLeft: 12,
    borderColor: palette.primary
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    paddingVertical: spacing.sm,
    color: palette.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  filter: {
    flexGrow: 1,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white
  },
  filterText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: palette.muted
  },
  filterActive: { backgroundColor: colors.primarySoft },
  activeFilter: {
    minHeight: 48,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft
  },
  section: { gap: spacing.sm },
  sectionHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs
  },
  sectionTitle: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 28,
    color: palette.text
  },
  count: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: palette.muted
  },
  list: { gap: spacing.sm },
  message: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    gap: spacing.sm,
    backgroundColor: colors.white
  },
  error: { backgroundColor: colors.dangerSoft },
  messageTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 19,
    lineHeight: 27,
    color: palette.text
  },
  messageAction: {
    minHeight: 48,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    justifyContent: 'center'
  },
  secondaryText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 23,
    color: palette.primary
  },
  loading: {
    paddingVertical: spacing.section,
    alignItems: 'center',
    gap: spacing.sm
  },
  pressed: { opacity: 0.75 },
});
