"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImageOff } from "lucide-react";
import Spinner from "@/app/_components/ui/Components/Spinner";
import OutlinedCard from "@/app/_components/ui/Cards/OutlinedCard";
import ProductRepository from "@/app/_repositories/product_repository";
import ExperienceRepository from "@/app/_repositories/experience_repository";
import { Product } from "@/app/_models/product";
import { GridCols3 } from "@/app/_components/ui/Layout/Grids";
import OutlinedButton from "@/app/_components/ui/Buttons/OutlinedButton";

export default function NewExperiencePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [existingProductIds, setExistingProductIds] = useState<Set<string>>(new Set());
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [productsData, experiencesData] = await Promise.all([
          ProductRepository.getAllProducts(300),
          ExperienceRepository.getAllExperiences(300),
        ]);

        setProducts(productsData);
        const ids = new Set(experiencesData.map((experience) => experience.productId));
        setExistingProductIds(ids);

        const firstAvailable = productsData.find((product) => product.id && !ids.has(product.id));
        setSelectedProductId(firstAvailable?.id ?? "");
      } catch {
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const availableProducts = useMemo(
    () => products.filter((product) => product.id && !existingProductIds.has(product.id)),
    [products, existingProductIds],
  );

  const selectOptions = availableProducts.map((product) => ({
    value: product.id!,
    label: `${product.name} (${product.brand})`,
  }));

  const handleCreate = async () => {
    const selected = availableProducts.find((product) => product.id === selectedProductId);
    if (!selected || !selected.id) {
      setError("Sélectionne un produit valide.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const created = await ExperienceRepository.createExperience({
        productId: selected.id,
        tireModel: selected.name,
        slug: `experience-${selected.slug}`,
        metaTitle: `Expérience ${selected.name}`,
        metaDescription: selected.shortDescription,
        blocks: [],
        isPublished: false,
      });

      router.push(`/admin/experiences/${created.productId}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/experiences" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle expérience</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {availableProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-600">
          Tous les produits ont déjà une expérience associée.
        </div>
      ) : (
        <GridCols3 className="gap-4">
          {availableProducts.map((product) => {
            const mainImage = product.images?.[0];
            return (
              <OutlinedCard
                className="flex flex-row overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0!"
                key={product.id}
                onClick={() => setSelectedProductId(product.id!)}
              >
                {/* Image */}
                <div className="relative w-2/5 bg-gray-100">
                  {mainImage ? (
                    <img
                      src={mainImage.url}
                      alt={mainImage.altText ?? product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageOff className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-5 gap-1">
                  <p className="font-semibold text-gray-900 text-xl leading-snug line-clamp-2">{product.name}</p>
                  <p className="text-sm! text-gray-500">{product.shortDescription}</p>
                  <OutlinedButton onClick={handleCreate} disabled={submitting} className="mt-3 text-sm!">
                    <span>{submitting && selectedProductId === product.id ? "Création..." : "Créer l'expérience"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </OutlinedButton>
                </div>
              </OutlinedCard>
            );
          })}
        </GridCols3>
      )}
    </div>
  );
}
