"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Award, Bike, Filter, Leaf, RotateCcw, ShieldCheck, ShoppingBag } from "lucide-react";
import { Product } from "@/app/_models/product";
import FilledButton from "@/app/_components/ui/Buttons/FilledButton";
import OutlinedButton from "@/app/_components/ui/Buttons/OutlinedButton";
import SearchBar from "@/app/_components/ui/Components/SearchBar";
import Spinner from "@/app/_components/ui/Components/Spinner";
import PublicProductCard from "@/app/product/_components/PublicProductCard";
import NavBar from "@/app/_components/NavBar";

const FILTERS = [
  { value: "all", label: "Tous" },
  { value: "road", label: "Route" },
  { value: "gravel", label: "Gravel" },
  { value: "mountain", label: "VTT" },
  { value: "city", label: "Ville" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

const PRACTICE_HIGHLIGHTS = [
  {
    label: "Route",
    value: "Vitesse",
    description: "Rendement, précision et confiance sur longues distances.",
  },
  {
    label: "Gravel",
    value: "Aventure",
    description: "Passer de l'asphalte aux chemins sans perdre le contrôle.",
  },
  {
    label: "VTT",
    value: "Contrôle",
    description: "Grip, robustesse et appui sur terrain engagé.",
  },
];

const BRAND_PROOFS = [
  {
    icon: Award,
    title: "Performance validée",
    text: "Des gammes pensées du Racing Line au Performance Line pour adapter le niveau d'exigence à votre pratique.",
  },
  {
    icon: ShieldCheck,
    title: "Confiance en mouvement",
    text: "Grip, protection et durabilité sont mis en avant pour vous aider à choisir sans hésiter.",
  },
  {
    icon: Leaf,
    title: "Mobilité durable",
    text: "Michelin vise des pneus 100% durables à horizon 2050, avec une démarche d'innovation continue.",
  },
];

function hasFirebaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      if (!hasFirebaseConfig()) {
        setLoading(false);
        return;
      }

      try {
        const { default: ProductRepository } = await import("@/app/_repositories/product_repository");
        const data = await ProductRepository.getActiveProducts(100);

        if (!mounted) return;

        if (data.length > 0) {
          setProducts(data);
        } else {
        }
      } catch {
        if (!mounted) return;
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const matchesFilter = activeFilter === "all" || product.bikeType.includes(activeFilter);
      const searchable = [
        product.name,
        product.brand,
        product.shortDescription,
        product.description,
        ...(product.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return matchesFilter && searchable.includes(query);
    });
  }, [activeFilter, products, query]);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-background-dark">
        <section className="bg-primary-dark text-primary-on pt-28">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
            <div className="flex flex-col justify-center gap-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary-color px-4 py-2 text-sm font-bold text-secondary-on">
                <Bike className="h-4 w-4" />
                Michelin Bike
              </span>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
                  Trouvez le pneu qui suit votre rythme.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-primary-light sm:text-lg">
                  Vous roulez pour gagner du temps, garder le contrôle ou partir plus loin. Choisissez selon votre
                  pratique, comparez les bénéfices, puis passez à l&apos;achat en ligne sans détour.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <FilledButton className="bg-secondary-color text-secondary-on hover:bg-secondary-dark" hasIcon>
                  <ShoppingBag className="h-4 w-4" />
                  Voir les produits
                </FilledButton>
                <OutlinedButton className="border-white/60 bg-transparent text-white hover:bg-white/10" hasIcon>
                  <Filter className="h-4 w-4" />
                  Affiner ma pratique
                </OutlinedButton>
              </div>
            </div>

            <div className="grid content-center gap-3 rounded-lg border border-white/15 bg-white/10 p-4 shadow-light">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {PRACTICE_HIGHLIGHTS.map((item) => (
                  <div key={item.label} className="rounded-lg bg-white p-4 text-primary-dark">
                    <p className="text-xs font-bold uppercase text-primary-color">{item.label}</p>
                    <p className="mt-2 text-lg font-black">{item.value}</p>
                    <p className="mt-2 text-xs leading-5 text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {BRAND_PROOFS.map((proof) => {
              const Icon = proof.icon;

              return (
                <article key={proof.title} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary-color">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-3 text-base font-black text-primary-dark">{proof.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{proof.text}</p>
                </article>
              );
            })}
          </div>

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-primary-color">
                {products ? "Catalogue" : "Aperçu avec produit de démonstration"}
              </p>
              <h2 className="mt-1 text-2xl font-black text-primary-dark">Produits recommandés</h2>
            </div>

            <SearchBar
              className="max-w-full bg-white lg:max-w-md"
              onChange={setQuery}
              placeholder="Rechercher un pneu, une pratique..."
              small
            />
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  activeFilter === filter.value
                    ? "border-primary-color bg-primary-color text-primary-on"
                    : "border-gray-200 bg-white text-primary-color hover:border-primary-color"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <Spinner className="h-8 w-8" />
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <p className="font-bold text-primary-dark">Aucun produit ne correspond à votre recherche.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveFilter("all");
                }}
                className="mx-auto mt-4 inline-flex items-center gap-2 rounded-lg border border-primary-color px-4 py-2 text-sm font-semibold text-primary-color"
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </button>
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <PublicProductCard key={product.id ?? product.slug} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
