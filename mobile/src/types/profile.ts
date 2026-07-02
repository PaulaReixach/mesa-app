export type UserProfileStats = {
  restaurantsCount: number;
  groupsCount: number;
  ratingsCount: number;
};

export type UpdateUserProfilePayload = {
  name: string;
  username: string;
  email: string;
};

export type AvatarUploadFile = {
  uri: string;
  fileName: string | null;
  mimeType: string | null;
};