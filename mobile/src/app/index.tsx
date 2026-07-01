import { Redirect } from 'expo-router';

import { useAuth } from '../contexts/auth-context';

export default function IndexScreen() {
  const { isAuthenticated } = useAuth();

  return (
    <Redirect
      href={isAuthenticated ? '/home' : '/login'}
    />
  );
}