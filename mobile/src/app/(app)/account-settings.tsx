import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
  ComponentProps,
  ReactNode,
  useMemo,
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
import { fonts } from '../../theme/fonts';
import { radii, shadows } from '../../theme/layout';

type SymbolName =
  ComponentProps<typeof SymbolView>['name'];

type SettingRowProps = {
  icon: SymbolName;
  title: string;
  subtitle?: string;
  value?: string;
  danger?: boolean;
  isLast?: boolean;
  onPress?: () => void;
};

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({
  title,
  children,
}: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  value,
  danger = false,
  isLast = false,
  onPress,
}: SettingRowProps) {
  return (
    <Pressable
      accessibilityRole={
        onPress
          ? 'button'
          : undefined
      }
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        !isLast
          ? styles.settingRowBorder
          : null,
        pressed && onPress
          ? styles.settingRowPressed
          : null,
      ]}
    >
      <View
        style={[
          styles.settingIcon,
          danger
            ? styles.settingIconDanger
            : null,
        ]}
      >
        <SymbolView
          name={icon}
          size={19}
          tintColor={
            danger
              ? colors.danger
              : colors.text
          }
        />
      </View>

      <View style={styles.settingText}>
        <Text
          numberOfLines={1}
          style={[
            styles.settingTitle,
            danger
              ? styles.settingTitleDanger
              : null,
          ]}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            numberOfLines={2}
            style={styles.settingSubtitle}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text
          numberOfLines={1}
          style={styles.settingValue}
        >
          {value}
        </Text>
      ) : null}

      {onPress ? (
        <SymbolView
          name={{
            ios: 'chevron.right',
            android: 'chevron_right',
            web: 'chevron_right',
          }}
          size={17}
          tintColor={colors.muted}
        />
      ) : null}
    </Pressable>
  );
}

export default function AccountSettingsScreen() {
  const { user } = useAuth();

  const memberSince = useMemo(() => {
    if (!user?.createdAt) {
      return '—';
    }

    const createdAt =
      new Date(user.createdAt);

    if (
      Number.isNaN(
        createdAt.getTime(),
      )
    ) {
      return '—';
    }

    return createdAt.toLocaleDateString(
      'es-ES',
      {
        month: 'short',
        year: 'numeric',
      },
    );
  }, [user?.createdAt]);

  return (
    <SafeAreaView
      edges={[
        'top',
        'right',
        'bottom',
        'left',
      ]}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.headerButton,
              pressed
                ? styles.headerButtonPressed
                : null,
            ]}
          >
            <SymbolView
              name={{
                ios: 'chevron.left',
                android: 'arrow_back',
                web: 'arrow_back',
              }}
              size={20}
              tintColor={colors.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Ajustes de la cuenta
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <Text style={styles.description}>
          Consulta tus datos de acceso y gestiona
          la seguridad de tu cuenta.
        </Text>

        <Section title="Información de la cuenta">
          <SettingRow
            icon={{
              ios: 'envelope',
              android: 'mail',
              web: 'mail',
            }}
            title="Correo electrónico"
            value={user?.email ?? '—'}
          />

          <SettingRow
            icon={{
              ios: 'at',
              android: 'alternate_email',
              web: 'alternate_email',
            }}
            title="Nombre de usuario"
            value={
              user?.username
                ? `@${user.username}`
                : '—'
            }
          />

          <SettingRow
            icon={{
              ios: 'calendar',
              android: 'calendar_today',
              web: 'calendar_today',
            }}
            isLast
            title="Miembro desde"
            value={memberSince}
          />
        </Section>

        <Section title="Seguridad">
          <SettingRow
            icon={{
              ios: 'key',
              android: 'key',
              web: 'key',
            }}
            isLast
            onPress={() => {
              router.push('/change-password');
            }}
            subtitle="Actualiza la contraseña con la que accedes a Mesa."
            title="Cambiar contraseña"
          />
        </Section>

        <Section title="Zona de peligro">
          <SettingRow
            danger
            icon={{
              ios: 'trash',
              android: 'delete',
              web: 'delete',
            }}
            isLast
            onPress={() => {
              router.push('/delete-account');
            }}
            subtitle="Elimina permanentemente tu cuenta y tus datos personales."
            title="Eliminar cuenta"
          />
        </Section>
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
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 42,
  },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  headerButtonPressed: {
    backgroundColor: '#F6EFE9',
  },
  headerPlaceholder: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 19,
    fontFamily: fonts.bold,
    letterSpacing: -0.3,
  },
  description: {
    marginBottom: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    color: colors.mutedStrong,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'left',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    marginBottom: 10,
    color: colors.muted,
    fontSize: 12,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionContent: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  settingRow: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 13,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingRowPressed: {
    backgroundColor: '#FBF6F2',
  },
  settingIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
  },
  settingIconDanger: {
    backgroundColor: '#FFF0ED',
  },
  settingText: {
    flex: 1,
    paddingVertical: 10,
  },
  settingTitle: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  settingTitleDanger: {
    color: colors.danger,
  },
  settingSubtitle: {
    marginTop: 3,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  settingValue: {
    maxWidth: '43%',
    color: colors.muted,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    textAlign: 'right',
  },
});
