import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { ComponentProps, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { completeOnboarding } from '../../lib/onboarding';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { radii, shadows } from '../../theme/layout';

type OnboardingSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: ComponentProps<typeof SymbolView>['name'];
  accent: string;
  accentSoft: string;
};

const slides: OnboardingSlide[] = [
  {
    id: 'save',
    eyebrow: 'Todo en un mismo lugar',
    title: 'Guarda los sitios que no quieres perder',
    description: 'Reúne recomendaciones, restaurantes pendientes y favoritos en listas que siempre sabrás dónde encontrar.',
    icon: { ios: 'bookmark.fill', android: 'bookmark', web: 'bookmark' },
    accent: colors.primary,
    accentSoft: colors.primarySoft,
  },
  {
    id: 'share',
    eyebrow: 'Pensado para compartir',
    title: 'Decidir en grupo vuelve a ser fácil',
    description: 'Crea espacios privados o públicos, invita a tu gente y deja que cada persona participe a su manera.',
    icon: { ios: 'person.3.fill', android: 'groups', web: 'groups' },
    accent: colors.olive,
    accentSoft: colors.oliveSoft,
  },
  {
    id: 'plan',
    eyebrow: 'Menos debate, más mesa',
    title: 'Convierte pendientes en planes reales',
    description: 'Compara opiniones, consulta el mapa y encuentra el sitio que mejor encaja con vuestro próximo plan.',
    icon: { ios: 'map.fill', android: 'map', web: 'map' },
    accent: colors.amber,
    accentSoft: colors.amberSoft,
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pageWidth = useMemo(() => Math.max(width, 320), [width]);
  const isLast = activeIndex === slides.length - 1;

  function updateActiveIndex(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), slides.length - 1));
  }

  async function finish(destination: '/login' | '/register') {
    await completeOnboarding();
    router.replace(destination);
  }

  function handlePrimaryAction() {
    if (isLast) {
      void finish('/register');
      return;
    }

    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    setActiveIndex(current => Math.min(current + 1, slides.length - 1));
  }

  function renderSlide({ item }: ListRenderItemInfo<OnboardingSlide>) {
    return (
      <View style={[styles.slide, { width: pageWidth }]}>
        <View style={[styles.visual, { backgroundColor: item.accentSoft }]}>
          <View style={[styles.orbit, styles.orbitOne]} />
          <View style={[styles.orbit, styles.orbitTwo]} />
          <View style={[styles.iconCircle, { backgroundColor: item.accent }]}>
            <SymbolView name={item.icon} size={46} tintColor={colors.white} />
          </View>
          <View style={styles.previewCard}>
            <View style={[styles.previewAvatar, { backgroundColor: item.accentSoft }]} />
            <View style={styles.previewCopy}>
              <View style={styles.previewLineStrong} />
              <View style={styles.previewLine} />
            </View>
            <View style={[styles.previewDot, { backgroundColor: item.accent }]} />
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: item.accent }]}>{item.eyebrow}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <View accessibilityLabel="Mesa" accessibilityRole="image" style={styles.brand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>M</Text>
          </View>
          <Text style={styles.brandName}>Mesa</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => void finish('/login')}
          style={({ pressed }) => [styles.skipButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.skipText}>Saltar</Text>
        </Pressable>
      </View>

      <FlatList
        data={slides}
        decelerationRate="fast"
        horizontal
        keyExtractor={item => item.id}
        onMomentumScrollEnd={updateActiveIndex}
        pagingEnabled
        ref={listRef}
        renderItem={renderSlide}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <View accessibilityLabel={`Paso ${activeIndex + 1} de ${slides.length}`} style={styles.dots}>
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              style={[styles.dot, index === activeIndex ? styles.dotActive : null]}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handlePrimaryAction}
          style={({ pressed }) => [styles.primaryButton, pressed ? styles.primaryButtonPressed : null]}
        >
          <Text style={styles.primaryButtonText}>
            {isLast ? 'Crear mi primera mesa' : 'Siguiente'}
          </Text>
          <SymbolView
            name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
            size={20}
            tintColor={colors.white}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => void finish('/login')}
          style={({ pressed }) => [styles.loginButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.loginText}>Ya tengo cuenta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  brandMarkText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  brandName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: -0.5,
  },
  skipButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  skipText: {
    color: colors.mutedStrong,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  slide: {
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  visual: {
    minHeight: 290,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radii.xxl,
  },
  orbit: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.68)',
    borderRadius: 999,
  },
  orbitOne: {
    width: 260,
    height: 260,
  },
  orbitTwo: {
    width: 190,
    height: 190,
  },
  iconCircle: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.72)',
    borderRadius: 52,
  },
  previewCard: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    left: 18,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 13,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  previewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
  },
  previewCopy: {
    flex: 1,
    gap: 7,
  },
  previewLineStrong: {
    width: '72%',
    height: 7,
    borderRadius: 7,
    backgroundColor: colors.text,
    opacity: 0.78,
  },
  previewLine: {
    width: '52%',
    height: 6,
    borderRadius: 6,
    backgroundColor: colors.borderStrong,
  },
  previewDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  copy: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 31,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    maxWidth: 340,
    marginTop: 11,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 30,
    letterSpacing: -0.8,
    lineHeight: 36,
    textAlign: 'center',
  },
  description: {
    maxWidth: 340,
    marginTop: 13,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 8,
  },
  dots: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  primaryButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 28,
    backgroundColor: colors.primary,
    ...shadows.card,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
    transform: [{ scale: 0.992 }],
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  loginButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.68,
  },
});
