import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Image, Platform, Pressable, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { homeStyles as styles } from './HomeDashboardStyles';
import { HomeQuickActionCardRefined } from './HomeQuickActionCardRefined';
import { NotificationBellButton } from './NotificationBellButton';

function HomeTableIllustration() {
  return (
    <Image
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      source={require('../../assets/images/home-header-table.png')}
      style={styles.illustration}
    />
  );
}

export function HomeHeader({
  avatarUri,
  pendingInvitationCount,
  topInset,
  userName,
  userInitial,
}: {
  avatarUri: string | null;
  pendingInvitationCount: number;
  topInset: number;
  userName: string;
  userInitial: string;
}) {
  return (
    <View style={styles.header}>
      <LinearGradient
        colors={[colors.brandStart, colors.brandEnd]}
        end={{ x: 0.95, y: 1 }}
        start={{ x: 0.05, y: 0 }}
        style={[
          styles.heroBackground,
          {
            height: topInset + 187,
            paddingTop: topInset,
          },
        ]}
      >
        <View style={styles.topBar}>
          <Text allowFontScaling={false} style={styles.brand}>Mesa</Text>

          <View style={styles.topActions}>
            <NotificationBellButton variant="hero" />
            <Pressable
              accessibilityLabel="Abrir perfil"
              accessibilityRole="button"
              onPress={() => router.push('/profile')}
              style={({ pressed }) => [
                styles.avatarButton,
                pressed ? styles.pressed : null,
              ]}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text allowFontScaling={false} style={styles.avatarInitial}>
                  {userInitial}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <Text allowFontScaling={false} style={styles.greeting}>Hola, {userName}</Text>
          <Text allowFontScaling={false} style={styles.title}>¿Qué te apetece hoy?</Text>
          <Text allowFontScaling={false} style={styles.subtitle}>
            Encuentra, comparte y decide con los tuyos.
          </Text>
        </View>

        <HomeTableIllustration />
      </LinearGradient>

      <View style={styles.headerControls}>
        <Pressable
          accessibilityLabel="Buscar restaurantes"
          accessibilityRole="button"
          onPress={() => router.push('/map')}
          style={({ pressed }) => [
            styles.searchBar,
            pressed ? styles.pressed : null,
          ]}
        >
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={Platform.OS === 'android' ? 24 : 22}
            tintColor="#706965"
          />
          <Text allowFontScaling={false} numberOfLines={1} style={styles.searchText}>
            Busca restaurantes, cocinas o lugares
          </Text>
        </Pressable>

        <View style={styles.quickActions}>
          <HomeQuickActionCardRefined
            icon={{ ios: 'person.badge.plus', android: 'person_add', web: 'person_add' }}
            onPress={() => router.push('/groups/create')}
            subtitle="Organiza un plan"
            title="Crear grupo"
          />
          <HomeQuickActionCardRefined
            badge={pendingInvitationCount}
            icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
            onPress={() => router.push('/group-invitations')}
            subtitle="Revisa las pendientes"
            title="Invitaciones"
            tone="sage"
          />
        </View>
      </View>
    </View>
  );
}
