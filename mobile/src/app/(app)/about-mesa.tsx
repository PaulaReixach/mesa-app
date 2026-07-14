import Constants from 'expo-constants';
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
  Share,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type SymbolName =
  ComponentProps<typeof SymbolView>['name'];

type AboutRowProps = {
  icon: SymbolName;
  title: string;
  subtitle?: string;
  value?: string;
  isLast?: boolean;
  onPress?: () => void;
};

function AboutRow({
  icon,
  title,
  subtitle,
  value,
  isLast = false,
  onPress,
}: AboutRowProps) {
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
        styles.aboutRow,

        !isLast
          ? styles.aboutRowBorder
          : null,

        pressed && onPress
          ? styles.aboutRowPressed
          : null,
      ]}
    >
      <View style={styles.aboutIcon}>
        <SymbolView
          name={icon}
          size={19}
          tintColor={colors.text}
        />
      </View>

      <View style={styles.aboutText}>
        <Text style={styles.aboutTitle}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.aboutSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text style={styles.aboutValue}>
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

export default function AboutMesaScreen() {
  const version =
    Constants.expoConfig?.version
    ?? '1.0.0';

  async function shareMesa():
  Promise<void> {
    await Share.share({
      title: 'Mesa',
      message:
        'Mesa es una aplicación para guardar restaurantes, organizar planes y decidir dónde comer con tus grupos.',
    });
  }

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
            onPress={() => {
              router.back();
            }}
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
            Acerca de Mesa
          </Text>

          <View
            style={styles.headerPlaceholder}
          />
        </View>

        <View style={styles.hero}>
          <View style={styles.logo}>
            <SymbolView
              name={{
                ios: 'fork.knife',
                android: 'restaurant',
                web: 'restaurant',
              }}
              size={34}
              tintColor={colors.white}
            />
          </View>

          <Text style={styles.appName}>
            Mesa
          </Text>

          <Text style={styles.tagline}>
            Los restaurantes que quieres probar,
            compartidos con tu gente.
          </Text>
        </View>

        <View style={styles.storyCard}>
          <Text style={styles.storyTitle}>
            ¿Qué es Mesa?
          </Text>

          <Text style={styles.storyText}>
            Mesa nace para reunir en un mismo
            sitio los restaurantes pendientes,
            las recomendaciones y los planes de
            cada grupo.
          </Text>

          <Text style={styles.storyText}>
            Puedes guardar sitios, cambiar su
            estado, compartirlos con otras
            personas y valorar la experiencia
            después de visitarlos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Aplicación
          </Text>

          <View style={styles.sectionContent}>
            <AboutRow
              icon={{
                ios: 'number',
                android: 'info',
                web: 'info',
              }}
              title="Versión"
              value={version}
            />

            <AboutRow
              icon={{
                ios: 'square.and.arrow.up',
                android: 'share',
                web: 'share',
              }}
              isLast
              onPress={() => {
                void shareMesa();
              }}
              subtitle="Comparte la idea de Mesa con otra persona."
              title="Compartir Mesa"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Información y ayuda
          </Text>

          <View style={styles.sectionContent}>
            <AboutRow
              icon={{
                ios: 'lock.shield',
                android: 'shield',
                web: 'shield',
              }}
              onPress={() => {
                router.push(
                  '/privacy-settings',
                );
              }}
              subtitle="Consulta y gestiona tus preferencias."
              title="Privacidad"
            />

            <AboutRow
              icon={{
                ios: 'questionmark.circle',
                android: 'help',
                web: 'help',
              }}
              isLast
              onPress={() => {
                router.push(
                  '/help-support',
                );
              }}
              subtitle="Preguntas frecuentes y contacto."
              title="Ayuda y soporte"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            Hecho para compartir mesa
          </Text>

          <Text style={styles.footerText}>
            Una aplicación para convertir el
            eterno “¿dónde comemos?” en un plan.
          </Text>
        </View>
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
    paddingBottom: 40,
  },

  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    fontSize: 20,
    fontFamily: fonts.bold,
    letterSpacing: -0.3,
  },

  hero: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  logo: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderRadius: 25,
    backgroundColor: colors.primary,
    shadowColor: '#7E3B2A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },

  appName: {
    color: colors.text,
    fontSize: 28,
    fontFamily: fonts.bold,
    letterSpacing: -0.7,
  },

  tagline: {
    maxWidth: 310,
    marginTop: 7,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  storyCard: {
    gap: 10,
    marginBottom: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },

  storyTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.bold,
  },

  storyText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  aboutRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  aboutRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  aboutRowPressed: {
    backgroundColor: '#FBF6F2',
  },

  aboutIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#F7EEE9',
  },

  aboutText: {
    flex: 1,
    paddingVertical: 12,
  },

  aboutTitle: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bold,
  },

  aboutSubtitle: {
    marginTop: 4,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },

  aboutValue: {
    color: colors.muted,
    fontSize: 13,
    fontFamily: fonts.bold,
  },

  footer: {
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },

  footerTitle: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },

  footerText: {
    maxWidth: 290,
    marginTop: 6,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});