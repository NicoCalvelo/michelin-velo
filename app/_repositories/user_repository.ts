import { auth } from "@/app/_services/AuthService";
import { StorageImage } from "../_interfaces/storage";
import { app } from "@/app/_providers/FirebaseProvider";
import { Timestamp, DocumentReference, getFirestore, collectionGroup, query, where, getDocs } from "firebase/firestore";
import { CreateUserData, UpdateUserData, User } from "../_models/user";
import { uploadImageToStorage, deleteFileFromStorage } from "@/app/_services/StorageService";
import {
  getDocument,
  UpdateDocument,
  deleteDocument,
  getDocumentsInCollection,
  createDocument,
} from "../_services/FirestoreService";

const db = getFirestore(app);

export default class UserRepository {
  private static readonly COLLECTION_PATH = "users";

  // GET ========================================================
  static async getUserById(userId: string, docRef?: DocumentReference): Promise<User | null> {
    const userData = await getDocument(`/${this.COLLECTION_PATH}/${userId}`, docRef);
    if (!userData) return null;

    return userData as User;
  }

  // Récupère l'utilisateur actuellement connecté
  static async getCurrentUser(): Promise<User | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return await this.getUserById(currentUser.uid);
  }

  static async getAllUsers(limitCount?: number): Promise<User[]> {
    const users = await getDocumentsInCollection(this.COLLECTION_PATH, undefined, limitCount || 10);

    return users as User[];
  }

  // POST =======================================================
  static async createUser(userId: string, userData: CreateUserData): Promise<User> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");

    await createDocument(`${this.COLLECTION_PATH}/${userId}`, userData, true);

    return userData as User;
  }

  // PUT ========================================================
  static async updateUser(userId: string, updateData: UpdateUserData): Promise<User | null> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");

    await UpdateDocument(`/${this.COLLECTION_PATH}/${userId}`, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });

    return await this.getUserById(userId);
  }

  static async updateLastLogin(userId: string): Promise<void> {
    await UpdateDocument(`/${this.COLLECTION_PATH}/${userId}`, { lastLoginAt: Timestamp.now() });
  }

  static async uploadProfileImage(file: File, userId: string): Promise<StorageImage> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    if (!file.type.startsWith("image/")) throw new Error("Le fichier doit être une image");

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("La taille maximale du fichier est de 5 Mo");
    }

    const user = await this.getUserById(userId);

    if (user?.profileImage?.path) {
      try {
        await deleteFileFromStorage(user.profileImage.path);
      } catch (error) {
        if (process.env.NEXT_PUBLIC_IS_PROD !== "true") {
          alert("Erreur lors de la suppression de l'ancienne image de profil.");
        }
      }
    }

    const storagePath = `users/${userId}/profile`;
    const storageImage = await uploadImageToStorage(file, storagePath, `profile_${file.name}`);

    await this.updateUser(userId, {
      profileImage: storageImage,
      photoURL: storageImage.url,
    });

    return storageImage;
  }

  static async deleteProfileImage(userId: string): Promise<void> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");

    const user = await this.getUserById(userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    if (!user.profileImage || !user.profileImage.path) {
      throw new Error("Aucune image de profil à supprimer");
    }

    await deleteFileFromStorage(user.profileImage.path);

    await UpdateDocument(`/${this.COLLECTION_PATH}/${userId}`, {
      profileImage: null,
      photoURL: null,
    });
  }

  // DELETE =======================================================
  static async deleteUser(userId: string): Promise<void> {
    // TODO check role
    return deleteDocument(`/${this.COLLECTION_PATH}/${userId}`);
  }

  static async deleteCurrentUserAccount(): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Utilisateur non authentifié");

    const userId = currentUser.uid;
    const user = await this.getUserById(userId);

    // 1. Supprimer l'image de profil du storage si elle existe
    if (user?.profileImage?.path) {
      await this.deleteProfileImage(userId);
    }

    // 2. Supprimer le document Firestore
    await this.deleteUser(userId);
  }
}
