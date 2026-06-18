"use client";

import React, { useState } from "react";
import { BikeType, Product } from "@/app/_models/product";
import { StorageImage } from "@/app/_interfaces/storage";
import PRODUCT_STATUS from "@/app/_data/product_status.json";
import OutlinedCard from "@/app/_components/ui/Cards/OutlinedCard";
import FormInput from "@/app/_components/ui/Forms/FormInput";
import FormTextarea from "@/app/_components/ui/Forms/FormTextarea";
import FilledButton from "@/app/_components/ui/Buttons/FilledButton";
import ImageManager from "./ImageManager";
import FormSelect from "@/app/_components/ui/Forms/FormSelect";
import { Column } from "@/app/_components/ui/Layout/Columns";
import { Plus, Trash2 } from "lucide-react";

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
  buyOnlineUrl: string;
  description: string;
  bikeType: BikeType[];
  variants: ProductVariantFormData[];
  tags: string;
}

export interface ProductVariantFormData {
  title: string;
  diameterValue: string;
  widthValue: string;
  unit: "mm" | "inches";
  isoSize: string;
  weight: string;
  barMinPressure: string;
  barMaxPressure: string;
  psiMinPressure: string;
  psiMaxPressure: string;
  bead: string;
  sidewallColor: string;
  priceEuros: string;
}

