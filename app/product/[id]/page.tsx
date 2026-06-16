"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { Product } from "@/app/_models/product";
import FilledButton from "@/app/_components/ui/Buttons/FilledButton";
import OutlinedButton from "@/app/_components/ui/Buttons/OutlinedButton";
import Spinner from "@/app/_components/ui/Components/Spinner";
import PublicProductCard from "../_components/PublicProductCard";
import { MOCK_PRODUCTS } from "../_data/mockProducts";

function formatPrice(value: number) {
  return (value / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDimension(product: Product) {
  const { diameter, width, unit, isoSize } = product.dimension;
  const readableUnit = unit === "inches" ? "\"" : " mm";
  const size = unit === "inches" ? `${diameter} x ${width}${readableUnit}` : `${diameter} x ${width}${readableUnit}`;

  return isoSize ? `${size} · ${isoSize}` : size;
}

function getPractice(product: Product) {
  const labels: Record<string, string> = {
    road: "Route",
    mountain: "VTT",
    gravel: "Gravel",
    city: "Ville",
    bmx: "BMX",
    electric: "E-bike",
  };

  return product.bikeType.map((type) => labels[type] ?? type).join(" / ");
}

function hasFirebaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [usesMockData, setUsesMockData] = useState(false);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    async function loadProduct() {
      if (!hasFirebaseConfig()) {
        const mockProduct = MOCK_PRODUCTS.find((item) => item.id === id) ?? MOCK_PRODUCTS[0];
        setProduct(mockProduct);
        setUsesMockData(true);
        setLoading(false);
        return;
      }

      try {
        const { default: ProductRepository } = await import("@/app/_repositories/product_repository");
        const data = await ProductRepository.getProductById(id!);

        if (!mounted) return;

        if (data) {
          setProduct(data);
          setUsesMockData(false);
          return;
        }

        const mockProduct = MOCK_PRODUCTS.find((item) => item.id === id) ?? MOCK_PRODUCTS[0];
        setProduct(mockProduct);
        setUsesMockData(true);
      } catch {
        if (!mounted) return;
        const mockProduct = MOCK_PRODUCTS.find((item) => item.id === id) ?? MOCK_PRODUCTS[0];
        setProduct(mockProduct);
        setUsesMockData(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return MOCK_PRODUCTS.filter((item) => item.id !== product.id).slice(0, 2);
  }, [product]);

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
  const compareFormatted = product.compareAtPrice ? formatPrice(product.compareAtPrice) : null;

  return (
    <main className="min-h-screen bg-background-dark">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/product" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-color hover:text-primary-dark">
          <ArrowLeft className="h-4 w-4" />
          Retour aux produits
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="relative flex aspect-square items-center justify-center bg-[var(--primary-light)]">
              {mainImage ? (
                <Image
                  src={mainImage.url}
                  alt={mainImage.altText ?? product.name}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-[38px] border-gray-900 bg-white shadow-inner">
                  <div className="h-28 w-28 rounded-full border-[16px] border-primary-color bg-primary-light" />
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
                    <span className="text-3xl font-black text-primary-color">{formatPrice(product.price)}</span>
                    {compareFormatted && <span className="text-base text-gray-500 line-through">{compareFormatted}</span>}
                  </div>
                </div>
              </div>

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

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Stock", product.stock > 0 ? "Disponible" : "Rupture"],
                ["Livraison", "E-retail"],
                ["Usage", getPractice(product)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
                  <p className="mt-2 font-bold text-primary-dark">{value}</p>
                </div>
              ))}
            </div>
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
              ["Dimension", formatDimension(product)],
              ["Poids", product.weight ? `${product.weight} g` : "À confirmer"],
              ["Pression", product.minPressure && product.maxPressure ? `${product.minPressure} à ${product.maxPressure} bar` : "À confirmer"],
              ["Technologie", product.technicalDetails ?? "À confirmer"],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[120px_1fr] gap-4 py-3">
                <dt className="font-semibold text-gray-500">{label}</dt>
                <dd className="font-semibold text-primary-dark">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

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
    </main>
  );
}
