import { Timestamp } from "firebase/firestore";

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id?: string;
  path?: string;
  productId: string;
  userId: string;
  displayName: string; // Snapshot du nom au moment de la publication
  profileImageUrl?: string; // Snapshot de la photo de profil
  rating: ReviewRating;
  title: string;
  body: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Type pour la création
export type CreateReviewData = Omit<Review, "id" | "path" | "createdAt" | "updatedAt">;
