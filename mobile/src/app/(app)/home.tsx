import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/auth-context';
import { colors } from '../../theme/colors';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  const userInitial =
    user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              Hola, {user?.name} 👋
            </Text>

            <Text style={styles.subtitle}>
              ¿Qué os apetece descubrir hoy?
            </Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userInitial}
            </Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>
            TU PRÓXIMO PLAN
          </Text>

          <Text style={styles.heroTitle}>
            Empieza creando vuestro primer grupo
          </Text>

          <Text style={styles.heroDescription}>
            Después podréis guardar restaurantes,
            puntuarlos y decidir dónde ir.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Sesión conectada correctamente
          </Text>

          <Text style={styles.cardText}>
            El registro, el login y la recuperación de tu
            perfil ya funcionan contra Spring Boot.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed ? styles.logoutButtonPressed : null,
          ]}
        >
          <Text style={styles.logoutText}>
            Cerrar sesión
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    gap: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 15,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  hero: {
    gap: 10,
    borderRadius: 24,
    backgroundColor: colors.primary,
    padding: 24,
  },
  heroEyebrow: {
    color: '#FFE2D8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  heroDescription: {
    color: '#FFF1EC',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 20,
  },
  cardTitle: {
    color: colors.success,
    fontSize: 17,
    fontWeight: '700',
  },
  cardText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 'auto',
    borderRadius: 16,
  },
  logoutButtonPressed: {
    backgroundColor: '#FCE8E3',
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});