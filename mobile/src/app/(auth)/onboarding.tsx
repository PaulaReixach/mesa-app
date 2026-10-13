import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Alert, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../components/ui/AppText';
import { completeOnboarding } from '../../lib/onboarding';
import { createThemedStyles, fonts, radius, space, useTheme } from '../../theme';

const tablePhoto = require('../../../assets/images/welcome-table.webp');
const logoWhite = require('../../../assets/images/brand/logo-white.svg');
const appleLogo = require('../../../assets/images/brand/apple.svg');
const googleG = require('../../../assets/images/brand/google-g.svg');

const MAX_PHOTO_HEIGHT = 476;
const MIN_PHOTO_HEIGHT = 260;
/** Card and title overlap the bottom of the photo (artboard: 476 → card 380, title 456). */
const CARD_OVERLAP = 96;
const TITLE_OVERLAP = 20;
/** Title block + its gap to the buttons, and the three buttons with the legal line. */
const COPY_HEIGHT = 150;
const ACTIONS_HEIGHT = 230;
const SIDE = 24;

// Apple and Google sign-in are pending on the backend (DESIGN.md › Entrar).
function socialPending() {
  Alert.alert('Muy pronto', 'De momento, entra con tu correo.');
}

// Legal texts are not written yet (DESIGN.md › Entrar › Backend).
function legalPending() {
  Alert.alert('Muy pronto', 'Estamos terminando las condiciones y la política de privacidad.');
}

/** «Entrar» 1 · Bienvenida «La mesa compartida»: one door with Apple, Google or email. */
export default function WelcomeScreen() {
  const styles = useStyles();
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // The photo gives way so the whole welcome fits on screen without scrolling.
  const photoHeight = Math.max(MIN_PHOTO_HEIGHT, Math.min(MAX_PHOTO_HEIGHT,
    height - COPY_HEIGHT - ACTIONS_HEIGHT - Math.max(insets.bottom, space.s5) + TITLE_OVERLAP));
  const dark = scheme === 'dark';

  const continueWithEmail = () => {
    void completeOnboarding();
    router.push('/login');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} bounces={false}>
      <View style={[styles.photo, { height: photoHeight }]} accessible={false} importantForAccessibility="no-hide-descendants">
        <Image source={tablePhoto} style={styles.fill} contentFit="cover" contentPosition={{ left: '50%', top: '40%' }} />
        <LinearGradient
          colors={[
            'rgba(30, 22, 18, 0.66)', 'rgba(30, 22, 18, 0.34)', 'rgba(30, 22, 18, 0)',
            `${colors.background}00`, `${colors.background}DB`, colors.background,
          ]}
          locations={[0, 0.15, 0.32, 0.56, 0.82, 0.93]}
          style={styles.veil}
        />
      </View>
      <Image source={logoWhite} style={[styles.logo, { top: insets.top + 19 }]} contentFit="contain"
        accessibilityRole="image" accessibilityLabel="Mesa" />
      <ExampleCard top={photoHeight - CARD_OVERLAP} />

      <View style={[styles.copy, { marginTop: photoHeight - TITLE_OVERLAP }]}>
        <AppText accessibilityRole="header" style={styles.title}>Los buenos sitios se comparten.</AppText>
        <AppText style={styles.lead}>Guarda, decide y valora con tu gente.</AppText>
      </View>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, space.s5) }]}>
        <SsoButton label="Continuar con Apple" onPress={socialPending}
          style={{ backgroundColor: dark ? '#FFFFFF' : '#000000' }} color={dark ? '#000000' : '#FFFFFF'}
          icon={<Image source={appleLogo} style={styles.apple} tintColor={dark ? '#000000' : '#FFFFFF'} />} />
        <SsoButton label="Continuar con Google" onPress={socialPending}
          style={styles.google} color={colors.textPrimary}
          icon={<Image source={googleG} style={styles.gIcon} />} />
        <SsoButton label="Continuar con correo" onPress={continueWithEmail}
          style={{ backgroundColor: colors.secondarySoft }} color={colors.onSecondarySoft}
          icon={<SymbolView name={{ ios: 'envelope', android: 'mail', web: 'mail' }} size={19}
            tintColor={colors.onSecondarySoft} />} />
        <AppText style={styles.legal}>
          Al continuar aceptas las{' '}
          <AppText style={styles.link} accessibilityRole="link" onPress={legalPending}>Condiciones</AppText>
          {' '}y la{' '}
          <AppText style={styles.link} accessibilityRole="link" onPress={legalPending}>Privacidad</AppText>.
        </AppText>
      </View>
    </ScrollView>
  );
}

function SsoButton({ label, onPress, style, color, icon }: {
  label: string;
  onPress: () => void;
  style: object;
  color: string;
  icon: ReactNode;
}) {
  const styles = useStyles();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [styles.sso, style, pressed && styles.pressed]}>
      <View accessible={false}>{icon}</View>
      <AppText style={[styles.ssoText, { color }]}>{label}</AppText>
    </Pressable>
  );
}

/** Decorative sample of a group over the photo, hidden from screen readers. */
function ExampleCard({ top }: { top: number }) {
  const styles = useStyles();
  const { colors, cover } = useTheme();
  const faces = [
    { initial: 'P', tone: cover[2] },
    { initial: 'A', tone: cover[0] },
    { initial: 'L', tone: cover[1] },
  ];
  return (
    <View style={[styles.card, { top }]} accessible={false} importantForAccessibility="no-hide-descendants">
      <View style={styles.cardIcon}>
        <SymbolView name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }} size={18}
          tintColor={colors.accent} />
      </View>
      <View>
        <AppText style={styles.cardTitle} numberOfLines={1}>Cenas de los viernes</AppText>
        <AppText style={styles.cardMeta} numberOfLines={1}>Tú, Ana y Lucas · 12 sitios</AppText>
      </View>
      <View style={styles.faces}>
        {faces.map((face, index) => (
          <View key={face.initial} style={[styles.face, { backgroundColor: face.tone.background, marginLeft: index ? -7 : 0 }]}>
            <AppText style={[styles.faceText, { color: face.tone.ink }]}>{face.initial}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1 },
  photo: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  veil: { position: 'absolute', top: -2, left: 0, right: 0, bottom: -2 },
  logo: { position: 'absolute', left: SIDE, width: 116, height: 33 },
  card: {
    position: 'absolute',
    left: SIDE,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: space.s2,
    paddingRight: 14,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    boxShadow: '0 1px 2px rgba(39, 41, 36, 0.08), 0 10px 24px -10px rgba(39, 41, 36, 0.35)',
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: radius.md, borderCurve: 'continuous',
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft,
  },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: 14.5, lineHeight: 19, color: colors.textPrimary },
  cardMeta: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 17, color: colors.textSecondary },
  faces: { flexDirection: 'row', marginLeft: 6 },
  face: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  faceText: { fontFamily: fonts.display, fontSize: 11, lineHeight: 13 },
  copy: { paddingHorizontal: SIDE, gap: space.s3 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.9, color: colors.textPrimary },
  lead: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  actions: { marginTop: 'auto', paddingTop: 40, paddingHorizontal: space.s5, gap: 10 },
  sso: {
    height: 50, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  pressed: { transform: [{ scale: 0.97 }] },
  ssoText: { fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 20 },
  google: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  apple: { width: 16, height: 16 },
  gIcon: { width: 18, height: 18 },
  legal: {
    marginTop: space.s1, marginHorizontal: space.s3, textAlign: 'center',
    fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.textSecondary,
  },
  link: { fontFamily: fonts.semiBold, color: colors.secondary },
}));
