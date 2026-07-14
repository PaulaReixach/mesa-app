import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Image, Platform, Pressable, Text, View } from 'react-native';

import { homeStyles as styles } from './HomeDashboardStyles';
import { HomeQuickActionCardRefined } from './HomeQuickActionCardRefined';
import { NotificationBellButton } from './NotificationBellButton';

function HomeTableIllustration() {
  return (
    <View pointerEvents="none" style={styles.illustration}>
      <View style={styles.illustrationPlateOuter} />
      <View style={styles.illustrationPlateInner} />

      <View style={styles.illustrationFork}>
        <View style={styles.illustrationForkHandle} />
        <View style={[styles.illustrationForkTine, styles.illustrationForkTineOne]} />
        <View style={[styles.illustrationForkTine, styles.illustrationForkTineTwo]} />
        <View style={[styles.illustrationForkTine, styles.illustrationForkTineThree]} />
        <View style={[styles.illustrationForkTine, styles.illustrationForkTineFour]} />
      </View>

      <View style={styles.illustrationSprig}>
        <View style={styles.illustrationStem} />
        <View style={[styles.illustrationLeaf, styles.illustrationLeafOne]} />
        <View style={[styles.illustrationLeaf, styles.illustrationLeafTwo]} />
        <View style={[styles.illustrationLeaf, styles.illustrationLeafThree]} />
        <View style={[styles.illustrationLeaf, styles.illustrationLeafFour]} />
      </View>
    </View>
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
