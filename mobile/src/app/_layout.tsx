import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { MesaSplashScreen } from '../components/MesaSplashScreen';
import {
  AuthProvider,
  useAuth,
} from '../contexts/auth-context';
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
      <StatusBar style="dark" />
      <RootNavigator />
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

  const handleSplashFinish = useCallback(() => {
    setSplashFinished(true);
  }, []);

  const canFinishSplash =
    !isLoading && minimumTimeFinished;

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
          backgroundColor: colors.background,
        },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}