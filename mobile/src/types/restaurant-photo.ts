export type RestaurantPhoto = {
  id: string;
  imageUrl: string;
  uploadedByUserId: string | null;
  uploadedByName: string;
  uploadedByUsername: string | null;
  uploadedByAvatarUrl: string | null;
  uploadedByCurrentUser: boolean;
  canDelete: boolean;
  createdAt: string;
};

export type RestaurantPhotoUploadFile = {
  uri: string;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
};
