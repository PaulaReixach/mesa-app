import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  showBrand?: boolean;
  alignment?: 'center' | 'top';
};

export function AuthScreen({
  title,
  subtitle,
  children,
  showBrand = true,
  alignment = 'center',
}: AuthScreenProps) {
  const isTopAligned = alignment === 'top';

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            isTopAligned
              ? styles.topAlignedContent
              : styles.centeredContent,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showBrand ? (
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Text
                  maxFontSizeMultiplier={1.1}
                  style={styles.logoText}
                >
                  M
                </Text>
              </View>

              <Text
                maxFontSizeMultiplier={1.1}
                style={styles.brandName}
              >
                Mesa
              </Text>
            </View>
          ) : null}

          <View style={styles.heading}>
            <Text
              maxFontSizeMultiplier={1.15}
              style={[
                styles.title,
                isTopAligned ? styles.topTitle : null,
              ]}
            >
              {title}
            </Text>

            <Text
              maxFontSizeMultiplier={1.15}
              style={[
                styles.subtitle,
                isTopAligned ? styles.topSubtitle : null,
              ]}
            >
              {subtitle}
            </Text>
          </View>

          <View style={styles.form}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  centeredContent: {
    justifyContent: 'center',
    paddingTop: 40,
  },
  topAlignedContent: {
    justifyContent: 'flex-start',
    paddingTop: 34,
  },
  brand: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 36,
  },
  logo: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  logoText: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '800',
  },
  brandName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  heading: {
    gap: 8,
    marginBottom: 28,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  topTitle: {
    fontSize: 23,
    lineHeight: 29,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  topSubtitle: {
    maxWidth: 280,
    fontSize: 13,
    lineHeight: 19,
  },
  form: {
    gap: 18,
  },
});