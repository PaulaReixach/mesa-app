import { apiRequest } from '../lib/api';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '../types/auth';

export function login(
  payload: LoginPayload,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(
  accessToken: string,
): Promise<User> {
  return apiRequest<User>(
    '/users/me',
    {
      method: 'GET',
    },
    accessToken,
  );
}
export type AccountLookup = { exists: boolean; name: string | null };

export function lookupAccount(identifier: string): Promise<AccountLookup> {
  return apiRequest<AccountLookup>(
    `/auth/lookup?identifier=${encodeURIComponent(identifier)}`,
    { method: 'GET' },
  );
}

export type UsernameAvailability = { available: boolean; suggestions: string[] };

export function checkUsername(username: string): Promise<UsernameAvailability> {
  return apiRequest<UsernameAvailability>(
    `/auth/username-availability?username=${encodeURIComponent(username)}`,
    { method: 'GET' },
  );
}
