import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/auth-context';
import { resolveApiUrl } from '../../lib/api';
import { getCurrentUserProfileStats } from '../../services/profile-service';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { radii, shadows } from '../../theme/layout';
import type { UserProfileStats } from '../../types/profile';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type MenuRowProps = {
  description: string;
  icon: SymbolName;
  isLast?: boolean;
  label: string;
  onPress: () => void;
  tone?: 'neutral' | 'olive' | 'terracotta';
};

function MenuRow({
  description,
  icon,
  isLast = false,
  label,
  onPress,
  tone = 'neutral',
}: MenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        !isLast ? styles.menuRowBorder : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.menuIcon,
          tone === 'terracotta' ? styles.menuIconTerracotta : null,
          tone === 'olive' ? styles.menuIconOlive : null,
        ]}
      >
        <SymbolView
          name={icon}
          size={19}
          tintColor={tone === 'olive' ? colors.olive : colors.primary}
        />
      </View>

      <View style={styles.menuCopy}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.menuDescription}>{description}</Text>
      </View>

      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={17}
        tintColor={colors.muted}
      />
    </Pressable>
  );
}

function MenuSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.menuSectionWrap}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.menuSection}>{children}</View>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { accessToken, signOut, user } = useAuth();
  const [stats, setStats] = useState<UserProfileStats | null>(null);
  const [statsError, setStatsError] = useState(false);

  const loadStats = useCallback(async () => {
    if (!accessToken) {
      setStats(null);
      return;
    }

    try {
      setStatsError(false);
      setStats(await getCurrentUserProfileStats(accessToken));
    } catch {
      setStats(null);
      setStatsError(true);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadStats();
    }, [loadStats]),
  );

  const displayName = useMemo(() => user?.name?.trim() || 'Tu perfil', [user?.name]);
  const displayUsername = useMemo(
    () => user?.username?.trim() ? `@${user.username}` : '@usuario',
    [user?.username],
  );
  const userInitial = useMemo(() => displayName.charAt(0).toUpperCase(), [displayName]);
  const avatarUri = useMemo(
    () => user?.avatarUrl ? resolveApiUrl(user.avatarUrl) : null,
    [user?.avatarUrl],
  );

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  return (
    <SafeAreaView edges={['top', 'right', 'left']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Tu espacio</Text>
            <Text style={styles.headerTitle}>Perfil</Text>
          </View>
          <Pressable
            accessibilityLabel="Editar perfil"
            accessibilityRole="button"
            onPress={() => router.push('/profile-edit')}
            style={({ pressed }) => [styles.editButton, pressed ? styles.pressed : null]}
          >
            <SymbolView
              name={{ ios: 'square.and.pencil', android: 'edit', web: 'edit' }}
              size={17}
              tintColor={colors.primary}
            />
            <Text style={styles.editButtonText}>Editar</Text>
          </Pressable>
        </View>

        <View style={styles.profileHero}>
          <View style={[styles.decorativeCircle, styles.decorativeCircleLarge]} />
          <View style={[styles.decorativeCircle, styles.decorativeCircleSmall]} />

          <View style={styles.identityRow}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{userInitial}</Text>
              </View>
            )}

            <View style={styles.profileInfo}>
              <Text numberOfLines={1} style={styles.name}>{displayName}</Text>
              <Text numberOfLines={1} style={styles.username}>{displayUsername}</Text>
              <View style={styles.memberBadge}>
                <SymbolView
                  name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }}
                  size={13}
                  tintColor={colors.olive}
                />
                <Text style={styles.memberBadgeText}>Miembro de Mesa</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatItem label="Restaurantes" value={stats?.restaurantsCount ?? '—'} />
            <View style={styles.statDivider} />
            <StatItem label="Grupos" value={stats?.groupsCount ?? '—'} />
            <View style={styles.statDivider} />
            <StatItem label="Valoraciones" value={stats?.ratingsCount ?? '—'} />
          </View>

          {statsError ? (
            <Pressable accessibilityRole="button" onPress={() => void loadStats()}>
              <Text style={styles.statsErrorText}>No se han podido actualizar. Pulsa para reintentar.</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/group-invitations')}
          style={({ pressed }) => [styles.invitationShortcut, pressed ? styles.pressed : null]}
        >
          <View style={styles.invitationIcon}>
            <SymbolView
              name={{ ios: 'envelope.open.fill', android: 'mark_email_read', web: 'mark_email_read' }}
              size={20}
              tintColor={colors.primary}
            />
          </View>
          <View style={styles.invitationCopy}>
            <Text style={styles.invitationTitle}>Invitaciones y solicitudes</Text>
            <Text style={styles.invitationText}>Todo lo pendiente, en un mismo lugar</Text>
          </View>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={18}
            tintColor={colors.primary}
          />
        </Pressable>

        <MenuSection title="CUENTA">
          <MenuRow
            description="Nombre, usuario y foto"
            icon={{ ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }}
            label="Datos personales"
            onPress={() => router.push('/profile-edit')}
            tone="terracotta"
          />
          <MenuRow
            description="Correo, contraseña y seguridad"
            icon={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
            label="Ajustes de cuenta"
            onPress={() => router.push('/account-settings')}
          />
          <MenuRow
            description="Controla quién puede encontrarte"
            icon={{ ios: 'lock.shield.fill', android: 'shield', web: 'shield' }}
            isLast
            label="Privacidad"
            onPress={() => router.push('/privacy-settings')}
            tone="olive"
          />
        </MenuSection>

        <MenuSection title="PREFERENCIAS Y AYUDA">
          <MenuRow
            description="Elige qué avisos quieres recibir"
            icon={{ ios: 'bell.badge.fill', android: 'notifications', web: 'notifications' }}
            label="Notificaciones"
            onPress={() => router.push('/notification-settings')}
          />
          <MenuRow
            description="Preguntas frecuentes y contacto"
            icon={{ ios: 'questionmark.circle.fill', android: 'help', web: 'help' }}
            label="Ayuda y soporte"
            onPress={() => router.push('/help-support')}
            tone="olive"
          />
          <MenuRow
            description="Versión, proyecto y condiciones"
            icon={{ ios: 'info.circle.fill', android: 'info', web: 'info' }}
            isLast
            label="Acerca de Mesa"
            onPress={() => router.push('/about-mesa')}
          />
        </MenuSection>

        <Pressable
          accessibilityRole="button"
          onPress={() => void handleSignOut()}
          style={({ pressed }) => [styles.logoutButton, pressed ? styles.pressed : null]}
        >
          <SymbolView
            name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
            size={18}
            tintColor={colors.danger}
          />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
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
    gap: 22,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 118,
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  headerTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -0.8,
  },
  editButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  editButtonText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  profileHero: {
    position: 'relative',
    overflow: 'hidden',
    gap: 19,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EACCC1',
    borderRadius: radii.xl,
    backgroundColor: colors.primarySoft,
  },
  decorativeCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.58)',
    borderRadius: 999,
  },
  decorativeCircleLarge: {
    top: -74,
    right: -44,
    width: 190,
    height: 190,
  },
  decorativeCircleSmall: {
    top: -28,
    right: 20,
    width: 92,
    height: 92,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 78,
    height: 78,
    borderWidth: 3,
    borderColor: colors.surfaceElevated,
    borderRadius: 39,
    backgroundColor: colors.surfaceMuted,
  },
  avatarFallback: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surfaceElevated,
    borderRadius: 39,
    backgroundColor: colors.primary,
  },
  avatarFallbackText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 28,
  },
  profileInfo: {
    minWidth: 0,
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 19,
    letterSpacing: -0.35,
  },
  username: {
    color: colors.mutedStrong,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  memberBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  memberBadgeText: {
    color: colors.olive,
    fontFamily: fonts.semiBold,
    fontSize: 8,
  },
  statsRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.66)',
  },
  statItem: {
    minWidth: 0,
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  statLabel: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 8,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    backgroundColor: colors.borderStrong,
  },
  statsErrorText: {
    color: colors.danger,
    fontFamily: fonts.medium,
    fontSize: 9,
    textAlign: 'center',
  },
  invitationShortcut: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  invitationIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
  },
  invitationCopy: {
    flex: 1,
    gap: 3,
  },
  invitationTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  invitationText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
  },
  menuSectionWrap: {
    gap: 8,
  },
  sectionLabel: {
    marginLeft: 3,
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  menuSection: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  menuRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  menuRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  menuIconTerracotta: {
    backgroundColor: colors.primarySoft,
  },
  menuIconOlive: {
    backgroundColor: colors.oliveSoft,
  },
  menuCopy: {
    minWidth: 0,
    flex: 1,
    gap: 3,
  },
  menuLabel: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  menuDescription: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
  },
  logoutButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F0C8BE',
    borderRadius: radii.round,
    backgroundColor: colors.dangerSoft,
  },
  logoutText: {
    color: colors.danger,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.992 }],
  },
});
