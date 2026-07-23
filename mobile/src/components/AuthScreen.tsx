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

const restaurantIcon: SymbolName = {
  ios: 'fork.knife',
  android: 'restaurant',
  web: 'restaurant',
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
      ? 158
      : 184
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
              <View style={styles.decorativeCircleLarge} />
              <View style={styles.decorativeCircleSmall} />

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

                <View style={styles.brand}>
                  <View style={styles.brandLogoFrame}>
                    <Image
                      accessible={false}
                      resizeMode="contain"
                      source={require('../../assets/images/mesa-logo.png')}
                      style={styles.brandLogo}
                    />
                  </View>

                  <Text
                    allowFontScaling={false}
                    style={styles.brandName}
                  >
                    MESA
                  </Text>
                </View>
              </View>

              <View style={styles.heroCopy}>
                <Text
                  maxFontSizeMultiplier={1.1}
                  style={[
                    styles.heroMessage,
                    compactHero ? styles.heroMessageCompact : null,
                  ]}
                >
                  {heroMessage}
                </Text>

                <View style={styles.heroIcon}>
                  <SymbolView
                    name={restaurantIcon}
                    size={compactHero ? 25 : 28}
                    tintColor={colors.onPrimary}
                  />
                </View>
              </View>
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
    paddingBottom: 34,
  },
  decorativeCircleLarge: {
    position: 'absolute',
    top: -72,
    right: -46,
    width: 174,
    height: 174,
    borderWidth: 1,
    borderColor: 'rgba(255, 249, 244, 0.13)',
    borderRadius: radii.round,
  },
  decorativeCircleSmall: {
    position: 'absolute',
    right: 62,
    bottom: -30,
    width: 92,
    height: 92,
    borderWidth: 1,
    borderColor: 'rgba(255, 249, 244, 0.11)',
    borderRadius: radii.round,
  },
  topBar: {
    minHeight: touchTargets.minimum,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
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
    gap: 10,
  },
  brandLogoFrame: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
    backgroundColor: colors.onPrimary,
    padding: 1,
  },
  brandLogo: {
    width: 40,
    height: 40,
  },
  brandName: {
    color: colors.onPrimary,
    fontFamily: fonts.bold,
    fontSize: 21,
    letterSpacing: 0.8,
  },
  heroCopy: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.lg,
    marginTop: 21,
  },
  heroMessage: {
    maxWidth: 275,
    flexShrink: 1,
    color: colors.onPrimary,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.55,
  },
  heroMessageCompact: {
    fontSize: 19,
    lineHeight: 25,
  },
  heroIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 249, 244, 0.22)',
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255, 249, 244, 0.11)',
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
