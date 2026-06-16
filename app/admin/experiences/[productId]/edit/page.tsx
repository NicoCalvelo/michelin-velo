"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Spinner from "@/app/_components/ui/Components/Spinner";
import FilledButton from "@/app/_components/ui/Buttons/FilledButton";
import OutlinedButton from "@/app/_components/ui/Buttons/OutlinedButton";
import ExperienceRepository from "@/app/_repositories/experience_repository";
import ProductRepository from "@/app/_repositories/product_repository";
import { ExperienceDocument } from "@/app/_models/experience";
import ExperienceBlocksEditor from "@/app/admin/_components/ExperienceBlocksEditor";

export default function EditExperiencePage() {
  const router = useRouter();
  const { productId } = useParams<{ productId: string }>();
  const [experience, setExperience] = useState<ExperienceDocument | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [expData, productData] = await Promise.all([
          ExperienceRepository.getExperienceByProductId(productId),
          ProductRepository.getProductById(productId),
        ]);

        if (!expData) {
          setError("Expérience introuvable.");
        } else {
          setExperience(expData);
        }

        setProductName(productData?.name ?? expData?.tireModel ?? "");
      } catch {
        setError("Impossible de charger l'expérience.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [productId]);

  const canPublish = useMemo(() => {
    if (!experience) return false;
    return (
      experience.metaTitle.trim().length > 0 &&
      experience.metaDescription.trim().length > 0 &&
      experience.blocks.length > 0
    );
  }, [experience]);

  const updateExperienceState = (patch: Partial<ExperienceDocument>) => {
    setExperience((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleUploadImage = async (
    blockId: string,
    field: "avatarUrl" | "trackMapImage" | "imageUrl" | "mapImageUrl",
    file: File,
  ) => {
    if (!experience) return;

    const uploaded = await ExperienceRepository.uploadBlockImage(experience.productId, blockId, file);
    const updatedBlocks = experience.blocks.map((block) =>
      block.id === blockId ? ({ ...block, [field]: uploaded.url } as typeof block) : block,
    );

    updateExperienceState({ blocks: updatedBlocks });
  };

  const handleSave = async () => {
    if (!experience) return;

    try {
      setSaving(true);
      setError(null);

      const updated = await ExperienceRepository.updateExperience(experience.productId, {
        tireModel: experience.tireModel,
        slug: experience.slug,
        metaTitle: experience.metaTitle,
        metaDescription: experience.metaDescription,
        blocks: experience.blocks,
        isPublished: experience.isPublished,
      });

      if (updated) {
        setExperience(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublication = async () => {
    if (!experience) return;

    try {
      setSaving(true);
      const updated = await ExperienceRepository.setPublished(experience.productId, !experience.isPublished);
      if (updated) setExperience(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de modifier le statut de publication.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="space-y-4">
        <Link href="/admin/experiences" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error ?? "Expérience introuvable"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/experiences" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl! font-bold text-gray-900">Expérience produit</h1>
            <p className="text-sm text-gray-500 mt-0.5">{productName || experience.tireModel}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilledButton type="button" hasIcon onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </FilledButton>
          <FilledButton
            type="button"
            onClick={togglePublication}
            disabled={saving || (!experience.isPublished && !canPublish)}
          >
            {experience.isPublished ? "Dépublier" : "Publier"}
          </FilledButton>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <ExperienceBlocksEditor
        blocks={experience.blocks}
        onChange={(blocks) => updateExperienceState({ blocks })}
        onUploadImage={handleUploadImage}
        disabled={saving}
      />

      <div className="flex justify-end gap-2">
        <OutlinedButton type="button" onClick={() => router.push("/admin/experiences")}>
          Retour à la liste
        </OutlinedButton>
        <FilledButton type="button" hasIcon onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </FilledButton>
      </div>
    </div>
  );
}
