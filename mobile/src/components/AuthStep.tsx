import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from './ui/AppText';
import { InlineBanner } from './ui/InlineBanner';
import {
  createThemedStyles, fonts, iconSize, SCREEN_GUTTER, space, touchTarget, useTheme,
} from '../theme';

const symbol = require('../../assets/images/brand/symbol.svg');

/** Network failures surface as TypeError from fetch (see lib/api.ts). */
export function isOfflineError(error: unknown): boolean {
  return error instanceof TypeError;
}

/**
 * Step screen of «Entrar»: back chevron and the brand symbol, a big title with one line under
 * it, the fields, and the main action anchored above the keyboard.
 */
export function AuthStep({ title, subtitle, children, footer, offline = false }: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  /** Shows the «Sin conexión» notice above the action. */
  offline?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/onboarding'));

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.bar}>
          <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel="Volver" style={styles.back}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              size={iconSize.nav} tintColor={colors.textPrimary} />
          </Pressable>
          <Image source={symbol} style={styles.symbol} contentFit="contain" accessible={false} />
          <View style={styles.back} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.heading}>
            <AppText accessibilityRole="header" style={styles.title}>{title}</AppText>
            {typeof subtitle === 'string'
              ? <AppText variant="body" tone="muted">{subtitle}</AppText>
              : subtitle}
          </View>
          {children}
        </ScrollView>
        <View style={styles.footer}>
          {offline && (
            <InlineBanner title="Sin conexión" message="Comprueba tu conexión y vuelve a intentarlo." />
          )}
          {footer}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.s2,
  },
  back: { width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center' },
  symbol: { width: 24, height: 26 },
  content: { paddingHorizontal: SCREEN_GUTTER, paddingTop: space.s4, paddingBottom: space.s6, gap: space.s6 },
  heading: { gap: space.s2 },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36, letterSpacing: -1, color: colors.textPrimary },
  footer: { paddingHorizontal: SCREEN_GUTTER, paddingTop: space.s2, paddingBottom: space.s3, gap: space.s3 },
}));
