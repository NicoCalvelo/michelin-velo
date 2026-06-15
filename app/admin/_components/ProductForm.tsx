"use client";

import React, { useState, useEffect } from "react";
import { BikeType, Product } from "@/app/_models/product";
import { StorageImage } from "@/app/_interfaces/storage";
import PRODUCT_STATUS from "@/app/_data/product_status.json";
import OutlinedCard from "@/app/_components/ui/Cards/OutlinedCard";
import FormInput from "@/app/_components/ui/Forms/FormInput";
import FormTextarea from "@/app/_components/ui/Forms/FormTextarea";
import Select from "@/app/_components/ui/Forms/Select";
import FilledButton from "@/app/_components/ui/Buttons/FilledButton";
import ImageManager from "./ImageManager";
import FormSelect from "@/app/_components/ui/Forms/FormSelect";

const BIKE_TYPE_OPTIONS: { value: BikeType; label: string }[] = [
  { value: "road", label: "Route" },
  { value: "mountain", label: "VTT" },
  { value: "gravel", label: "Gravel" },
  { value: "city", label: "Ville" },
  { value: "bmx", label: "BMX" },
  { value: "electric", label: "Électrique" },
];

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface ProductFormData {
  name: string;
  slug: string;
  brand: string;
  status: string;
  shortDescription: string;
  description: string;
  technicalDetails: string;
  bikeType: BikeType[];
  diameterValue: string;
  widthValue: string;
  unit: "mm" | "inches";
  isoSize: string;
  weight: string;
  minPressure: string;
  maxPressure: string;
  priceEuros: string;
  compareAtPriceEuros: string;
  stock: string;
  tags: string;
}

