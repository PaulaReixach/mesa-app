import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as authService from '../services/auth-service';
import {
  LoginPayload,
  RegisterPayload,
  User,
} from '../types/auth';

const ACCESS_TOKEN_KEY = 'mesa.access-token';

type AuthContextValue = {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(
    null,
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken =
          await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

        if (!storedToken) {
          return;
        }

        const currentUser =
          await authService.getCurrentUser(storedToken);

        setAccessToken(storedToken);
        setUser(currentUser);
      } catch {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const saveSession = useCallback(
    async (
      token: string,
      authenticatedUser: User,
    ): Promise<void> => {
      await SecureStore.setItemAsync(
        ACCESS_TOKEN_KEY,
        token,
      );

      setAccessToken(token);
      setUser(authenticatedUser);
    },
    [],
  );

  const signIn = useCallback(
    async (payload: LoginPayload): Promise<void> => {
      const response = await authService.login(payload);

      await saveSession(
        response.accessToken,
        response.user,
      );
    },
    [saveSession],
  );

  const signUp = useCallback(
    async (payload: RegisterPayload): Promise<void> => {
      const response = await authService.register(payload);

      await saveSession(
        response.accessToken,
        response.user,
      );
    },
    [saveSession],
  );

  const signOut = useCallback(async (): Promise<void> => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      user,
      isAuthenticated:
        accessToken !== null && user !== null,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [
      accessToken,
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider.',
    );
  }

  return context;
}