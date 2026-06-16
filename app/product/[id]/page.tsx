"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowLeft, CheckCircle2, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import ExperienceRenderer from "@/app/_components/experience/ExperienceRenderer";
import { ExperienceDocument } from "@/app/_models/experience";
import { Product } from "@/app/_models/product";
import FilledButton from "@/app/_components/ui/Buttons/FilledButton";
import OutlinedButton from "@/app/_components/ui/Buttons/OutlinedButton";
import Spinner from "@/app/_components/ui/Components/Spinner";
import PublicProductCard from "../_components/PublicProductCard";
import {
  formatDimension,
  formatPressure,
  formatPrice,
  getFirstAvailableVariant,
  getProductVariants,
} from "../_utils/productDisplay";

function getPractice(product: Product) {
  const bikeTypes = product.bikeType ?? [];
  const labels: Record<string, string> = {
    road: "Route",
    mountain: "VTT",
    gravel: "Gravel",
    city: "Ville",
    bmx: "BMX",
    electric: "E-bike",
  };

  if (bikeTypes.length === 0) return "Usage à confirmer";

  return bikeTypes.map((type) => labels[type] ?? type).join(" / ");
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [product, setProduct] = useState<Product | null>(null);
  const [experience, setExperience] = useState<ExperienceDocument | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [usesMockData, setUsesMockData] = useState(false);
  const [selectedVariantTitle, setSelectedVariantTitle] = useState("");

  useEffect(() => {
    if (!id) return;
    const productId = id;

    let mounted = true;

    async function loadProduct() {
      try {
        const [{ default: ProductRepository }, { default: ExperienceRepository }] = await Promise.all([
          import("@/app/_repositories/product_repository"),
          import("@/app/_repositories/experience_repository"),
        ]);

        const data = await ProductRepository.getProductById(productId);

        if (!mounted) return;

        if (data) {
          setProduct(data);
          setUsesMockData(false);

          ExperienceRepository.getPublishedExperienceByProductId(productId)
            .then((publishedExperience) => {
              if (mounted) setExperience(publishedExperience);
            })
            .catch(() => {
              if (mounted) setExperience(null);
            });

          ProductRepository.getActiveProducts(12)
            .then((allActiveProducts) => {
              if (mounted) setRelatedProducts(allActiveProducts.filter((item) => item.id !== data.id).slice(0, 3));
            })
            .catch(() => {
              if (mounted) setRelatedProducts([]);
            });

          return;
        }
      } catch {
        if (!mounted) return;
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  const variants = useMemo(() => (product ? getProductVariants(product) : []), [product]);
  const selectedVariant = useMemo(() => {
    if (!product) return null;

    return variants.find((variant) => variant.title === selectedVariantTitle) ?? getFirstAvailableVariant(product);
  }, [product, selectedVariantTitle, variants]);
  const detailsSectionId = "product-details";
  const hasPublishedExperience = Boolean(experience?.blocks?.length);
  const availableSizes = useMemo(() => {
    return Array.from(new Set(variants.map((variant) => formatDimension(variant)).filter((value) => value !== "À confirmer")));
  }, [variants]);
  const minWeight = useMemo(() => {
    const weights = variants
      .map((variant) => variant.weight)
      .filter((weight): weight is number => typeof weight === "number");

    return weights.length ? Math.min(...weights) : null;
  }, [variants]);
  const pressureRange = selectedVariant ? formatPressure(selectedVariant) : null;

  if (!id) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="font-bold text-primary-dark">Produit introuvable.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background-dark">
        <Spinner className="h-8 w-8" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="font-bold text-primary-dark">Produit introuvable.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mx-auto mt-4 inline-flex rounded-lg bg-primary-color px-4 py-2 text-sm font-semibold text-primary-on"
        >
          Retour
        </button>
      </main>
    );
  }

  const mainImage = product.images?.[0];

  return (
    <main className="min-h-screen bg-background-dark">
      <button
        type="button"
        onClick={() =>
          document.getElementById(detailsSectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        className="fixed inset-x-4 bottom-4 z-40 inline-flex items-center justify-center gap-2 rounded-full bg-primary-color px-4 py-3 text-sm font-semibold text-primary-on shadow-lg transition hover:bg-primary-dark md:left-auto md:right-6 md:inset-x-auto"
      >
        <ArrowDownToLine className="h-4 w-4" />
        Détails techniques et achat
      </button>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/product"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-color hover:text-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux produits
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold uppercase text-primary-color">
              {product.brand} · {getPractice(product)}
            </p>
            <h1 className="text-3xl font-black leading-tight text-primary-dark sm:text-5xl">{product.name}</h1>
            <p className="text-base leading-7 text-gray-600 sm:text-lg">{product.description}</p>
            {hasPublishedExperience ? (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-success-light px-3 py-1 text-xs font-bold text-success-dark">
                Expérience immersive disponible
              </span>
            ) : (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                Expérience à venir
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="relative flex aspect-square items-center justify-center bg-primary-light">
              {mainImage ? (
                <Image
                  src={mainImage.url}
                  alt={mainImage.altText ?? product.name}
                  fill
                  priority
                  unoptimized
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div
                  className="relative flex h-64 w-64 items-center justify-center rounded-full border border-gray-900 bg-white shadow-inner"
                  style={{ borderWidth: 38 }}
                >
                  <div
                    className="h-28 w-28 rounded-full border border-primary-color bg-primary-light"
                    style={{ borderWidth: 16 }}
                  />
                </div>
              )}
              {usesMockData && (
                <span className="absolute left-4 top-4 rounded-full bg-secondary-color px-3 py-1 text-xs font-bold text-secondary-on">
                  Démonstration
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <p className="text-sm font-bold uppercase text-primary-color">{product.brand} · {getPractice(product)}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-primary-dark sm:text-4xl">{product.name}</h1>
              <p className="mt-4 text-base leading-7 text-gray-600">{product.description}</p>

              <div className="mt-6 flex flex-wrap items-end gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Prix conseillé</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-primary-color">{formatPrice(selectedVariant?.price)}</span>
                  </div>
                </div>
              </div>

              {variants.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase text-gray-500">Déclinaison</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {variants.map((variant) => {
                      const isSelected = selectedVariant?.title === variant.title;

                      return (
                        <button
                          key={variant.title}
                          type="button"
                          onClick={() => setSelectedVariantTitle(variant.title)}
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                            isSelected
                              ? "border-primary-color bg-primary-color text-primary-on"
                              : "border-gray-200 bg-white text-primary-color hover:border-primary-color"
                          }`}
                        >
                          {variant.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <FilledButton className="bg-primary-color text-primary-on justify-center hover:bg-primary-dark" hasIcon>
                  <ShoppingBag className="h-4 w-4" />
                  Acheter en ligne
                </FilledButton>
                <OutlinedButton className="justify-center bg-white" hasIcon>
                  <ShieldCheck className="h-4 w-4" />
                  Comparer
                </OutlinedButton>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                [
                  "Stock",
                  typeof selectedVariant?.stock === "number"
                    ? selectedVariant.stock > 0
                      ? `${selectedVariant.stock} disponible${selectedVariant.stock > 1 ? "s" : ""}`
                      : "Rupture"
                    : "À confirmer",
                ],
                ["Livraison", "E-retail"],
                ["Usage", getPractice(product)],
                ["Variantes", `${variants.length}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
                  <p className="mt-1 font-semibold text-primary-dark">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div id={detailsSectionId} className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6 scroll-mt-28">
            <h2 className="text-xl font-black text-primary-dark">Détails techniques</h2>
            <dl className="mt-4 divide-y divide-gray-100 text-sm">
              {[
                ["Dimensions", availableSizes.length ? availableSizes.join(" • ") : "À confirmer"],
                ["Poids", minWeight != null ? `${minWeight} g` : "À confirmer"],
                ["Pression", pressureRange ?? "À confirmer"],
                ["Usage", getPractice(product)],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[120px_1fr] gap-4 py-3">
                  <dt className="font-semibold text-gray-500">{label}</dt>
                  <dd className="font-semibold text-primary-dark">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-black text-primary-dark">Ce que vous gagnez</h2>
          <div className="mt-4 grid gap-3">
            {(product.tags ?? ["Performance", "Confiance", "Durabilité"]).slice(0, 4).map((tag) => (
              <p key={tag} className="flex items-start gap-3 text-sm leading-6 text-gray-600">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-color" />
                <span>{tag}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-black text-primary-dark">Détails techniques</h2>
          <dl className="mt-4 divide-y divide-gray-100 text-sm">
            {[
              ["Dimension", formatDimension(selectedVariant)],
              ["Poids", selectedVariant?.weight ? `${selectedVariant.weight} g` : "À confirmer"],
              ["Pression", formatPressure(selectedVariant)],
              ["Tringles", selectedVariant?.bead ?? "À confirmer"],
              ["Flancs", selectedVariant?.sidewallColor ?? "À confirmer"],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[120px_1fr] gap-4 py-3">
                <dt className="font-semibold text-gray-500">{label}</dt>
                <dd className="font-semibold text-primary-dark">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {hasPublishedExperience && experience && (
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mb-4">
            <p className="text-sm font-bold uppercase text-primary-color">Expérience Michelin</p>
            <h2 className="mt-1 text-xl font-black text-primary-dark">{experience.metaTitle}</h2>
          </div>
          <ExperienceRenderer blocks={experience.blocks} />
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary-color" />
          <h2 className="text-xl font-black text-primary-dark">À découvrir aussi</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {relatedProducts.map((item) => (
            <PublicProductCard key={item.id ?? item.slug} product={item} />
          ))}
        </div>
      </section>

      <div className="h-20 md:h-0" />
    </main>
  );
}
