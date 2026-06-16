"use client";

import React, { useRef, useState } from "react";
import { GripVertical, Star, Trash2, ImagePlus } from "lucide-react";
import { StorageImage } from "@/app/_interfaces/storage";
import DropableZone, { DropZoneVariant, DropZoneSize } from "@/app/_components/ui/Forms/DropableZone";
import IconButton from "@/app/_components/ui/Buttons/IconButton";

interface ImageManagerProps {
  existingImages: StorageImage[];
  pendingFiles: File[];
  onExistingReorder: (reordered: StorageImage[]) => void;
  onExistingDelete: (imagePath: string) => void;
  onNewFiles: (files: File[]) => void;
  onPendingDelete: (index: number) => void;
}

export default function ImageManager({
  existingImages,
  pendingFiles,
  onExistingReorder,
  onExistingDelete,
  onNewFiles,
  onPendingDelete,
}: ImageManagerProps) {
  const dragIndex = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex.current === null || dragIndex.current === targetIndex) return;
    const reordered = [...existingImages];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(targetIndex, 0, moved);
    onExistingReorder(reordered);
    dragIndex.current = null;
  };

  return (
    <div className="space-y-4">
      {/* Existing images */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {existingImages.map((img, index) => (
            <div
              key={img.path}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square cursor-grab active:cursor-grabbing"
            >
              <img src={img.url} alt={img.altText ?? img.fileName} className="w-full h-full object-cover" />
              {/* Drag handle */}
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded p-0.5">
                <GripVertical className="w-4 h-4 text-white" />
              </div>
              {/* Main badge */}
              {index === 0 && (
                <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-semibold px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3" />
                  Principale
                </div>
              )}
              {/* Delete button */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton
                  onClick={() => onExistingDelete(img.path)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-1"
                  aria-label="Supprimer l'image"
                >
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending (new) files preview */}
      {pendingFiles.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Nouvelles images ({pendingFiles.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {pendingFiles.map((file, index) => (
              <div
                key={index}
                className="relative group rounded-xl overflow-hidden border-2 border-dashed border-blue-300 bg-blue-50 aspect-square"
              >
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton
                    onClick={() => onPendingDelete(index)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-1"
                    aria-label="Retirer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone */}
      <DropableZone
        onDrop={onNewFiles}
        accept="image/*"
        multiple
        maxFileSize={10}
        variant={DropZoneVariant.DASHED}
        size={DropZoneSize.MD}
        helperText="Glissez-déposez vos images ici"
      />
    </div>
  );
}
