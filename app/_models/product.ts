import { StorageImage } from "../_interfaces/storage";
import { Timestamp } from "firebase/firestore";
import PRODUCT_STATUS from "@/app/_data/product_status.json";

export type BikeType = "road" | "mountain" | "gravel" | "city" | "bmx" | "electric";

export interface ProductDimension {
  diameter: number; // ex: 700 (en mm) ou 26, 27.5, 29 (en pouces)
  width: number; // ex: 25, 28, 35 (en mm)
  unit: "mm" | "inches";
  isoSize?: string; // ex: "25-622" (norme ISO/ETRTO)
}

export interface Product {
  id?: string;
  path?: string;
  name: string;
  slug: string; // URL-friendly identifier
  brand: string;
  shortDescription: string; // Résumé court (pour les cartes produit)
  description: string; // Description longue (markdown ou texte riche)
  technicalDetails?: string; // Détails techniques, composition, etc.
  bikeType: BikeType[];
  dimension: ProductDimension;
  weight?: number; // en grammes
  maxPressure?: number; // en bar
  minPressure?: number; // en bar
  price: number; // Prix en centimes (ex: 2999 = 29,99€)
  compareAtPrice?: number; // Prix barré, en centimes
  stock: number;
  status: keyof typeof PRODUCT_STATUS; // "active", "archived", "out_of_stock"
  images: StorageImage[]; // images[0] = image principale
  tags?: string[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string; // userId de l'admin qui a créé le produit
}

// Type pour la création (sans id, path, timestamps auto)
export type CreateProductData = Omit<Product, "id" | "path" | "createdAt" | "updatedAt">;

// Type pour la mise à jour
export type UpdateProductData = Partial<Omit<Product, "id" | "path" | "createdAt">>;
