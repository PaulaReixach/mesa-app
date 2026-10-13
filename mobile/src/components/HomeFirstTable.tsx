import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from './ui/AppText';
import { createThemedStyles, fonts, space } from '../theme';

const symbol = require('../../assets/images/brand/symbol.svg');
// Texture of a shared table under the terracotta, as in the artboard (opacity 22 %, blurred).
const texture = require('../../assets/images/first-table-texture.webp');

const WHITE = 'rgb(255, 255, 255)';
/** Dark mode keeps white text on the deep brand terracotta (the light accent of dark mode lacks contrast). */
const DEEP_TERRACOTTA = 'rgb(135, 52, 33)';
const STEPS = [
  { title: 'Junta a tu gente', text: 'Pareja, amigas, un viaje o el equipo.' },
  { title: 'Guardad sitios', text: 'Los que os recomiendan y los que veis.' },
  { title: 'Id y valorad', text: 'Cada uno pone su nota y veis la media.' },
];

/** Inicio without groups: «Monta tu primera mesa» and «Así funciona Mesa» in three steps. */
export function HomeFirstTable() {
  const styles = useStyles();
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Image source={texture} style={styles.texture} contentFit="cover" blurRadius={2} accessible={false} />
        <Image source={symbol} style={styles.symbol} contentFit="contain" tintColor="rgb(252, 250, 247)" accessible={false} />
        <AppText accessibilityRole="header" style={styles.title}>Monta tu primera mesa</AppText>
        <AppText style={styles.lead}>Crea un grupo con tu gente y guardad juntos los sitios que os apetece probar.</AppText>
        <View style={styles.buttons}>
          <Pressable onPress={() => router.push('/groups/create')} accessibilityRole="button"
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <AppText style={styles.primaryText}>Crear un grupo</AppText>
          </Pressable>
          <Pressable onPress={() => router.push('/group-invitations')} accessibilityRole="button"
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
            <AppText style={styles.secondaryText}>Tengo un enlace de invitación</AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.how}>
        <AppText accessibilityRole="header" style={styles.howTitle}>Así funciona Mesa</AppText>
        {STEPS.map((step, index) => (
          <View key={step.title} style={styles.step}>
            <View style={styles.number}><AppText style={styles.numberText}>{index + 1}</AppText></View>
            <View style={styles.stepText}>
              <AppText variant="bodyStrong">{step.title}</AppText>
              <AppText variant="body" tone="muted">{step.text}</AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, scheme }) => ({
  wrapper: { gap: 40 },
  card: {
    borderRadius: 30, borderCurve: 'continuous', overflow: 'hidden', backgroundColor: scheme === 'dark' ? DEEP_TERRACOTTA : colors.accent,
    paddingTop: 22, paddingHorizontal: space.s5, paddingBottom: space.s5,
    boxShadow: scheme === 'dark' ? undefined : '0 1px 2px rgba(39, 41, 36, 0.08), 0 12px 32px rgba(166, 65, 43, 0.22)',
  },
  texture: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.22 },
  symbol: { width: 44, height: 48 },
  title: { marginTop: 40, fontFamily: fonts.display, fontSize: 27, lineHeight: 31, letterSpacing: -1, color: WHITE },
  lead: { marginTop: 10, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: 'rgb(251, 227, 217)' },
  buttons: { marginTop: 22, gap: space.s2 },
  primary: { height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  primaryText: { fontFamily: fonts.semiBold, fontSize: 14, color: scheme === 'dark' ? colors.textPrimary : colors.accentPressed },
  secondary: {
    height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(252, 250, 247, 0.14)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  secondaryText: { fontFamily: fonts.semiBold, fontSize: 14, color: WHITE },
  pressed: { transform: [{ scale: 0.97 }] },
  how: { gap: space.s4 },
  howTitle: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24, letterSpacing: -0.5, color: colors.textPrimary },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  number: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondarySoft,
  },
  numberText: { fontFamily: fonts.display, fontSize: 14, color: colors.onSecondarySoft },
  stepText: { flex: 1 },
}));
