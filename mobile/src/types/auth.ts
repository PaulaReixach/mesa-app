export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  user: User;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
  avatarUrl: string | null;
};