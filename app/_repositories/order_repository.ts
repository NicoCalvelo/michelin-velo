import { auth } from "@/app/_services/AuthService";
import { Timestamp, getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { app } from "@/app/_providers/FirebaseProvider";
import { CreateOrderData, Order, UpdateOrderData } from "../_models/order";
import {
  getDocument,
  UpdateDocument,
  deleteDocument,
  getDocumentsWhere,
  createDocument,
} from "../_services/FirestoreService";
import UserRepository from "./user_repository";

const db = getFirestore(app);

export default class OrderRepository {
  private static readonly COLLECTION_PATH = "orders";

  // GET ==========================================================

  static async getOrderById(orderId: string): Promise<Order | null> {
    const data = await getDocument(`/${this.COLLECTION_PATH}/${orderId}`);
    if (!data) return null;
    return data as Order;
  }

  /** Récupère les commandes de l'utilisateur connecté */
  static async getCurrentUserOrders(): Promise<Order[]> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");

    const q = query(
      collection(db, this.COLLECTION_PATH),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, path: doc.ref.path, ...doc.data() } as Order));
  }

  /** Récupère les commandes d'un utilisateur spécifique (userId) */
  static async getOrdersByUser(userId: string): Promise<Order[]> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const callerIsAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    const isSelf = auth.currentUser.uid === userId;
    if (!callerIsAdmin && !isSelf) throw new Error("Permission refusée");

    const q = query(
      collection(db, this.COLLECTION_PATH),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, path: doc.ref.path, ...doc.data() } as Order));
  }

  /** Admin only — Récupère toutes les commandes */
  static async getAllOrders(limitCount?: number): Promise<Order[]> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isAdmin) throw new Error("Permission refusée : réservé aux administrateurs");

    const orders = await getDocumentsWhere(
      this.COLLECTION_PATH,
      "status",
      "!=",
      "__never__", // truthy filter to get all docs (workaround for getDocumentsInCollection pagination)
      limitCount ?? null,
    );
    // Fallback: if the workaround doesn't work, just return what we get.
    return orders as Order[];
  }

  /** Admin only — Récupère les commandes par statut */
  static async getOrdersByStatus(status: string, limitCount?: number): Promise<Order[]> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isAdmin) throw new Error("Permission refusée : réservé aux administrateurs");

    const orders = await getDocumentsWhere(
      this.COLLECTION_PATH,
      "status",
      "==",
      status,
      limitCount ?? null,
    );
    return orders as Order[];
  }

  // POST =========================================================

  /** Crée une commande pour l'utilisateur connecté */
  static async createOrder(orderData: CreateOrderData): Promise<Order> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");

    if (orderData.userId !== auth.currentUser.uid) {
      throw new Error("Vous ne pouvez créer une commande que pour vous-même");
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new Error("La commande doit contenir au moins un article");
    }

    const docData: Omit<Order, "id" | "path"> = {
      ...orderData,
      status: orderData.status ?? "pending",
      paymentStatus: orderData.paymentStatus ?? "pending",
      createdAt: Timestamp.now(),
    };

    const docRef = await createDocument(this.COLLECTION_PATH, docData);
    const created = await getDocument(`/${this.COLLECTION_PATH}/${docRef.id}`);
    return created as Order;
  }

  // PUT ==========================================================

  /**
   * Met à jour une commande.
   * - Un utilisateur peut modifier uniquement ses propres commandes "pending" (adresse, notes).
   * - Un admin peut modifier le statut et le paymentStatus de n'importe quelle commande.
   */
  static async updateOrder(orderId: string, updateData: UpdateOrderData): Promise<Order | null> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");

    const order = await this.getOrderById(orderId);
    if (!order) throw new Error("Commande non trouvée");

    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    const isSelf = order.userId === auth.currentUser.uid;

    if (!isAdmin && !isSelf) throw new Error("Permission refusée");

    if (!isAdmin) {
      // L'utilisateur ne peut modifier qu'une commande en attente
      if (order.status !== "pending") {
        throw new Error("Impossible de modifier une commande déjà confirmée ou expédiée");
      }
      // L'utilisateur ne peut pas modifier le statut ni le paymentStatus
      const { status, paymentStatus, ...allowedFields } = updateData;
      updateData = allowedFields;
    }

    await UpdateDocument(`/${this.COLLECTION_PATH}/${orderId}`, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });

    return this.getOrderById(orderId);
  }

  /** Admin only — Met à jour le statut d'une commande */
  static async updateOrderStatus(orderId: string, status: Order["status"]): Promise<Order | null> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isAdmin) throw new Error("Permission refusée : réservé aux administrateurs");

    return this.updateOrder(orderId, { status });
  }

  /** Admin only — Met à jour le statut de paiement */
  static async updatePaymentStatus(orderId: string, paymentStatus: Order["paymentStatus"]): Promise<Order | null> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isAdmin) throw new Error("Permission refusée : réservé aux administrateurs");

    return this.updateOrder(orderId, { paymentStatus });
  }

  // DELETE =======================================================

  /**
   * Annule une commande (soft delete via statut).
   * L'utilisateur peut annuler uniquement ses propres commandes "pending".
   * Un admin peut annuler n'importe quelle commande.
   */
  static async cancelOrder(orderId: string): Promise<Order | null> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");

    const order = await this.getOrderById(orderId);
    if (!order) throw new Error("Commande non trouvée");

    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    const isSelf = order.userId === auth.currentUser.uid;

    if (!isAdmin && !isSelf) throw new Error("Permission refusée");
    if (!isAdmin && order.status !== "pending") {
      throw new Error("Seules les commandes en attente peuvent être annulées");
    }

    return this.updateOrder(orderId, { status: "cancelled" });
  }

  /** Admin only — Suppression définitive d'une commande */
  static async deleteOrder(orderId: string): Promise<void> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isAdmin) throw new Error("Permission refusée : réservé aux administrateurs");

    await deleteDocument(`/${this.COLLECTION_PATH}/${orderId}`);
  }
}
