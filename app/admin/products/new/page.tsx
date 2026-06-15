"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProductRepository from "@/app/_repositories/product_repository";
import ProductForm, { ProductFormData } from "@/app/admin/_components/ProductForm";
import { StorageImage } from "@/app/_interfaces/storage";
import { BikeType } from "@/app/_models/product";

function buildCreateData(form: ProductFormData) {
  return {
    name: form.name,
    slug: form.slug,
    brand: form.brand,
    status: form.status as "active" | "archived" | "out_of_stock",
    shortDescription: form.shortDescription,
    description: form.description,
    technicalDetails: form.technicalDetails || undefined,
    bikeType: form.bikeType as BikeType[],
    dimension: {
      diameter: Number(form.diameterValue),
      width: Number(form.widthValue),
      unit: form.unit,
      isoSize: form.isoSize || undefined,
    },
    weight: form.weight ? Number(form.weight) : undefined,
    minPressure: form.minPressure ? Number(form.minPressure) : undefined,
    maxPressure: form.maxPressure ? Number(form.maxPressure) : undefined,
    price: Math.round(Number(form.priceEuros) * 100),
    compareAtPrice: form.compareAtPriceEuros ? Math.round(Number(form.compareAtPriceEuros) * 100) : undefined,
    stock: Number(form.stock),
    tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    images: [] as StorageImage[],
  };
}

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    form: ProductFormData,
    pendingFiles: File[],
    _existingImages: StorageImage[],
    _deletedPaths: string[],
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const product = await ProductRepository.createProduct(buildCreateData(form));
      // Upload images sequentially
      for (const file of pendingFiles) {
        await ProductRepository.uploadProductImage(product.id!, file);
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau produit</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <ProductForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Créer le produit" />
    </div>
  );
}
