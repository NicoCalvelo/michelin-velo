import { Timestamp } from "firebase/firestore";
import ORDER_STATUS from "@/app/_data/order_status.json";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  productName: string; // Snapshot au moment de la commande
  productImageUrl?: string; // Snapshot de l'image principale
  price: number; // Prix unitaire en centimes au moment de la commande
  quantity: number;
  subtotal: number; // price * quantity, en centimes
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id?: string;
  path?: string;
  userId: string;
  userEmail: string; // Snapshot pour la lisibilité en back-office
  items: OrderItem[];
  subtotal: number; // Total sans livraison, en centimes
  shippingCost: number; // Frais de livraison, en centimes
  total: number; // subtotal + shippingCost, en centimes
  status: keyof typeof ORDER_STATUS;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  notes?: string; // Notes du client
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Type pour la création (champs requis par le client)
export type CreateOrderData = Omit<Order, "id" | "path" | "createdAt" | "updatedAt" | "status" | "paymentStatus"> & {
  status?: keyof typeof ORDER_STATUS;
  paymentStatus?: PaymentStatus;
};

// Type pour la mise à jour (utilisateur peut modifier adresse et notes tant que pending)
export type UpdateOrderData = Partial<Pick<Order, "shippingAddress" | "notes" | "status" | "paymentStatus" | "updatedAt">>;
