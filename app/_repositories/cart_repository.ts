import { auth } from "@/app/_services/AuthService";
import { Timestamp, getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "@/app/_providers/FirebaseProvider";
import { Cart, CartItem, UpsertCartItemData } from "../_models/cart";
import UserRepository from "./user_repository";

const db = getFirestore(app);

export default class CartRepository {
  private static readonly COLLECTION_PATH = "carts";

  private static docRef(userId: string) {
    return doc(db, this.COLLECTION_PATH, userId);
  }

  // GET ==========================================================

  /** Récupère le panier d'un utilisateur (lui-même ou admin) */
  static async getCart(userId: string): Promise<Cart | null> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isSelf = auth.currentUser.uid === userId;
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isSelf && !isAdmin) throw new Error("Permission refusée");

    const snap = await getDoc(this.docRef(userId));
    if (!snap.exists()) return null;
    return { id: snap.id, path: snap.ref.path, ...snap.data() } as Cart;
  }

  /** Récupère le panier de l'utilisateur connecté */
  static async getCurrentUserCart(): Promise<Cart | null> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    return this.getCart(auth.currentUser.uid);
  }

  // WRITE ========================================================

  /**
   * Ajoute un article ou incrémente sa quantité s'il est déjà dans le panier.
   * Le `subtotal` est calculé automatiquement.
   */
  static async addItem(itemData: UpsertCartItemData): Promise<Cart> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const userId = auth.currentUser.uid;

    const cart = await this.getCart(userId);
    const existingItems: CartItem[] = cart?.items ?? [];

    const existingIndex = existingItems.findIndex((i) => i.productId === itemData.productId);

    let updatedItems: CartItem[];
    if (existingIndex >= 0) {
      // Incrémenter la quantité
      const existing = existingItems[existingIndex];
      const newQty = existing.quantity + itemData.quantity;
      updatedItems = [...existingItems];
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        subtotal: existing.price * newQty,
      };
    } else {
      // Nouvel article
      const newItem: CartItem = {
        ...itemData,
        subtotal: itemData.price * itemData.quantity,
      };
      updatedItems = [...existingItems, newItem];
    }

    return this.saveCart(userId, updatedItems);
  }

  /**
   * Définit la quantité exacte d'un article.
   * Si quantity <= 0, l'article est retiré du panier.
   */
  static async updateItemQuantity(productId: string, quantity: number): Promise<Cart> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const userId = auth.currentUser.uid;

    const cart = await this.getCart(userId);
    const existingItems: CartItem[] = cart?.items ?? [];

    let updatedItems: CartItem[];
    if (quantity <= 0) {
      updatedItems = existingItems.filter((i) => i.productId !== productId);
    } else {
      updatedItems = existingItems.map((i) =>
        i.productId === productId ? { ...i, quantity, subtotal: i.price * quantity } : i,
      );
    }

    return this.saveCart(userId, updatedItems);
  }

  /** Retire un article du panier */
  static async removeItem(productId: string): Promise<Cart> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const userId = auth.currentUser.uid;

    const cart = await this.getCart(userId);
    const updatedItems = (cart?.items ?? []).filter((i) => i.productId !== productId);

    return this.saveCart(userId, updatedItems);
  }

  /** Vide complètement le panier (appelé après création d'une commande) */
  static async clearCart(userId: string): Promise<void> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isSelf = auth.currentUser.uid === userId;
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isSelf && !isAdmin) throw new Error("Permission refusée");

    await setDoc(
      this.docRef(userId),
      { userId, items: [], updatedAt: Timestamp.now() },
      { merge: false },
    );
  }

  // PRIVATE ======================================================

  private static async saveCart(userId: string, items: CartItem[]): Promise<Cart> {
    const cartData: Omit<Cart, "id" | "path"> = {
      userId,
      items,
      updatedAt: Timestamp.now(),
    };
    await setDoc(this.docRef(userId), cartData, { merge: false });
    return { id: userId, path: `${this.COLLECTION_PATH}/${userId}`, ...cartData };
  }
}
