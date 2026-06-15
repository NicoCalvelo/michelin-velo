import imageCompression from "browser-image-compression";

/**
 * Compresse une image pour qu'elle ne dépasse pas une taille maximale
 * @param file - Le fichier image à compresser
 * @param maxSizeMB - Taille maximale en MB (par défaut 5MB)
 * @param maxWidthOrHeight - Dimension maximale en pixels (par défaut 1920px)
 * @returns Le fichier compressé
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920
): Promise<File> {
  // Si le fichier est déjà plus petit que la taille max, on le retourne tel quel
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: file.type,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(
      `Image compressée: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
    );
    return compressedFile;
  } catch (error) {
    console.error("Erreur lors de la compression de l'image:", error);
    throw new Error("Impossible de compresser l'image");
  }
}

/**
 * Compresse une image avec des dimensions spécifiques
 * @param file - Le fichier image à compresser
 * @param maxWidth - Largeur maximale en pixels
 * @param maxHeight - Hauteur maximale en pixels
 * @param maxSizeMB - Taille maximale en MB (par défaut 5MB)
 * @returns Le fichier compressé
 */
export async function compressImageWithDimensions(
  file: File,
  maxWidth: number,
  maxHeight: number,
  maxSizeMB: number = 5
): Promise<File> {
  const options = {
    maxSizeMB,
    maxWidthOrHeight: Math.max(maxWidth, maxHeight),
    useWebWorker: true,
    fileType: file.type,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(
      `Image compressée: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
    );
    return compressedFile;
  } catch (error) {
    console.error("Erreur lors de la compression de l'image:", error);
    throw new Error("Impossible de compresser l'image");
  }
}

/**
 * Compresse une image pour un logo (format carré)
 * @param file - Le fichier image à compresser
 * @param maxSizeMB - Taille maximale en MB (par défaut 5MB)
 * @returns Le fichier compressé
 */
export async function compressLogo(file: File, maxSizeMB: number = 5): Promise<File> {
  return compressImageWithDimensions(file, 512, 512, maxSizeMB);
}

/**
 * Compresse une image pour un background (format paysage)
 * @param file - Le fichier image à compresser
 * @param maxSizeMB - Taille maximale en MB (par défaut 5MB)
 * @returns Le fichier compressé
 */
export async function compressBackground(file: File, maxSizeMB: number = 5): Promise<File> {
  return compressImageWithDimensions(file, 1536, 625, maxSizeMB);
}

/**
 * Vérifie si un fichier est une image
 * @param file - Le fichier à vérifier
 * @returns true si c'est une image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Formate la taille d'un fichier en format lisible
 * @param bytes - Taille en bytes
 * @returns Taille formatée (ex: "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
