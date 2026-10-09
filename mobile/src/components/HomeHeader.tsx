import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';

import { homeFocusStyle, homeStyles as styles } from './HomeDashboardStyles';
import { HomeQuickActionCardRefined } from './HomeQuickActionCardRefined';
import { NotificationBellButton } from './NotificationBellButton';
import { loginColors as homeColors } from '../theme/colors';

export function HomeHeader({ avatarUri, pendingInvitationCount, topInset, userName, userInitial, gutter, showQuickActions }: {
  avatarUri: string | null;
  pendingInvitationCount: number | null;
  topInset: number;
  userName: string;
  userInitial: string;
  gutter: number;
  showQuickActions: boolean;
}) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 380 || fontScale > 1.15;
  const [focused, setFocused] = useState<'profile' | 'search' | null>(null);
  const invitationsSubtitle = pendingInvitationCount === null ? 'Ver invitaciones'
    : pendingInvitationCount === 0 ? 'Sin pendientes'
      : `${pendingInvitationCount} ${pendingInvitationCount === 1 ? 'pendiente' : 'pendientes'}`;

  return (
    <View style={styles.header}>
      <View style={[styles.heroBackground, { paddingTop: topInset + 8, paddingHorizontal: gutter }]}>
        <View style={styles.topBar}>
          <Text allowFontScaling={false} style={styles.brand}>Mesa</Text>
          <View style={styles.topActions}>
            <NotificationBellButton variant="hero" />
            <Pressable accessibilityLabel="Abrir perfil" accessibilityRole="button"
              onFocus={() => setFocused('profile')} onBlur={() => setFocused(null)}
              onPress={() => router.push('/profile')}
              style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed, focused === 'profile' && { ...homeFocusStyle, outlineColor: homeColors.cream }]}>
              {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                : <Text allowFontScaling={false} style={styles.avatarInitial}>{userInitial}</Text>}
            </Pressable>
          </View>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.greeting}>Hola, {userName}</Text>
          <Text accessibilityRole="header" style={styles.title}>¿Qué te apetece hoy?</Text>
          <Text style={styles.subtitle}>Encuentra y comparte con los tuyos.</Text>
        </View>
        {width >= 360 && fontScale <= 1.2 && (
          <Image accessible={false} importantForAccessibility="no" resizeMode="contain"
            source={require('../../assets/images/home-header-table.png')} style={styles.illustration} />
        )}
      </View>
      <View style={[styles.headerControls, { paddingHorizontal: gutter }]}>
        <Pressable accessibilityLabel="Buscar en el mapa" accessibilityRole="button"
          onFocus={() => setFocused('search')} onBlur={() => setFocused(null)}
          onPress={() => router.push('/map')}
          style={({ pressed }) => [styles.searchBar, pressed && styles.pressed, focused === 'search' && homeFocusStyle]}>
          <SymbolView accessible={false} name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={24} tintColor={homeColors.muted} />
          <Text style={styles.searchText}>Buscar en el mapa</Text>
        </Pressable>
        {showQuickActions && (
          <View style={[styles.quickActions, stacked && styles.stacked]}>
            <HomeQuickActionCardRefined icon={{ ios: 'person.badge.plus', android: 'person_add', web: 'person_add' }}
              stacked={stacked} onPress={() => router.push('/groups/create')} subtitle="Organiza un plan" title="Crear grupo" />
            <HomeQuickActionCardRefined icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
              stacked={stacked} onPress={() => router.push('/group-invitations')} subtitle={invitationsSubtitle} title="Invitaciones" tone="sage" />
          </View>
        )}
      </View>
    </View>
  );
}
