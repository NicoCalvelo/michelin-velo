import { Product, ProductVariant } from "@/app/_models/product";

export function formatPrice(value?: number) {
  if (typeof value !== "number") return "Prix à confirmer";

  return (value / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function getProductVariants(product: Product): ProductVariant[] {
  return Array.isArray(product.variants) ? product.variants : [];
}

export function getFirstAvailableVariant(product: Product) {
  const variants = getProductVariants(product);

  return variants.find((variant) => variant.stock > 0) ?? variants[0] ?? null;
}

export function getProductPriceRange(product: Product) {
  const prices = getProductVariants(product)
    .map((variant) => variant.price)
    .filter((price) => typeof price === "number");

  if (prices.length === 0) return "Prix à confirmer";

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) return formatPrice(minPrice);

  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
}

export function getTotalStock(product: Product) {
  return getProductVariants(product).reduce((sum, variant) => sum + (variant.stock ?? 0), 0);
}

export function formatDimension(variant?: ProductVariant | null) {
  if (!variant?.dimension) return "À confirmer";

  const { diameter, width, unit, isoSize } = variant.dimension;
  const size = unit === "inches" ? `${diameter} x ${width}"` : `${diameter} x ${width} mm`;

  return isoSize ? `${size} · ${isoSize}` : size;
}

export function formatPressure(variant?: ProductVariant | null) {
  if (!variant) return "À confirmer";

  const bar =
    typeof variant.barMinPressure === "number" && typeof variant.barMaxPressure === "number"
      ? `${variant.barMinPressure} à ${variant.barMaxPressure} bar`
      : null;
  const psi =
    typeof variant.psiMinPressure === "number" && typeof variant.psiMaxPressure === "number"
      ? `${variant.psiMinPressure} à ${variant.psiMaxPressure} psi`
      : null;

  return [bar, psi].filter(Boolean).join(" · ") || "À confirmer";
}
