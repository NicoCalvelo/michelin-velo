"use client";

import React from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { ExperienceDocument } from "@/app/_models/experience";
import OutlinedCard from "@/app/_components/ui/Cards/OutlinedCard";
import IconButton from "@/app/_components/ui/Buttons/IconButton";

interface ExperienceCardProps {
  experience: ExperienceDocument;
  onDelete: (experience: ExperienceDocument) => void;
}

export default function ExperienceCard({ experience, onDelete }: ExperienceCardProps) {
  return (
    <OutlinedCard className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Produit #{experience.productId}</p>
          <h3 className="text-lg font-semibold text-gray-900">{experience.tireModel}</h3>
          <p className="text-sm text-gray-500 mt-1">{experience.slug}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            experience.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {experience.isPublished ? "Publié" : "Brouillon"}
        </span>
      </div>

      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600">
        {experience.blocks.length} bloc{experience.blocks.length > 1 ? "s" : ""}
      </div>

      <div className="flex items-center justify-end gap-1">
        <Link href={`/admin/experiences/${experience.productId}/edit`}>
          <IconButton tooltip="Modifier" className="text-gray-600 hover:text-primary-color hover:bg-primary-color/10">
            <Pencil className="w-4 h-4" />
          </IconButton>
        </Link>
        <IconButton
          tooltip="Supprimer"
          className="text-gray-600 hover:text-red-600 hover:bg-red-50"
          onClick={() => onDelete(experience)}
        >
          <Trash2 className="w-4 h-4" />
        </IconButton>
        <Link href={`/product/${experience.productId}`}>
          <IconButton tooltip="Voir la page produit" className="text-gray-600 hover:text-primary-color hover:bg-primary-color/10">
            <Eye className="w-4 h-4" />
          </IconButton>
        </Link>
      </div>
    </OutlinedCard>
  );
}
