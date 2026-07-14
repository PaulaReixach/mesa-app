import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Image, Platform, Pressable, Text, View } from 'react-native';

import { homeStyles as styles } from './HomeDashboardStyles';
import { HomeQuickActionCardRefined } from './HomeQuickActionCardRefined';
import { NotificationBellButton } from './NotificationBellButton';

const homeTableIllustrationSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 176 180">
    <g
      fill="none"
      stroke="#F8C9AD"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-opacity="0.78"
      stroke-width="1.55"
    >
      <ellipse cx="129" cy="112" rx="82" ry="58" transform="rotate(8 129 112)" />
      <ellipse cx="129" cy="112" rx="63" ry="42" transform="rotate(8 129 112)" />

      <path d="M134 4c4 18 2 39-5 57-3 8-7 16-12 24" />
      <path d="M134 19c-8-6-10-13-5-19 7 5 9 12 5 19Z" />
      <path d="M132 35c8-8 15-9 20-5-5 9-12 11-20 5Z" />
      <path d="M128 48c-10-5-16-3-19 2 7 7 14 7 19-2Z" />
      <path d="M124 62c8-7 15-7 19-2-6 8-12 9-19 2Z" />
      <path d="M120 75c-9-4-15-2-18 3 7 6 13 5 18-3Z" />

      <path d="M49 69 66 94c3 5 6 8 12 11l72 66" />
      <path d="m55 66 17 25" />
      <path d="m61 64 17 24" />
      <path d="m67 63 16 23" />
      <path d="M67 63c2 12 6 22 14 29l76 69" />
      <path d="M150 171c3 3 6 2 8-1l2-3c2-3 1-5-3-6" />
    </g>
  </svg>
`;

const homeTableIllustrationUri = `data:image/svg+xml;utf8,${encodeURIComponent(
  homeTableIllustrationSvg,
)}`;

function HomeTableIllustration() {
  return (
    <ExpoImage
      accessibilityIgnoresInvertColors
      contentFit="contain"
      pointerEvents="none"
      source={{ uri: homeTableIllustrationUri }}
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
        colors={['#C74A2D', '#B83B25']}
        end={{ x: 0.95, y: 1 }}
        start={{ x: 0.05, y: 0 }}
        style={[
          styles.heroBackground,
          {
            height: topInset + 214,
            paddingTop: topInset + 18,
          },
        ]}
      >
        <View style={styles.topBar}>
          <Text style={styles.brand}>Mesa</Text>

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
                <Text style={styles.avatarInitial}>{userInitial}</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.greeting}>Hola, {userName}</Text>
          <Text style={styles.title}>¿Qué te apetece hoy?</Text>
          <Text style={styles.subtitle}>
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
          <Text numberOfLines={1} style={styles.searchText}>
            Busca restaurantes, cocinas o lugares
          </Text>
        </Pressable>

        <View style={styles.quickActions}>
          <HomeQuickActionCardRefined
            icon={{ ios: 'person.badge.plus', android: 'group_add', web: 'group_add' }}
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
