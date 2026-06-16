"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageOff, ShieldCheck, Sparkles } from "lucide-react";
import { Product } from "@/app/_models/product";
import OutlinedCard from "@/app/_components/ui/Cards/OutlinedCard";
import { getProductPriceRange, getTotalStock } from "../_utils/productDisplay";

interface PublicProductCardProps {
  product: Product;
}

function getBikeTypeLabel(product: Product) {
  const labels: Record<string, string> = {
    road: "Route",
    mountain: "VTT",
    gravel: "Gravel",
    city: "Ville",
    bmx: "BMX",
    electric: "E-bike",
  };

  return (product.bikeType ?? []).map((type) => labels[type] ?? type).join(" / ");
}

export default function PublicProductCard({ product }: PublicProductCardProps) {
  const mainImage = product.images?.[0];
  const totalStock = getTotalStock(product);

  return (
    <OutlinedCard className="group flex h-full flex-col overflow-hidden bg-white p-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-color hover:shadow-md">
      <Link href={`/product/${product.id}`} className="flex h-full flex-col">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-primary-light">
          {mainImage ? (
            <Image
              src={mainImage.url}
              alt={mainImage.altText ?? product.name}
              fill
              unoptimized
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[22px] border-gray-900 bg-white shadow-inner">
              <div className="h-16 w-16 rounded-full border-[10px] border-primary-color bg-primary-light" />
              <ImageOff className="absolute bottom-2 right-0 h-5 w-5 rounded-full bg-white p-0.5 text-gray-500" />
            </div>
          )}

          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-secondary-color px-3 py-1 text-xs font-bold text-secondary-on">
            <Sparkles className="h-3.5 w-3.5" />
            Premium
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-primary-color">{getBikeTypeLabel(product)}</p>
            <h2 className="text-lg font-bold leading-snug text-primary-dark">{product.name}</h2>
            <p className="text-sm leading-6 text-gray-600">{product.shortDescription}</p>
          </div>

          <div className="mt-auto flex flex-wrap gap-2">
            {(product.tags ?? []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-background-dark px-2.5 py-1 text-xs font-semibold text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-end justify-between gap-3 border-t border-gray-100 pt-3">
            <div>
              <p className="text-xs text-gray-500">À partir de</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-primary-color">{getProductPriceRange(product)}</span>
              </div>
            </div>

            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-color text-primary-on transition-colors group-hover:bg-primary-dark">
              <ArrowRight className="h-5 w-5" />
            </span>
          </div>

          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-success-dark">
            <ShieldCheck className="h-4 w-4" />
            {totalStock > 0 ? `${totalStock} en stock pour achat e-retail` : "Stock à confirmer"}
          </p>
        </div>
      </Link>
    </OutlinedCard>
  );
}
