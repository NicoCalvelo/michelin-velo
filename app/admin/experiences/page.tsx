"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import SearchBar from "@/app/_components/ui/Components/SearchBar";
import Spinner from "@/app/_components/ui/Components/Spinner";
import FilledButton from "@/app/_components/ui/Buttons/FilledButton";
import { showDangerConfirmationModal } from "@/app/_components/ui/Dialogs/ConfirmationModal";
import ExperienceRepository from "@/app/_repositories/experience_repository";
import { ExperienceDocument } from "@/app/_models/experience";
import ExperienceCard from "./_components/ExperienceCard";

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<ExperienceDocument[]>([]);
  const [filtered, setFiltered] = useState<ExperienceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExperienceRepository.getAllExperiences(300);
      const sorted = [...data].sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds);
      setExperiences(sorted);
      setFiltered(sorted);
    } catch {
      setError("Impossible de charger les expériences.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (query: string) => {
    const q = query.toLowerCase();
    setFiltered(
      experiences.filter(
        (experience) =>
          experience.tireModel.toLowerCase().includes(q) ||
          experience.slug.toLowerCase().includes(q) ||
          experience.productId.toLowerCase().includes(q),
      ),
    );
  };

  const handleDelete = async (experience: ExperienceDocument) => {
    try {
      await showDangerConfirmationModal(
        `Supprimer l'expérience de ${experience.tireModel} ?`,
        "Cette action est irréversible. Les images associées seront supprimées.",
        "Annuler",
        "Supprimer",
      );
      await ExperienceRepository.deleteExperience(experience.productId);
      setExperiences((prev) => prev.filter((item) => item.productId !== experience.productId));
      setFiltered((prev) => prev.filter((item) => item.productId !== experience.productId));
    } catch {
      // Action annulée
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expériences</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {experiences.length} expérience{experiences.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/experiences/new">
          <FilledButton hasIcon>
            <Plus className="w-4 h-4 shrink-0" />
            Créer une expérience
          </FilledButton>
        </Link>
      </div>

      <SearchBar onChange={handleSearch} placeholder="Rechercher par produit, slug ou ID…" />

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Aucune expérience trouvée</p>
          <p className="text-sm mt-1">Modifie ta recherche ou crée une expérience.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((experience) => (
            <ExperienceCard key={experience.productId} experience={experience} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