function createEmptyVariant(): ProductVariantFormData {
  return {
    title: "",
    diameterValue: "",
    widthValue: "",
    unit: "mm",
    isoSize: "",
    weight: "",
    barMinPressure: "",
    barMaxPressure: "",
    psiMinPressure: "",
    psiMaxPressure: "",
    bead: "",
    sidewallColor: "",
    priceEuros: "",
  };
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
      bikeType: [],
      variants: [],
      buyOnlineUrl: "",
      tags: "",
    };
  }

  return {
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    status: product.status as string,
    shortDescription: product.shortDescription,
    buyOnlineUrl: product.buyOnlineUrl ?? "",
    description: product.description,
    bikeType: product.bikeType,
    variants: (product.variants ?? []).map((variant) => ({
      title: variant.title,
      diameterValue: String(variant.dimension.diameter),
      widthValue: String(variant.dimension.width),
      unit: variant.dimension.unit,
      isoSize: variant.dimension.isoSize ?? "",
      weight: variant.weight ? String(variant.weight) : "",
      barMinPressure: variant.barMinPressure ? String(variant.barMinPressure) : "",
      barMaxPressure: variant.barMaxPressure ? String(variant.barMaxPressure) : "",
      psiMinPressure: variant.psiMinPressure ? String(variant.psiMinPressure) : "",
      psiMaxPressure: variant.psiMaxPressure ? String(variant.psiMaxPressure) : "",
      bead: variant.bead ?? "",
      sidewallColor: variant.sidewallColor ?? "",
      priceEuros: (variant.price / 100).toFixed(2),
    })),
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
  const [variantError, setVariantError] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<StorageImage[]>(initialData?.images ?? []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [deletedPaths, setDeletedPaths] = useState<string[]>([]);

  const set = (key: Exclude<keyof ProductFormData, "variants" | "bikeType">) => (value: string | number) =>
    setForm((f) => ({ ...f, [key]: value.toString() }));

  const setVariant = (index: number, key: keyof ProductVariantFormData, value: string | number) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((variant, i) => (i === index ? { ...variant, [key]: value.toString() } : variant)),
    }));
    setVariantError(null);
  };

  const addVariant = () => {
    setForm((f) => ({ ...f, variants: [...f.variants, createEmptyVariant()] }));
    setVariantError(null);
  };

  const removeVariant = (index: number) => {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== index) }));
    setVariantError(null);
  };

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
    const normalizedTitles = form.variants.map((v) => v.title.trim().toLowerCase()).filter(Boolean);
    const hasDuplicateTitles = new Set(normalizedTitles).size !== normalizedTitles.length;
    if (hasDuplicateTitles) {
      setVariantError("Chaque déclinaison doit avoir un titre unique.");
      return;
    }

    const hasMissingRequiredVariantField = form.variants.some(
      (variant) => !variant.title.trim() || !variant.priceEuros.toString().trim(),
    );
    if (hasMissingRequiredVariantField) {
      setVariantError("Chaque déclinaison doit avoir un titre et un prix.");
      return;
    }

    setVariantError(null);
    onSubmit(form, pendingFiles, existingImages, deletedPaths);
  };

  const statusItems = Object.values(PRODUCT_STATUS).map((s) => ({ id: s.value, label: s.label, value: s.value }));
  const unitItems = [
    { id: "mm", label: "mm", value: "mm" },
    { id: "inches", label: "pouces", value: "inches" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <Column className="flex-1 gap-4">
          {/* ── Général ── */}
          <OutlinedCard className="p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4!">Général</h3>
            <FormInput
              title="Nom du produit"
              value={form.name}
              setValue={set("name")}
              required
              id="name"
              className="w-full"
            />
            <FormInput
              title="Marque"
              value={form.brand}
              setValue={set("brand")}
              required
              id="brand"
              className="w-full"
            />
            <FormInput
              title="URL d'achat en ligne"
              value={form.buyOnlineUrl}
              setValue={set("buyOnlineUrl")}
              id="buyOnlineUrl"
              className="w-full"
              placeholder="https://example.com"
            />
            <FormSelect
              options={statusItems}
              title="Statut"
              onChange={(id) => set("status")(id)}
              value={form.status}
              id="status"
            />
          </OutlinedCard>

          {/* ── Descriptions ── */}
          <OutlinedCard className="p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4!">Descriptions</h3>
            <FormInput
              title="Résumé court"
              value={form.shortDescription}
              setValue={set("shortDescription")}
              required
              className="w-full"
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
            <FormInput
              title="Tags (séparés par des virgules)"
              value={form.tags}
              setValue={set("tags")}
              id="tags"
              className="w-full"
              placeholder="tubeless, slick, 700c"
            />
          </OutlinedCard>

          {/* ── Images ── */}
          <OutlinedCard className="p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4!">Images</h3>
            <ImageManager
              existingImages={existingImages}
              pendingFiles={pendingFiles}
              onExistingReorder={setExistingImages}
              onExistingDelete={handleExistingDelete}
              onNewFiles={(files) => setPendingFiles((prev) => [...prev, ...files])}
              onPendingDelete={handlePendingDelete}
            />
          </OutlinedCard>

          {/* ── Usage ── */}
          <OutlinedCard className="p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4!">Usage</h3>
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
          </OutlinedCard>
        </Column>

        <Column className="flex-1 gap-4">
          {/* ── Déclinaisons ── */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-gray-800">Déclinaisons</h3>
              <FilledButton type="button" hasIcon onClick={addVariant} className="py-2! px-3! text-sm!">
                <Plus className="w-4 h-4 shrink-0" />
                Ajouter une déclinaison
              </FilledButton>
            </div>
            {variantError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                {variantError}
              </div>
            )}
            {form.variants.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-sm text-gray-600">
                Aucune déclinaison pour le moment. Ajoutez-en une quand vous êtes prêt.
              </div>
            )}
            <div className="space-y-4">
              {form.variants.map((variant, index) => (
                <OutlinedCard key={index} className="p-4 space-y-4 border border-gray-200">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-gray-800">Déclinaison {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  </div>

                  <FormInput
                    title="Titre"
                    value={variant.title}
                    setValue={(value) => setVariant(index, "title", value)}
                    id={`variant-title-${index}`}
                    placeholder="25-622 (700x25HOOKED)"
                    required
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <FormInput
                      title="Diamètre"
                      value={variant.diameterValue}
                      setValue={(value) => setVariant(index, "diameterValue", value)}
                      type="number"
                      id={`variant-diameter-${index}`}
                    />
                    <FormInput
                      title="Largeur"
                      value={variant.widthValue}
                      setValue={(value) => setVariant(index, "widthValue", value)}
                      type="number"
                      id={`variant-width-${index}`}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                      <FormSelect
                        options={unitItems}
                        onChange={(id) => setVariant(index, "unit", id)}
                        value={variant.unit}
                        id={`variant-unit-${index}`}
                      />
                    </div>
                    <FormInput
                      title="ISO / ETRTO"
                      value={variant.isoSize}
                      setValue={(value) => setVariant(index, "isoSize", value)}
                      id={`variant-iso-${index}`}
                      placeholder="25-622"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      title="Poids (g)"
                      value={variant.weight}
                      setValue={(value) => setVariant(index, "weight", value)}
                      type="number"
                      id={`variant-weight-${index}`}
                    />
                    <FormInput
                      title="Tringles"
                      value={variant.bead}
                      setValue={(value) => setVariant(index, "bead", value)}
                      id={`variant-bead-${index}`}
                      placeholder="Foldable Bead"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <FormInput
                      title="Pression bar min"
                      value={variant.barMinPressure}
                      setValue={(value) => setVariant(index, "barMinPressure", value)}
                      type="number"
                      id={`variant-bar-min-${index}`}
                    />
                    <FormInput
                      title="Pression bar max"
                      value={variant.barMaxPressure}
                      setValue={(value) => setVariant(index, "barMaxPressure", value)}
                      type="number"
                      id={`variant-bar-max-${index}`}
                    />
                    <FormInput
                      title="Pression psi min"
                      value={variant.psiMinPressure}
                      setValue={(value) => setVariant(index, "psiMinPressure", value)}
                      type="number"
                      id={`variant-psi-min-${index}`}
                    />
                    <FormInput
                      title="Pression psi max"
                      value={variant.psiMaxPressure}
                      setValue={(value) => setVariant(index, "psiMaxPressure", value)}
                      type="number"
                      id={`variant-psi-max-${index}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormInput
                      title="Couleur des flancs"
                      value={variant.sidewallColor}
                      setValue={(value) => setVariant(index, "sidewallColor", value)}
                      id={`variant-sidewall-${index}`}
                      placeholder="BLACK"
                    />
                    <FormInput
                      title="Prix (€)"
                      value={variant.priceEuros}
                      setValue={(value) => setVariant(index, "priceEuros", value)}
                      type="number"
                      id={`variant-price-${index}`}
                      required
                      placeholder="29.99"
                    />
                  </div>
                </OutlinedCard>
              ))}
            </div>
          </div>
        </Column>
      </div>

      {/* ── Submit ── */}
      <div className="flex justify-end">
        <FilledButton type="submit" disabled={isLoading} className="min-w-36">
          {isLoading ? "Enregistrement…" : submitLabel}
        </FilledButton>
      </div>
    </form>
  );
}
