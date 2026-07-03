import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { InAppNotificationBanner } from '../components/InAppNotificationBanner';
import { MesaSplashScreen } from '../components/MesaSplashScreen';
import {
  AuthProvider,
  useAuth,
} from '../contexts/auth-context';
import { NotificationProvider } from '../contexts/notification-context';
import { colors } from '../theme/colors';

const MINIMUM_SPLASH_DURATION_MS = 1400;

if (Platform.OS !== 'web') {
  void SplashScreen.preventAutoHideAsync();

  SplashScreen.setOptions({
    duration: 250,
    fade: true,
  });
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <View style={styles.root}>
          <StatusBar style="dark" />

          <RootNavigator />

          <InAppNotificationBanner />
        </View>
      </NotificationProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  const [
    minimumTimeFinished,
    setMinimumTimeFinished,
  ] = useState(false);

  const [
    splashFinished,
    setSplashFinished,
  ] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMinimumTimeFinished(true);
    }, MINIMUM_SPLASH_DURATION_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSplashFinish =
    useCallback(() => {
      setSplashFinished(true);
    }, []);

  const canFinishSplash =
    !isLoading
    && minimumTimeFinished;

  if (!splashFinished) {
    return (
      <MesaSplashScreen
        canFinish={canFinishSplash}
        onFinish={handleSplashFinish}
      />
    );
  }

  return (
    <Stack
      screenOptions={{
        animation: 'fade',

        contentStyle: {
          backgroundColor:
            colors.background,
        },

        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />

      <Stack.Protected
        guard={!isAuthenticated}
      >
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected
        guard={isAuthenticated}
      >
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});