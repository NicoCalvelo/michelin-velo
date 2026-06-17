"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Product, BikeType } from "@/app/_models/product";
import { StorageImage } from "@/app/_interfaces/storage";
import ProductRepository from "@/app/_repositories/product_repository";
import ProductForm, { ProductFormData } from "@/app/admin/_components/ProductForm";
import Spinner from "@/app/_components/ui/Components/Spinner";

function buildUpdateData(form: ProductFormData, existingImages: StorageImage[]) {
  const variants = form.variants.map((variant) => ({
    title: variant.title.trim(),
    dimension: {
      diameter: Number(variant.diameterValue),
      width: Number(variant.widthValue),
      unit: variant.unit,
      isoSize: variant.isoSize || undefined,
    },
    weight: variant.weight ? Number(variant.weight) : undefined,
    barMinPressure: variant.barMinPressure ? Number(variant.barMinPressure) : undefined,
    barMaxPressure: variant.barMaxPressure ? Number(variant.barMaxPressure) : undefined,
    psiMinPressure: variant.psiMinPressure ? Number(variant.psiMinPressure) : undefined,
    psiMaxPressure: variant.psiMaxPressure ? Number(variant.psiMaxPressure) : undefined,
    bead: variant.bead || undefined,
    sidewallColor: variant.sidewallColor || undefined,
    price: Math.round(Number(variant.priceEuros) * 100),
  }));

  return {
    name: form.name,
    slug: form.slug,
    brand: form.brand,
    shortDescription: form.shortDescription,
    description: form.description,
    bikeType: form.bikeType as BikeType[],
    variants,
    tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    images: existingImages,
  };
}

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    ProductRepository.getProductById(id)
      .then((p) => {
        if (!p) setLoadError("Produit introuvable.");
        else setProduct(p);
      })
      .catch(() => setLoadError("Impossible de charger le produit."));
  }, [id]);

  const handleSubmit = async (
    form: ProductFormData,
    pendingFiles: File[],
    existingImages: StorageImage[],
    deletedPaths: string[],
  ) => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      // 1. Delete removed images from Storage
      for (const path of deletedPaths) {
        await ProductRepository.deleteProductImage(id, path);
      }
      // 2. Update product fields + existing images order
      await ProductRepository.updateProduct(id, buildUpdateData(form, existingImages));
      // 3. Upload new files
      for (const file of pendingFiles) {
        await ProductRepository.uploadProductImage(id, file);
      }
      router.push("/admin/products");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setIsLoading(false);
    }
  };

  if (loadError) {
    return (
      <div className="space-y-4">
        <Link href="/admin/products" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{loadError}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier le produit</h1>
          <p className="text-sm text-gray-500 mt-0.5">{product.name}</p>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{submitError}</div>
      )}

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
