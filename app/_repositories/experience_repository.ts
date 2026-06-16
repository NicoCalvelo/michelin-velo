import { Timestamp } from "firebase/firestore";
import { auth } from "@/app/_services/AuthService";
import {
  createDocument,
  deleteDocument,
  getDocument,
  getDocumentsInCollection,
  getDocumentsWhere,
  UpdateDocument,
} from "@/app/_services/FirestoreService";
import {
  CreateExperienceData,
  ExperienceBlock,
  ExperienceDocument,
  UpdateExperienceData,
} from "@/app/_models/experience";
import ProductRepository from "./product_repository";
import UserRepository from "./user_repository";
import { deleteFolderFromStorage, uploadImageToStorage } from "@/app/_services/StorageService";
import { StorageImage } from "@/app/_interfaces/storage";

function getRandomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeBlocks(blocks: ExperienceBlock[]): ExperienceBlock[] {
  const usedIds = new Set<string>();

  return blocks
    .map((block, index) => {
      let blockId = block.id?.trim();
      if (!blockId || usedIds.has(blockId)) {
        blockId = getRandomId();
      }
      usedIds.add(blockId);

      return {
        ...block,
        id: blockId,
        order: index,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((block, index) => ({ ...block, order: index }));
}

export default class ExperienceRepository {
  private static readonly COLLECTION_PATH = "experiences";

  private static async assertAdmin(): Promise<void> {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié");
    const isAdmin = await UserRepository.isAdmin(auth.currentUser.uid);
    if (!isAdmin) throw new Error("Permission refusée : réservé aux administrateurs");
  }

  static async getExperienceByProductId(productId: string): Promise<ExperienceDocument | null> {
    const data = await getDocument(`/${this.COLLECTION_PATH}/${productId}`);
    if (!data) return null;
    return data as ExperienceDocument;
  }

  static async getPublishedExperienceByProductId(productId: string): Promise<ExperienceDocument | null> {
    const experience = await this.getExperienceByProductId(productId);
    if (!experience || !experience.isPublished) return null;
    return experience;
  }

  static async getAllExperiences(limitCount?: number): Promise<ExperienceDocument[]> {
    const experiences = await getDocumentsInCollection(this.COLLECTION_PATH, undefined, limitCount);
    return experiences as ExperienceDocument[];
  }

  static async getPublishedExperiences(limitCount?: number): Promise<ExperienceDocument[]> {
    const experiences = await getDocumentsWhere(this.COLLECTION_PATH, "isPublished", "==", true, limitCount ?? null);
    return experiences as ExperienceDocument[];
  }

  static async createExperience(data: CreateExperienceData): Promise<ExperienceDocument> {
    await this.assertAdmin();

    const product = await ProductRepository.getProductById(data.productId);
    if (!product) throw new Error("Produit introuvable");

    const existing = await this.getExperienceByProductId(data.productId);
    if (existing) throw new Error("Une expérience existe déjà pour ce produit");

    const docData = {
      ...data,
      tireModel: data.tireModel || product.name,
      slug: data.slug || `experience-${product.slug}`,
      blocks: normalizeBlocks(data.blocks ?? []),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await createDocument(`/${this.COLLECTION_PATH}/${data.productId}`, docData, false);

    const created = await this.getExperienceByProductId(data.productId);
    if (!created) throw new Error("Impossible de créer l'expérience");

    return created;
  }

  static async updateExperience(productId: string, updateData: UpdateExperienceData): Promise<ExperienceDocument | null> {
    await this.assertAdmin();

    const current = await this.getExperienceByProductId(productId);
    if (!current) throw new Error("Expérience introuvable");

    const payload: UpdateExperienceData & { updatedAt: Timestamp } = {
      ...updateData,
      updatedAt: Timestamp.now(),
    };

    if (updateData.blocks) {
      payload.blocks = normalizeBlocks(updateData.blocks);
    }

    await UpdateDocument(`/${this.COLLECTION_PATH}/${productId}`, payload);
    return this.getExperienceByProductId(productId);
  }

  static async setPublished(productId: string, isPublished: boolean): Promise<ExperienceDocument | null> {
    return this.updateExperience(productId, { isPublished });
  }

  static async uploadBlockImage(productId: string, blockId: string, file: File): Promise<StorageImage> {
    await this.assertAdmin();

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) throw new Error("La taille maximale est de 10 Mo par image");

    const storagePath = `experiences/${productId}/blocks/${blockId}`;
    return uploadImageToStorage(file, storagePath);
  }

  static async deleteExperience(productId: string): Promise<void> {
    await this.assertAdmin();

    try {
      await deleteFolderFromStorage(`experiences/${productId}`);
    } catch {
      // Continuer même si le dossier n'existe pas
    }

    await deleteDocument(`/${this.COLLECTION_PATH}/${productId}`);
  }
}
