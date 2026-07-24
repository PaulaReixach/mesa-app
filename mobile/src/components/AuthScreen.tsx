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
      ? 88
      : 210
  ) + insets.top;
  const cardMinHeight = Math.max(
    windowHeight - heroHeight + 20,
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
              {!compactHero ? (
                <Image
                  accessible={false}
                  resizeMode="contain"
                  source={require('../../assets/images/groups-header-illustration.png')}
                  style={styles.heroIllustration}
                />
              ) : null}

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
                    styles.brandLockup,
                    compactHero ? styles.brandLockupCompact : null,
                  ]}
                >
                  <View
                    style={[
                      styles.brandLogoFrame,
                      compactHero
                        ? styles.brandLogoFrameCompact
                        : null,
                    ]}
                  >
                    <Image
                      accessible={false}
                      resizeMode="contain"
                      source={require('../../assets/images/mesa-logo.png')}
                      style={[
                        styles.brandLogo,
                        compactHero ? styles.brandLogoCompact : null,
                      ]}
                    />
                  </View>

                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.wordmark,
                      compactHero ? styles.wordmarkCompact : null,
                    ]}
                  >
                    MESA
                  </Text>
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
                compactHero
                  ? styles.cardCompact
                  : styles.cardRegular,
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
    paddingBottom: spacing.xl,
  },
  heroIllustration: {
    position: 'absolute',
    right: -6,
    bottom: -38,
    width: 330,
    height: 150,
    opacity: 0.16,
  },
  topBar: {
    position: 'relative',
    minHeight: touchTargets.comfortable,
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
    marginLeft: -4,
    borderWidth: 1,
    borderColor: 'rgba(255, 249, 244, 0.22)',
    borderRadius: radii.round,
    backgroundColor: 'rgba(255, 249, 244, 0.10)',
  },
  controlPressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLockupCompact: {
    gap: 8,
  },
  brandLogoFrame: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 249, 244, 0.72)',
    borderRadius: radii.round,
    backgroundColor: colors.onPrimary,
  },
  brandLogoFrameCompact: {
    width: 34,
    height: 34,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: radii.round,
  },
  brandLogoCompact: {
    width: 30,
    height: 30,
  },
  wordmark: {
    color: colors.onPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: 2.6,
  },
  wordmarkCompact: {
    fontSize: 16,
    letterSpacing: 2.3,
  },
  heroCopy: {
    alignItems: 'center',
    zIndex: 1,
    marginTop: spacing.md,
  },
  heroMessage: {
    maxWidth: 330,
    color: colors.onPrimary,
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 28,
    letterSpacing: -0.45,
    textAlign: 'center',
    textShadowColor: 'rgba(116, 45, 28, 0.18)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 5,
  },
  card: {
    zIndex: 2,
    marginTop: -20,
    paddingHorizontal: spacing.xl,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    backgroundColor: colors.background,
  },
  cardRegular: {
    paddingTop: spacing.xxl,
  },
  cardCompact: {
    paddingTop: 28,
  },
  heading: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 22,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 370,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  form: {
    flexGrow: 1,
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
    marginTop: 'auto',
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
