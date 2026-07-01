export type RestaurantRating = {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  score: number;
  currentUser: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RestaurantRatingsSummary = {
  averageScore: number | null;
  ratingsCount: number;
  currentUserScore: number | null;
  ratings: RestaurantRating[];
};

export type SaveRestaurantRatingPayload = {
  score: number;
};