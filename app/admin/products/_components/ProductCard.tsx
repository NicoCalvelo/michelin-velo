"use client";

import React from "react";
import Link from "next/link";
import { Pencil, Trash2, ImageOff, Eye } from "lucide-react";
import { Product } from "@/app/_models/product";
import PRODUCT_STATUS from "@/app/_data/product_status.json";
import OutlinedCard from "@/app/_components/ui/Cards/OutlinedCard";
import IconButton from "@/app/_components/ui/Buttons/IconButton";
import { RowBetween } from "@/app/_components/ui/Layout/Rows";
import { getHighlightedText } from "@/app/_components/ui/Components/SearchBar";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-600",
};

interface ProductCardProps {
  product: Product;
  search?: string;
  onDelete: (product: Product) => void;
}

export default function ProductCard({ product, search = "", onDelete }: ProductCardProps) {
  const mainImage = product.images?.[0];
  const statusEntry = Object.values(PRODUCT_STATUS).find((s) => s.value === product.status);
  const prices = product.variants.map((variant) => variant.price);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const priceLabel =
    minPrice === null
      ? "Prix indisponible"
      : minPrice === maxPrice
        ? (minPrice / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
        : `${(minPrice / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} - ${(maxPrice! / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`;

  return (
    <OutlinedCard className="flex p-0! flex-col overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {mainImage ? (
          <img src={mainImage.url} alt={mainImage.altText ?? product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff className="w-10 h-10" />
          </div>
        )}
        {/* Status badge */}
        {statusEntry && (
          <span
            className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[product.status as string] ?? "bg-gray-100 text-gray-600"}`}
          >
            {statusEntry.label}
          </span>
        )}
      </div>

      <div className="p-3 space-y-2 flex flex-col">
        <RowBetween>
          <p className="text-xs text-gray-400 uppercase tracking-wide">{product.brand}</p>
          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link href={`/product/${product.id}`} target="_blank">
              <IconButton
                tooltip="Voir le produit"
                className="text-gray-500 hover:text-secondary-dark hover:bg-secondary-color/25"
              >
                <Eye className="w-4 h-4" />
              </IconButton>
            </Link>
            <Link href={`/admin/products/${product.id}/edit`}>
              <IconButton
                tooltip="Modifier"
                className="text-gray-500 hover:text-primary-dark hover:bg-primary-color/25"
              >
                <Pencil className="w-4 h-4" />
              </IconButton>
            </Link>
            <IconButton
              onClick={() => onDelete(product)}
              tooltip="Supprimer"
              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </IconButton>
          </div>
        </RowBetween>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-xl! leading-snug line-clamp-2">
            {getHighlightedText(product.name, search)}
          </p>
          <span className="font-bold text-gray-900">{priceLabel}</span>
        </div>
      </div>
    </OutlinedCard>
  );
}
