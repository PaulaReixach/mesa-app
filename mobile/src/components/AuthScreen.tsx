import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import type {
  ComponentProps,
  ReactNode,
} from 'react';
import {
  KeyboardAvoidingView,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import {
  radii,
  shadows,
  spacing,
  touchTargets,
} from '../theme/layout';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type AuthScreenProps = {
  title: string;
  subtitle: string;
  heroMessage: string;
  children: ReactNode;
  compactHero?: boolean;
  onBack?: () => void;
};

const MAX_CONTENT_WIDTH = 480;

const backIcon: SymbolName = {
  ios: 'chevron.left',
  android: 'arrow_back',
  web: 'arrow_back',
};

export function AuthScreen({
  title,
  subtitle,
  heroMessage,
  children,
  compactHero = false,
  onBack,
}: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const {
    height: windowHeight,
    width: windowWidth,
  } = useWindowDimensions();

  const contentWidth = Math.min(windowWidth, MAX_CONTENT_WIDTH);
  const heroHeight = (
    compactHero
      ? 108
      : 190
  ) + insets.top;
  const cardMinHeight = Math.max(
    windowHeight - heroHeight + 22,
    0,
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.shell,
              {
                minHeight: windowHeight,
                width: contentWidth,
              },
            ]}
          >
            <LinearGradient
              colors={[
                colors.brandStart,
                colors.brandEnd,
              ]}
              end={{ x: 0.94, y: 1 }}
              start={{ x: 0.06, y: 0 }}
              style={[
                styles.hero,
                {
                  minHeight: heroHeight,
                  paddingTop: insets.top + spacing.sm,
                },
              ]}
            >
              <View style={styles.topBar}>
                {onBack ? (
                  <Pressable
                    accessibilityLabel="Volver"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={onBack}
                    style={({ pressed }) => [
                      styles.backButton,
                      pressed ? styles.controlPressed : null,
                    ]}
                  >
                    <SymbolView
                      name={backIcon}
                      size={22}
                      tintColor={colors.onPrimary}
                    />
                  </Pressable>
                ) : null}

                <View
                  style={[
                    styles.brand,
                    compactHero
                      ? styles.brandCompact
                      : styles.brandCentered,
                  ]}
                >
                  <View
                    style={[
                      styles.brandLogoFrame,
                      compactHero
                        ? styles.brandLogoFrameCompact
                        : styles.brandLogoFrameCentered,
                    ]}
                  >
                    <Image
                      accessible={false}
                      resizeMode="contain"
                      source={require('../../assets/images/mesa-logo.png')}
                      style={[
                        styles.brandLogo,
                        compactHero
                          ? styles.brandLogoCompact
                          : styles.brandLogoCentered,
                      ]}
                    />
                  </View>

                  {!compactHero ? (
                    <Text
                      allowFontScaling={false}
                      style={styles.brandName}
                    >
                      MESA
                    </Text>
                  ) : null}
                </View>
              </View>

              {!compactHero ? (
                <View style={styles.heroCopy}>
                  <Text
                    maxFontSizeMultiplier={1.1}
                    style={styles.heroMessage}
                  >
                    {heroMessage}
                  </Text>
                </View>
              ) : null}
            </LinearGradient>

            <View
              style={[
                styles.card,
                {
                  minHeight: cardMinHeight,
                  paddingBottom: Math.max(
                    insets.bottom + spacing.lg,
                    spacing.xxl,
                  ),
                },
              ]}
            >
              <View style={styles.heading}>
                <Text
                  maxFontSizeMultiplier={1.15}
                  style={styles.title}
                >
                  {title}
                </Text>

                <Text
                  maxFontSizeMultiplier={1.15}
                  style={styles.subtitle}
                >
                  {subtitle}
                </Text>
              </View>

              <View style={styles.form}>
                {children}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export function AuthErrorBanner({
  message,
}: {
  message: string;
}) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={styles.errorBanner}
    >
      <View style={styles.errorIcon}>
        <SymbolView
          name={{
            ios: 'exclamationmark',
            android: 'priority_high',
            web: 'priority_high',
          }}
          size={15}
          tintColor={colors.danger}
        />
      </View>

      <Text style={styles.errorText}>
        {message}
      </Text>
    </View>
  );
}

export function AuthSwitchPrompt({
  action,
  onPress,
  prompt,
}: {
  action: string;
  onPress: () => void;
  prompt: string;
}) {
  return (
    <View style={styles.switchPrompt}>
      <Text style={styles.switchPromptText}>
        {prompt}
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.switchPromptButton,
          pressed ? styles.switchPromptPressed : null,
        ]}
      >
        <Text style={styles.switchPromptAction}>
          {action}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primarySoft,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
  },
  shell: {
    overflow: 'hidden',
    backgroundColor: colors.brandStart,
    ...shadows.floating,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    position: 'relative',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    width: touchTargets.minimum,
    height: touchTargets.minimum,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    borderWidth: 1,
    borderColor: 'rgba(255, 249, 244, 0.22)',
    borderRadius: radii.round,
    backgroundColor: 'rgba(255, 249, 244, 0.10)',
  },
  controlPressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCentered: {
    gap: spacing.sm,
  },
  brandCompact: {
    width: touchTargets.comfortable,
    height: touchTargets.comfortable,
  },
  brandLogoFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: colors.onPrimary,
    padding: 1,
  },
  brandLogoFrameCentered: {
    width: 56,
    height: 56,
  },
  brandLogoFrameCompact: {
    width: 44,
    height: 44,
  },
  brandLogo: {
    borderRadius: radii.round,
  },
  brandLogoCentered: {
    width: 54,
    height: 54,
  },
  brandLogoCompact: {
    width: 42,
    height: 42,
  },
  brandName: {
    color: colors.onPrimary,
    fontFamily: fonts.bold,
    fontSize: 24,
    letterSpacing: 1,
  },
  heroCopy: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  heroMessage: {
    maxWidth: 330,
    color: colors.onPrimary,
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 27,
    letterSpacing: -0.45,
    textAlign: 'center',
  },
  card: {
    zIndex: 2,
    marginTop: -22,
    paddingHorizontal: spacing.xl,
    paddingTop: 30,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    backgroundColor: colors.background,
  },
  heading: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 29,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  subtitle: {
    maxWidth: 370,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  form: {
    gap: spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#E8C1BA',
    borderRadius: radii.md,
    backgroundColor: colors.dangerSoft,
  },
  errorIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: '#F5D8D2',
  },
  errorText: {
    flex: 1,
    paddingTop: 1,
    color: colors.danger,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  switchPrompt: {
    minHeight: touchTargets.minimum,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  switchPromptText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  switchPromptButton: {
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  switchPromptPressed: {
    opacity: 0.68,
  },
  switchPromptAction: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});
