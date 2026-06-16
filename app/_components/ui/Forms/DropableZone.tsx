import React, { useCallback, useRef, useState, useMemo } from "react";
import { compressImage, isImageFile } from "@/app/_helpers/ImageHelper";

// Enum pour les variantes visuelles
export enum DropZoneVariant {
  OUTLINED = "outlined",
  FILLED = "filled",
  DASHED = "dashed",
}

// Enum pour les tailles
export enum DropZoneSize {
  SM = "sm",
  MD = "md",
  LG = "lg",
}

// Enum pour les états d'erreur
export enum DropZoneError {
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  TOO_MANY_FILES = "TOO_MANY_FILES",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  UPLOAD_FAILED = "UPLOAD_FAILED",
}

// Interface pour les erreurs de validation
export interface ValidationError {
  type: DropZoneError;
  message: string;
  file?: File;
}

// Interface pour les props du composant
interface DropableZoneProps {
  className?: string;
  children?: React.ReactNode;
  onDrop: (files: File[]) => void;
  onError?: (error: Error) => void;
  onValidationError?: (errors: ValidationError[]) => void;
  onDragEnter?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void;
  id?: string;
  accept?: string | string[];
  multiple?: boolean;
  disabled?: boolean;
  maxFileSize?: number;
  maxFiles?: number;
  variant?: DropZoneVariant;
  size?: DropZoneSize;
  errorMessage?: string;
  helperText?: string;
  ariaLabel?: string;
  name?: string;
  srcPreview?: string; // Added 'srcPreview' to the DropableZoneProps interface to ensure it is defined.
}

// Configuration des tailles
interface SizeConfig {
  padding: string;
  minHeight: string;
  maxHeight: string;
  textSize: string;
}

// Configuration des variantes
interface VariantConfig {
  base: string;
  normal: string;
  hover: string;
  active: string;
  error: string;
  disabled: string;
}

// Utilitaires pour la validation des fichiers
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const validateFileType = (file: File, acceptedTypes: string[]): boolean => {
  if (!acceptedTypes || acceptedTypes.includes("*")) return true;

  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  return acceptedTypes.some((accept) => {
    if (accept.startsWith(".")) {
      return fileName.endsWith(accept.toLowerCase());
    }
    if (accept.includes("/")) {
      return fileType === accept || fileType.startsWith(accept.replace("*", ""));
    }
    return false;
  });
};

