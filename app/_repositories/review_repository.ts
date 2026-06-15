import { auth } from "@/app/_services/AuthService";
import { Timestamp, getFirestore, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { app } from "@/app/_providers/FirebaseProvider";
import { CreateReviewData, Review } from "../_models/review";
import {
  getDocument,
  deleteDocument,
  createDocument,
  getDocumentsWhere,
} from "../_services/FirestoreService";
import UserRepository from "./user_repository";

const db = getFirestore(app);

export default class ReviewRepository {
  private static readonly COLLECTION_PATH = "reviews";

  // GET ==========================================================

  static async getReviewById(reviewId: string): Promise<Review | null> {
    const data = await getDocument(`/${this.COLLECTION_PATH}/${reviewId}`);
    if (!data) return null;
    return data as Review;
  }

  /** Lecture publique — avis d'un produit, triés du plus récent au plus ancien */
  static async getReviewsByProduct(productId: string, limitCount?: number): Promise<Review[]> {
    const q = query(
      collection(db, this.COLLECTION_PATH),
      where("productId", "==", productId),
      orderBy("createdAt", "desc"),
      ...(limitCount ? [limit(limitCount)] : []),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, path: doc.ref.path, ...doc.data() } as Review));
  }

  /** Récupère l'avis (s'il existe) d'un utilisateur pour un produit donné */
  static async getUserReviewForProduct(userId: string, productId: string): Promise<Review | null> {
    const results = await getDocumentsWhere(this.COLLECTION_PATH, "userId", "==", userId, 100);
    const match = results.find((r) => (r as unknown as Review).productId === productId);
    return match ? (match as unknown as Review) : null;
  }

  // POST =========================================================

  /**
   * Crée un avis pour l'utilisateur connecté.
   * Lève une erreur si l'utilisateur a déjà posté un avis pour ce produit.
   */
  static async createReview(data: CreateReviewData): Promise<Review> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    if (data.userId !== auth.currentUser.uid) throw new Error("Permission refusée");

    const existing = await this.getUserReviewForProduct(data.userId, data.productId);
    if (existing) throw new Error("Vous avez déjà publié un avis pour ce produit");

    const docData: Omit<Review, "id" | "path"> = {
      ...data,
      createdAt: Timestamp.now(),
    };

    const docRef = await createDocument(this.COLLECTION_PATH, docData);
    const created = await getDocument(`/${this.COLLECTION_PATH}/${docRef.id}`);
    return created as Review;
  }

  // DELETE =======================================================

  /**
   * Supprime un avis.
   * Seul l'auteur ou un admin peut supprimer.
   */
  static async deleteReview(reviewId: string): Promise<void> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");

    const review = await this.getReviewById(reviewId);
    if (!review) throw new Error("Avis non trouvé");

    const isSelf = review.userId === auth.currentUser.uid;
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);

    if (!isSelf && !isAdmin) throw new Error("Permission refusée");

    await deleteDocument(`/${this.COLLECTION_PATH}/${reviewId}`);
  }
}
