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