export default function DropableZone({
  className = "",
  children,
  onDrop,
  onError,
  onValidationError,
  onDragEnter,
  onDragLeave,
  id,
  accept = "*",
  multiple = false,
  disabled = false,
  maxFileSize = 5 * 1024 * 1024, // 5MB par défaut
  maxFiles = multiple ? 10 : 1,
  variant = DropZoneVariant.DASHED,
  size = DropZoneSize.MD,
  errorMessage,
  helperText = "Glissez vos fichiers ici ou cliquez pour parcourir",
  ariaLabel,
  name,
  srcPreview,
}: DropableZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [currentError, setCurrentError] = useState<string | null>(null);

  // Configuration des tailles
  const sizeConfig = useMemo((): SizeConfig => {
    switch (size) {
      case DropZoneSize.SM:
        return { padding: "p-3", minHeight: "min-h-32", textSize: "text-xs", maxHeight: "max-h-48" };
      case DropZoneSize.LG:
        return { padding: "p-8", minHeight: "min-h-96", textSize: "text-base", maxHeight: "max-h-96" };
      default:
        return { padding: "p-5", minHeight: "min-h-64", textSize: "text-sm", maxHeight: "max-h-64" };
    }
  }, [size]);

  // Configuration des variants
  const variantConfig = useMemo((): VariantConfig => {
    const baseClasses = "transition-all duration-200 ease-in-out border-2 rounded";

    switch (variant) {
      case DropZoneVariant.OUTLINED:
        return {
          base: `${baseClasses} border-solid`,
          normal: "border-gray-300 bg-transparent",
          hover: "border-primary-color bg-primary-color/10",
          active: "border-primary-color bg-primary-color",
          error: "border-error-color bg-error-light/50",
          disabled: "border-gray-200 bg-gray-50 opacity-50",
        };
      case DropZoneVariant.FILLED:
        return {
          base: `${baseClasses} border-solid`,
          normal: "border-gray-200 bg-gray-50",
          hover: "border-primary-color bg-primary-color/10",
          active: "border-primary-color bg-primary-color",
          error: "border-error-color bg-error-light",
          disabled: "border-gray-200 bg-gray-100 opacity-50",
        };
      default: // DASHED
        return {
          base: `${baseClasses} border-dashed`,
          normal: "border-gray-300 bg-transparent",
          hover: "border-primary-color bg-primary-color/10",
          active: "border-primary-color bg-primary-color border-solid",
          error: "border-error-color bg-error-light/50",
          disabled: "border-gray-200 bg-gray-50 opacity-50",
        };
    }
  }, [variant]);

  // Traitement et validation des fichiers
  const processFiles = useCallback(
    async (files: FileList): Promise<{ validFiles: File[]; errors: ValidationError[] }> => {
      try {
        const fileArray = Array.from(files);
        const errors: ValidationError[] = [];
        const validFiles: File[] = [];

        // Validation du nombre de fichiers
        if (!multiple && fileArray.length > 1) {
          errors.push({
            type: DropZoneError.TOO_MANY_FILES,
            message: "Un seul fichier est autorisé",
          });
          return { validFiles: [], errors };
        }

        if (multiple && fileArray.length > maxFiles) {
          errors.push({
            type: DropZoneError.TOO_MANY_FILES,
            message: `Maximum ${maxFiles} fichiers autorisés`,
          });
          return { validFiles: [], errors };
        }

        // Validation de chaque fichier
        for (const file of fileArray) {
          // Validation du type en premier
          const acceptedTypes = Array.isArray(accept) ? accept : accept.split(",").map((s) => s.trim());
          if (!validateFileType(file, acceptedTypes)) {
            errors.push({
              type: DropZoneError.INVALID_FILE_TYPE,
              message: `${file.name} n'est pas un type de fichier autorisé`,
              file,
            });
            continue;
          }

          let processedFile = file;

          // Compression automatique des images si nécessaire
          if (isImageFile(file) && file.size > maxFileSize) {
            try {
              const compressedFile = await compressImage(file, maxFileSize / (1024 * 1024)); // Convertir maxFileSize en MB pour la fonction de compression

              // Créer un nouveau File avec le nom original pour préserver les métadonnées
              processedFile = new File([compressedFile], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
            } catch (compressionError) {
              console.error("Erreur lors de la compression:", compressionError);
              errors.push({
                type: DropZoneError.UPLOAD_FAILED,
                message: `Impossible de compresser ${file.name}`,
                file,
              });
              continue;
            }
          }

          // Vérifier la taille finale après compression
          if (processedFile.size > maxFileSize * 2) {
            errors.push({
              type: DropZoneError.FILE_TOO_LARGE,
              message: `${file.name} est trop volumineux même après compression (${formatFileSize(
                processedFile.size,
              )}). Taille maximum: ${formatFileSize(maxFileSize * 2)}`,
              file,
            });
            continue;
          }

          validFiles.push(processedFile);
        }

        return { validFiles, errors };
      } catch (error) {
        console.error("Error processing files:", error);
        return {
          validFiles: [],
          errors: [
            {
              type: DropZoneError.UPLOAD_FAILED,
              message: "Erreur lors du traitement des fichiers",
            },
          ],
        };
      }
    },
    [accept, maxFileSize, maxFiles, multiple],
  );

  // Gestionnaire de drop
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      setIsDragActive(false);
      setCurrentError(null);

      const files = "dataTransfer" in e ? e.dataTransfer?.files : e.target.files;
      if (!files || files.length === 0) return;

      const { validFiles, errors } = await processFiles(files);

      if (errors.length > 0) {
        const errorMsg = errors.map((err: ValidationError) => err.message).join(", ");
        setCurrentError(errorMsg);

        if (onValidationError) {
          onValidationError(errors);
        }
        if (onError) {
          onError(new Error(errorMsg));
        }
        return;
      }

      if (validFiles.length > 0 && onDrop) {
        try {
          onDrop(validFiles);
        } catch (error) {
          console.error("Error in onDrop callback:", error);
          setCurrentError("Erreur lors du traitement des fichiers");
          if (onError) {
            onError(error as Error);
          }
        }
      }

      // Reset du input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [disabled, processFiles, onDrop, onValidationError, onError],
  );

  // Gestionnaires de drag
  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      setIsDragActive(true);
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragActive(true);
        if (onDragEnter) {
          onDragEnter(e);
        }
      }
    },
    [disabled, onDragEnter],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      setIsDragActive(false);
      if (onDragLeave) {
        onDragLeave(e);
      }
    },
    [disabled, onDragLeave],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Gestionnaire de clic
  const handleClick = useCallback(() => {
    if (disabled || !fileInputRef.current) return;

    setCurrentError(null);
    fileInputRef.current.click();
  }, [disabled]);

  // Gestionnaire de clavier
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
      if (e.key === "Escape") {
        setIsDragActive(false);
        setCurrentError(null);
      }
    },
    [disabled, handleClick],
  );

  // Classes CSS finales
  const getDropZoneClasses = useCallback((): string => {
    const config = variantConfig;
    let classes = `${config.base} ${sizeConfig.padding} ${sizeConfig.minHeight} w-full cursor-pointer`;

    if (srcPreview !== undefined && srcPreview !== "") {
      classes += " !p-0 overflow-hidden";
    }

    if (disabled) {
      classes += ` ${config.disabled} cursor-not-allowed`;
    } else if (currentError) {
      classes += ` ${config.error}`;
    } else if (isDragActive) {
      classes += ` ${config.active}`;
    } else {
      classes += ` ${config.normal} hover:${config.hover.split(" ").join(" hover:")}`;
    }

    return `${classes} ${className}`;
  }, [variantConfig, sizeConfig, disabled, currentError, isDragActive, className, srcPreview]);

  // ID unique
  const dropZoneId = useMemo((): string => {
    return id || `dropzone-${Math.random().toString(36).substring(2, 11)}`;
  }, [id]);

  const acceptString = useMemo((): string => {
    if (Array.isArray(accept)) {
      return accept.join(",");
    }
    return accept;
  }, [accept]);

  // Added a fallback for 'srcPreview' to ensure it is defined before usage.
  const safeSrcPreview = srcPreview || "";

  return (
    <>
      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleDrop}
        accept={acceptString}
        multiple={multiple}
        name={name}
        aria-hidden="true"
      />

      {/* Zone de drop */}
      <div
        ref={dropZoneRef}
        id={dropZoneId}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel || `Zone de téléchargement de fichiers. ${multiple ? "Plusieurs fichiers" : "Un fichier"} autorisé(s). ${helperText}`}
        aria-describedby={currentError ? `${dropZoneId}-error` : `${dropZoneId}-helper`}
        aria-disabled={disabled}
        className={`flex flex-col items-center justify-center text-center ${getDropZoneClasses()}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {safeSrcPreview && !isDragActive && !currentError ? (
          <div className={"w-full h-full "}>
            <img src={safeSrcPreview} alt="Prévisualisation de l'image existante" className="w-full h-full object-cover rounded" />
          </div>
        ) : (
          <>
            {/* Icône principale */}
            {isDragActive ? (
              <svg className="w-12 h-12 text-primary-color animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            ) : currentError ? (
              <svg className="w-12 h-12 text-error-color" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg
                className={`w-12 h-12 ${disabled ? "text-gray-400" : "text-gray-500"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}

            {/* Contenu personnalisé ou texte par défaut */}
            {children ? (
              children
            ) : (
              <div className={`${sizeConfig.textSize} space-y-2 flex flex-col items-center justify-center text-center`}>
                {isDragActive ? (
                  <p className="font-medium text-primary-color">Déposez vos fichiers ici</p>
                ) : currentError ? (
                  <p className="font-medium text-red-600">Erreur de téléchargement</p>
                ) : (
                  <>
                    <p className={`font-medium ${disabled ? "text-gray-400" : "text-gray-600"}`}>
                      {srcPreview ? "Cliquez pour remplacer l'image" : helperText}
                    </p>
                    {!disabled && (
                      <p className="text-xs text-gray-500">
                        {multiple ? `Maximum ${maxFiles} fichiers` : "Un seul fichier"} • Taille max: {formatFileSize(maxFileSize)}
                        {acceptString !== "*" && ` • Types: ${acceptString}`}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Messages d'aide et d'erreur */}
      <div className="mt-2">
        {currentError && (
          <div id={`${dropZoneId}-error`} className="flex items-center space-x-2 text-red-600 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{currentError}</span>
          </div>
        )}

        {!currentError && errorMessage && (
          <div id={`${dropZoneId}-error`} className="flex items-center space-x-2 text-red-600 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </>
  );
}
