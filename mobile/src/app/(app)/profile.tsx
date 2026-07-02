import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
  ComponentProps,
} from 'react';
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

type SymbolName =
  ComponentProps<typeof SymbolView>['name'];

type ProfileOptionProps = {
  icon: SymbolName;
  label: string;
};

function ProfileOption({
  icon,
  label,
}: ProfileOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.option,
        pressed
          ? styles.optionPressed
          : null,
      ]}
    >
      <View style={styles.optionIcon}>
        <SymbolView
          name={icon}
          size={21}
          tintColor={colors.text}
        />
      </View>

      <Text style={styles.optionLabel}>
        {label}
      </Text>

      <SymbolView
        name={{
          ios: 'chevron.right',
          android: 'chevron_right',
          web: 'chevron_right',
        }}
        size={19}
        tintColor={colors.muted}
      />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const {
    user,
    signOut,
  } = useAuth();

  const userInitial =
    user?.name?.charAt(0).toUpperCase() ?? '?';

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Perfil
        </Text>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userInitial}
            </Text>
          </View>

          <View style={styles.userData}>
            <Text style={styles.userName}>
              {user?.name}
            </Text>

            <Text style={styles.username}>
              @{user?.username}
            </Text>

            <Text style={styles.email}>
              {user?.email}
            </Text>
          </View>
        </View>

        <View style={styles.options}>
          <ProfileOption
            icon={{
              ios: 'person.crop.circle',
              android: 'manage_accounts',
              web: 'manage_accounts',
            }}
            label="Editar perfil"
          />

          <ProfileOption
            icon={{
              ios: 'bell',
              android: 'notifications',
              web: 'notifications',
            }}
            label="Notificaciones"
          />

          <ProfileOption
            icon={{
              ios: 'gearshape',
              android: 'settings',
              web: 'settings',
            }}
            label="Ajustes"
          />

          <ProfileOption
            icon={{
              ios: 'questionmark.circle',
              android: 'help',
              web: 'help',
            }}
            label="Ayuda"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handleSignOut();
          }}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed
              ? styles.logoutButtonPressed
              : null,
          ]}
        >
          <SymbolView
            name={{
              ios: 'rectangle.portrait.and.arrow.right',
              android: 'logout',
              web: 'logout',
            }}
            size={21}
            tintColor={colors.danger}
          />

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
    gap: 25,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 34,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 19,
  },
  avatar: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: colors.white,
    fontSize: 29,
    fontWeight: '800',
  },
  userData: {
    flex: 1,
    gap: 3,
  },
  userName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  username: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  email: {
    color: colors.muted,
    fontSize: 13,
  },
  options: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  option: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
  },
  optionPressed: {
    backgroundColor: '#FFF2ED',
  },
  optionIcon: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#F7EEE9',
  },
  optionLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: '#F0C7BE',
    borderRadius: 27,
    backgroundColor: '#FFF1EE',
  },
  logoutButtonPressed: {
    opacity: 0.7,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});