function toFormData(product?: Product): ProductFormData {
  if (!product) {
    return {
      name: "",
      slug: "",
      brand: "",
      status: "active",
      shortDescription: "",
      description: "",
      technicalDetails: "",
      bikeType: [],
      diameterValue: "",
      widthValue: "",
      unit: "mm",
      isoSize: "",
      weight: "",
      minPressure: "",
      maxPressure: "",
      priceEuros: "",
      compareAtPriceEuros: "",
      stock: "0",
      tags: "",
    };
  }
  return {
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    status: product.status as string,
    shortDescription: product.shortDescription,
    description: product.description,
    technicalDetails: product.technicalDetails ?? "",
    bikeType: product.bikeType,
    diameterValue: String(product.dimension.diameter),
    widthValue: String(product.dimension.width),
    unit: product.dimension.unit,
    isoSize: product.dimension.isoSize ?? "",
    weight: product.weight ? String(product.weight) : "",
    minPressure: product.minPressure ? String(product.minPressure) : "",
    maxPressure: product.maxPressure ? String(product.maxPressure) : "",
    priceEuros: (product.price / 100).toFixed(2),
    compareAtPriceEuros: product.compareAtPrice ? (product.compareAtPrice / 100).toFixed(2) : "",
    stock: String(product.stock),
    tags: (product.tags ?? []).join(", "),
  };
}

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (
    data: ProductFormData,
    pendingFiles: File[],
    existingImages: StorageImage[],
    deletedPaths: string[],
  ) => void;
  isLoading: boolean;
  submitLabel?: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Enregistrer",
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(toFormData(initialData));
  const [slugEdited, setSlugEdited] = useState(!!initialData);
  const [existingImages, setExistingImages] = useState<StorageImage[]>(initialData?.images ?? []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [deletedPaths, setDeletedPaths] = useState<string[]>([]);

  // Auto-generate slug from name unless user edited it manually
  useEffect(() => {
    if (!slugEdited) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
  }, [form.name, slugEdited]);

  const set = (key: keyof ProductFormData) => (value: string | number) =>
    setForm((f) => ({ ...f, [key]: value.toString() }));

  const toggleBikeType = (type: BikeType) => {
    setForm((f) => ({
      ...f,
      bikeType: f.bikeType.includes(type) ? f.bikeType.filter((t) => t !== type) : [...f.bikeType, type],
    }));
  };

  const handleExistingDelete = (path: string) => {
    setExistingImages((prev) => prev.filter((img) => img.path !== path));
    setDeletedPaths((prev) => [...prev, path]);
  };

  const handlePendingDelete = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form, pendingFiles, existingImages, deletedPaths);
  };

  const statusItems = Object.values(PRODUCT_STATUS).map((s) => ({ id: s.value, label: s.label, value: s.value }));
  const unitItems = [
    { id: "mm", label: "mm", value: "mm" },
    { id: "inches", label: "pouces", value: "inches" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Général ── */}
      <OutlinedCard className="p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Général</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput title="Nom du produit" value={form.name} setValue={set("name")} required id="name" />
          <FormInput title="Marque" value={form.brand} setValue={set("brand")} required id="brand" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            title="Slug (URL)"
            value={form.slug}
            setValue={(v) => {
              set("slug")(v);
              setSlugEdited(true);
            }}
            id="slug"
            supportingText="Auto-généré depuis le nom"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <FormSelect options={statusItems} onChange={(id) => set("status")(id)} value={form.status} id="status" />
          </div>
        </div>
      </OutlinedCard>

      {/* ── Descriptions ── */}
      <OutlinedCard className="p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Descriptions</h2>
        <FormInput
          title="Résumé court"
          value={form.shortDescription}
          setValue={set("shortDescription")}
          required
          id="shortDesc"
        />
        <FormTextarea
          title="Description longue"
          value={form.description}
          setValue={set("description")}
          required
          id="description"
          rows={5}
        />
        <FormTextarea
          title="Détails techniques"
          value={form.technicalDetails}
          setValue={set("technicalDetails")}
          id="technicalDetails"
          rows={3}
        />
      </OutlinedCard>

      {/* ── Fiche technique ── */}
      <OutlinedCard className="p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Fiche technique</h2>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Type de vélo *</p>
          <div className="flex flex-wrap gap-2">
            {BIKE_TYPE_OPTIONS.map((bt) => (
              <button
                key={bt.value}
                type="button"
                onClick={() => toggleBikeType(bt.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  form.bikeType.includes(bt.value)
                    ? "bg-primary-color text-primary-on border-primary-color"
                    : "bg-white text-gray-600 border-gray-300 hover:border-primary-color"
                }`}
              >
                {bt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FormInput
            title="Diamètre"
            value={form.diameterValue}
            setValue={set("diameterValue")}
            type="number"
            id="diameter"
          />
          <FormInput title="Largeur" value={form.widthValue} setValue={set("widthValue")} type="number" id="width" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
            <FormSelect options={unitItems} onChange={(id) => set("unit")(id)} value={form.unit} id="unit" />
          </div>
          <FormInput
            title="ISO / ETRTO"
            value={form.isoSize}
            setValue={set("isoSize")}
            id="isoSize"
            placeholder="25-622"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput title="Poids (g)" value={form.weight} setValue={set("weight")} type="number" id="weight" />
          <FormInput
            title="Pression min (bar)"
            value={form.minPressure}
            setValue={set("minPressure")}
            type="number"
            id="minPressure"
          />
          <FormInput
            title="Pression max (bar)"
            value={form.maxPressure}
            setValue={set("maxPressure")}
            type="number"
            id="maxPressure"
          />
        </div>
      </OutlinedCard>

      {/* ── Tarifs & stock ── */}
      <OutlinedCard className="p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Tarifs & stock</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            title="Prix (€)"
            value={form.priceEuros}
            setValue={set("priceEuros")}
            type="number"
            id="price"
            required
            placeholder="29.99"
          />
          <FormInput
            title="Prix barré (€)"
            value={form.compareAtPriceEuros}
            setValue={set("compareAtPriceEuros")}
            type="number"
            id="compareAtPrice"
            placeholder="39.99"
          />
          <FormInput title="Stock" value={form.stock} setValue={set("stock")} type="number" id="stock" required />
        </div>
        <FormInput
          title="Tags (séparés par des virgules)"
          value={form.tags}
          setValue={set("tags")}
          id="tags"
          placeholder="tubeless, slick, 700c"
        />
      </OutlinedCard>

      {/* ── Images ── */}
      <OutlinedCard className="p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Images</h2>
        <ImageManager
          existingImages={existingImages}
          pendingFiles={pendingFiles}
          onExistingReorder={setExistingImages}
          onExistingDelete={handleExistingDelete}
          onNewFiles={(files) => setPendingFiles((prev) => [...prev, ...files])}
          onPendingDelete={handlePendingDelete}
        />
      </OutlinedCard>

      {/* ── Submit ── */}
      <div className="flex justify-end">
        <FilledButton type="submit" disabled={isLoading} className="min-w-36">
          {isLoading ? "Enregistrement…" : submitLabel}
        </FilledButton>
      </div>
    </form>
  );
}
