import { Timestamp } from "firebase/firestore";

export interface CartItem {
  productId: string;
  productName: string; // Snapshot au moment de l'ajout
  productImageUrl?: string; // Snapshot de l'image principale
  variantTitle: string; // Déclinaison sélectionnée (ex: "25-622 (700x25HOOKED)")
  price: number; // Prix unitaire en centimes au moment de l'ajout
  quantity: number;
  subtotal: number; // price * quantity, en centimes
}

export interface Cart {
  id?: string; // == userId
  path?: string;
  userId: string;
  items: CartItem[];
  updatedAt?: Timestamp;
}

// Type pour l'ajout / la mise à jour d'un article
export type UpsertCartItemData = Omit<CartItem, "subtotal">;
