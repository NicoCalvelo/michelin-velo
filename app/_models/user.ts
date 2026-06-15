import { StorageImage } from "../_interfaces/storage";
import { Timestamp } from "firebase/firestore";
import USER_ROLES from "@/app/_data/user_roles.json";

// Champs publics — stockés dans /users/{userId}, modifiables directement par l'utilisateur
export interface User {
  id?: string;
  path?: string;
  displayName: string | null;
  email: string | null;
  emailVerified?: boolean;
  photoURL?: string | null; // Photo par défaut (Google, etc.)
  profileImage?: StorageImage; // Image de profil personnalisée uploadée dans Storage
  role?: keyof typeof USER_ROLES; // Rôle de l'utilisateur (défaut: "user")
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  lastLoginAt?: Timestamp;
}

// Interface pour les champs requis lors de la création
export interface CreateUserRequiredFields {
  displayName: string | null;
  email: string | null;
}

// Type pour la création
export type CreateUserData = CreateUserRequiredFields &
  Partial<Omit<User, keyof CreateUserRequiredFields | "id" | "path" | "updatedAt">>;

// Type pour la mise à jour des champs publics (modifiables par l'utilisateur)
export type UpdateUserData = Partial<Omit<User, "id" | "path" | "createdAt">>;
