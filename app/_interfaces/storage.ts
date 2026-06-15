import { Timestamp } from "firebase/firestore";

export interface StorageFile {
  url: string;
  path: string;
  fileName: string;
  mimeType?: string; // ex: "application/pdf", "image/jpeg"
  size?: number; // Taille en octets
  uploadedAt?: Timestamp;
  uploadedBy?: string; // User ID
}

export interface StorageImage {
  url: string;
  path: string;
  fileName: string;
  width: number;
  height: number;
  size?: number;
  uploadedAt?: Timestamp;
  uploadedBy?: string;
  order?: number; // Pour gérer l'ordre d'affichage des images
  altText?: string; // Texte alternatif pour l'accessibilité
  caption?: string; // Légende de l'image
  blurDataURL?: string; // Tiny base64 thumbnail for blur-up placeholder
}
