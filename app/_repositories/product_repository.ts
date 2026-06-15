import { auth } from "@/app/_services/AuthService";
import { StorageImage } from "../_interfaces/storage";
import { Timestamp, getFirestore, collection, query, where, getDocs, WhereFilterOp } from "firebase/firestore";
import { app } from "@/app/_providers/FirebaseProvider";
import { CreateProductData, Product, UpdateProductData } from "../_models/product";
import { uploadImageToStorage, deleteFileFromStorage, deleteFolderFromStorage } from "@/app/_services/StorageService";
import {
  getDocument,
  UpdateDocument,
  deleteDocument,
  getDocumentsInCollection,
  getDocumentsWhere,
  createDocument,
} from "../_services/FirestoreService";
import UserRepository from "./user_repository";

const db = getFirestore(app);

export default class ProductRepository {
  private static readonly COLLECTION_PATH = "products";

  // GET ==========================================================

  static async getProductById(productId: string): Promise<Product | null> {
    const data = await getDocument(`/${this.COLLECTION_PATH}/${productId}`);
    if (!data) return null;
    return data as Product;
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await getDocumentsWhere(this.COLLECTION_PATH, "slug", "==" as WhereFilterOp, slug, 1);
    if (!products.length) return null;
    return products[0] as Product;
  }

  static async getAllProducts(limitCount?: number): Promise<Product[]> {
    const products = await getDocumentsInCollection(this.COLLECTION_PATH, undefined, limitCount);
    return products as Product[];
  }

  static async getActiveProducts(limitCount?: number): Promise<Product[]> {
    const products = await getDocumentsWhere(
      this.COLLECTION_PATH,
      "status",
      "==" as WhereFilterOp,
      "active",
      limitCount ?? null,
    );
    return products as Product[];
  }

  static async getProductsByBikeType(bikeType: string, limitCount?: number): Promise<Product[]> {
    const q = query(
      collection(db, this.COLLECTION_PATH),
      where("bikeType", "array-contains", bikeType),
      where("status", "==", "active"),
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs
      .slice(0, limitCount)
      .map((doc) => ({ id: doc.id, path: doc.ref.path, ...doc.data() } as Product));
    return results;
  }

  // POST =========================================================

  /** Admin only — Crée un produit (sans images, utiliser uploadProductImage ensuite) */
  static async createProduct(productData: CreateProductData): Promise<Product> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isAdmin) throw new Error("Permission refusée : réservé aux administrateurs");

    const docData: Omit<Product, "id" | "path"> = {
      ...productData,
      createdBy: auth.currentUser.uid,
      createdAt: Timestamp.now(),
    };

    const docRef = await createDocument(this.COLLECTION_PATH, docData);
    const created = await getDocument(`/${this.COLLECTION_PATH}/${docRef.id}`);
    return created as Product;
  }

  // PUT ==========================================================

  /** Admin only — Met à jour un produit */
  static async updateProduct(productId: string, updateData: UpdateProductData): Promise<Product | null> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isAdmin) throw new Error("Permission refusée : réservé aux administrateurs");

    await UpdateDocument(`/${this.COLLECTION_PATH}/${productId}`, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });

    return this.getProductById(productId);
  }

  // IMAGES =======================================================

  /**
   * Admin only — Upload et ajoute une image à un produit.
   * La première image ajoutée devient l'image principale (index 0).
   */
  static async uploadProductImage(
    productId: string,
    file: File,
    options?: { altText?: string; caption?: string },
  ): Promise<StorageImage> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isAdmin) throw new Error("Permission refusée : réservé aux administrateurs");

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) throw new Error("La taille maximale est de 10 Mo par image");

    const storagePath = `products/${productId}/images`;
    const storageImage = await uploadImageToStorage(file, storagePath);

    if (options?.altText) storageImage.altText = options.altText;
    if (options?.caption) storageImage.caption = options.caption;

    const product = await this.getProductById(productId);
    const existingImages: StorageImage[] = product?.images ?? [];
    storageImage.order = existingImages.length;

    const updatedImages = [...existingImages, storageImage];

    await UpdateDocument(`/${this.COLLECTION_PATH}/${productId}`, {
      images: updatedImages,
      updatedAt: Timestamp.now(),
    });

    return storageImage;
  }

  /**
   * Admin only — Supprime une image d'un produit par son path Storage.
   */
  static async deleteProductImage(productId: string, imagePath: string): Promise<void> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isAdmin) throw new Error("Permission refusée : réservé aux administrateurs");

    await deleteFileFromStorage(imagePath);

    const product = await this.getProductById(productId);
    if (!product) return;

    const updatedImages = product.images
      .filter((img) => img.path !== imagePath)
      .map((img, index) => ({ ...img, order: index }));

    await UpdateDocument(`/${this.COLLECTION_PATH}/${productId}`, {
      images: updatedImages,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Admin only — Réordonne les images d'un produit.
   * @param orderedPaths - Tableau des `path` dans le nouvel ordre souhaité
   */
  static async reorderProductImages(productId: string, orderedPaths: string[]): Promise<void> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isAdmin) throw new Error("Permission refusée : réservé aux administrateurs");

    const product = await this.getProductById(productId);
    if (!product) throw new Error("Produit non trouvé");

    const imageMap = new Map(product.images.map((img) => [img.path, img]));
    const reordered = orderedPaths
      .map((path, index) => {
        const img = imageMap.get(path);
        return img ? { ...img, order: index } : null;
      })
      .filter(Boolean) as StorageImage[];

    await UpdateDocument(`/${this.COLLECTION_PATH}/${productId}`, {
      images: reordered,
      updatedAt: Timestamp.now(),
    });
  }

  // DELETE =======================================================

  /** Admin only — Supprime un produit et toutes ses images Storage */
  static async deleteProduct(productId: string): Promise<void> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isAdmin) throw new Error("Permission refusée : réservé aux administrateurs");

    try {
      await deleteFolderFromStorage(`products/${productId}`);
    } catch {
      // Continuer même si le dossier n'existe pas
    }

    await deleteDocument(`/${this.COLLECTION_PATH}/${productId}`);
  }
}

