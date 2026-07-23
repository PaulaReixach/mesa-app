import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useAuth } from '../contexts/auth-context';
import { hasCompletedOnboarding } from '../lib/onboarding';
import { colors } from '../theme/colors';

export default function IndexScreen() {
  const { isAuthenticated } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    hasCompletedOnboarding()
      .then(setOnboardingCompleted)
      .catch(() => setOnboardingCompleted(false));
  }, []);

  if (!isAuthenticated && onboardingCompleted === null) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <Redirect
      href={isAuthenticated ? '/home' : onboardingCompleted ? '/login' : '/onboarding'}
    />
  );
}
