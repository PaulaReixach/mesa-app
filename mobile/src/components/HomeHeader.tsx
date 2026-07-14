import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

import { homeStyles as styles } from './HomeDashboardStyles';
import { HomeQuickActionCardRefined } from './HomeQuickActionCardRefined';
import { refinedHomeStyles as refined } from './HomeRefinedStyles';
import { NotificationBellButton } from './NotificationBellButton';
import { colors } from '../theme/colors';

export function HomeHeader({
  avatarUri,
  pendingInvitationCount,
  userName,
  userInitial,
}: {
  avatarUri: string | null;
  pendingInvitationCount: number;
  userName: string;
  userInitial: string;
}) {
  return (
    <>
      <View style={styles.topBar}>
        <Text style={[styles.brand, refined.brand]}>Mesa</Text>

        <View style={[styles.topActions, refined.topActions]}>
          <NotificationBellButton />
          <Pressable
            accessibilityLabel="Abrir perfil"
            accessibilityRole="button"
            onPress={() => router.push('/profile')}
            style={({ pressed }) => [
              styles.avatarButton,
              refined.avatarButton,
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

      <View style={[styles.hero, refined.hero]}>
        <Text style={styles.greeting}>Hola, {userName}</Text>
        <Text style={[styles.title, refined.title]}>¿Qué te apetece hoy?</Text>
        <Text style={[styles.subtitle, refined.subtitle]}>
          Guarda ideas, compara opiniones y convierte el “ya veremos” en un plan.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/map')}
        style={({ pressed }) => [
          styles.searchBar,
          refined.searchBar,
          pressed ? styles.pressed : null,
        ]}
      >
        <SymbolView
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          size={18}
          tintColor={colors.muted}
        />
        <Text style={[styles.searchText, refined.searchText]}>
          Busca restaurantes, cocinas o ubicaciones
        </Text>
      </Pressable>

      <View style={[styles.quickActions, refined.quickActions]}>
        <HomeQuickActionCardRefined
          icon={{ ios: 'person.2.fill', android: 'group_add', web: 'group_add' }}
          onPress={() => router.push('/groups/create')}
          subtitle="Organiza una lista con tu gente"
          title="Crear grupo"
        />
        <HomeQuickActionCardRefined
          badge={pendingInvitationCount}
          icon={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
          onPress={() => router.push('/group-invitations')}
          subtitle={pendingInvitationCount > 0
            ? `Tienes ${pendingInvitationCount} pendientes`
            : 'Todo al día por aquí'}
          title="Invitaciones"
          tone="sage"
        />
      </View>
    </>
  );
}
