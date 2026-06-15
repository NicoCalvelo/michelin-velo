import { auth } from "./AuthService";
import { Timestamp } from "firebase/firestore";
import { StorageFile, StorageImage } from "../_interfaces/storage";
import { app } from "@/app/_providers/FirebaseProvider";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
  listAll,
  FirebaseStorage,
  StorageReference,
  UploadResult,
} from "firebase/storage";

const storage: FirebaseStorage = getStorage(app);

export function uploadImageToStorage(file: File, storagePath?: string, customFileName?: string): Promise<StorageImage> {
  return new Promise(async (resolve, reject) => {
    if (!file.type.startsWith("image/")) throw new Error("Le fichier doit être une image");

    try {
      let fileName: string;
      if (customFileName) {
        fileName = customFileName;
      } else {
        // Générer un nom de fichier unique pour éviter les conflits
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        fileName = `${timestamp}_${randomString}.${fileExtension}`;
      }

      const currentUser = auth.currentUser;
      if (currentUser == null) throw new Error("Utilisateur non authentifié");

      // Utiliser le chemin fourni ou le chemin par défaut
      // Normaliser le chemin pour éviter les doubles slashes
      let finalPath: string;
      if (storagePath) {
        const normalizedPath = storagePath.endsWith("/") ? storagePath.slice(0, -1) : storagePath;
        finalPath = `${normalizedPath}/${fileName}`;
      } else {
        finalPath = `images/${fileName}`;
      }

      const storageRef = ref(storage, finalPath);

      const snapshot: UploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const storageImage: StorageImage = {
        url: downloadURL,
        path: finalPath,
        width: 0,
        height: 0,
        fileName: fileName,
        size: file.size,
        uploadedAt: Timestamp.now(),
        uploadedBy: currentUser?.uid,
      };

      const newImg = new Image();
      newImg.onload = function () {
        storageImage.height = newImg.height;
        storageImage.width = newImg.width;

        // Générer un tiny thumbnail base64 (25x25px) pour le blur placeholder
        try {
          const canvas = document.createElement("canvas");
          const BLUR_SIZE = 50;
          canvas.width = BLUR_SIZE;
          canvas.height = BLUR_SIZE;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(newImg, 0, 0, BLUR_SIZE, BLUR_SIZE);
            storageImage.blurDataURL = canvas.toDataURL("image/jpeg", 0.5);
          }
        } catch {
          // Ignore — blur placeholder optionnel
        }

        resolve(storageImage);
      };

      newImg.onerror = function (err) {
        console.warn("Impossible de charger l'image pour obtenir ses dimensions, on retourne quand même l'URL.", err);
        // Fallback: resolve even if dimensions couldn't be measured
        resolve(storageImage);
      };

      // Start loading after handlers set
      newImg.src = downloadURL;
    } catch (error) {
      if (process.env.NEXT_PUBLIC_IS_PROD !== "true") {
        console.error("Erreur lors de l'upload de l'image:", error);
      }
      reject(error);
    }
  });
}

/**
 * Upload un fichier générique (PDF, CSV, etc.) dans Firebase Storage
 * @param file - Le fichier à uploader
 * @param storagePath - Le dossier de destination (ex: "payments/abc123")
 * @param customFileName - Nom de fichier personnalisé (optionnel)
 * @returns StorageFile avec l'URL de téléchargement
 */
export async function uploadFileToStorage(
  file: File,
  storagePath: string,
  customFileName?: string,
): Promise<StorageFile> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Utilisateur non authentifié");

  let fileName: string;
  if (customFileName) {
    fileName = customFileName;
  } else {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "bin";
    fileName = `${timestamp}_${randomString}.${fileExtension}`;
  }

  const normalizedPath = storagePath.endsWith("/") ? storagePath.slice(0, -1) : storagePath;
  const finalPath = `${normalizedPath}/${fileName}`;

  const storageRef = ref(storage, finalPath);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    url,
    path: finalPath,
    fileName,
    mimeType: file.type || undefined,
    size: file.size,
    uploadedAt: Timestamp.now(),
    uploadedBy: currentUser.uid,
  };
}

/**
 * Déclenche le téléchargement d'un fichier dans le navigateur
 * @param file - L'interface StorageFile (doit avoir une url)
 * @param fileName - Nom de fichier à utiliser pour le download (optionnel, utilise file.fileName par défaut)
 */
export function downloadStorageFile(file: StorageFile, fileName?: string): void {
  const link = document.createElement("a");
  link.href = file.url;
  link.download = fileName ?? file.fileName;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Supprime un fichier du stockage Firebase
 * @param filePath - Le chemin du fichier à supprimer
 * @returns Promise<void>
 */
export function deleteFileFromStorage(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Nettoyer le chemin (enlever le / initial si présent)
      const cleanPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
      const storageRef = ref(storage, cleanPath);

      deleteObject(storageRef).then(resolve);
    } catch (error) {
      if (process.env.NEXT_PUBLIC_IS_PROD !== "true") {
        console.error("Erreur lors de la suppression du fichier:", error);
      }
      reject(error);
    }
  });
}

/**
 * Permets de supprimer un dossier entier dans Firebase Storage
 * @param folderPath Le chemin du dossier à supprimer
 * @returns Promise<void>
 */
export function deleteFolderFromStorage(folderPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // check if folder exists
    if (!folderPath || folderPath.trim() === "") {
      reject(new Error("Le chemin du dossier ne peut pas être vide"));
      return;
    }

    const storageRef = ref(storage, folderPath);

    if (!storageRef) {
      resolve();
      return;
    }

    try {
      const recursiveDelete = async (ref: StorageReference) => {
        const listResult = await listAll(ref);
        const deletePromises = listResult.items.map((item) => deleteObject(item));
        await Promise.all(deletePromises);
        const prefixPromises = listResult.prefixes.map((prefix) => recursiveDelete(prefix));
        await Promise.all(prefixPromises);
      };

      recursiveDelete(storageRef).then(resolve).catch(reject);
    } catch (error) {
      if (process.env.NEXT_PUBLIC_IS_PROD !== "true") {
        console.error("Erreur lors de la suppression du dossier:", error);
      }
      reject(error);
    }
  });
}

// Type pour les images sérialisées (sans Timestamp Firestore)
export type SerializedStorageImage = Omit<StorageImage, "uploadedAt"> & {
  uploadedAt?: {
    seconds: number;
    nanoseconds: number;
  };
};

/**
 * Sérialise les images pour les composants clients
 * Convertit les Timestamps Firestore en objets simples
 */
export function serializeImages(images: StorageImage[] | undefined): SerializedStorageImage[] {
  if (!images || images.length === 0) return [];

  return images.map((image) => ({
    ...image,
    uploadedAt: image.uploadedAt
      ? {
          seconds: image.uploadedAt.seconds,
          nanoseconds: image.uploadedAt.nanoseconds,
        }
      : undefined,
  })) as SerializedStorageImage[];
}
