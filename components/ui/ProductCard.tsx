"use client";
import React from "react";
import Button from "./Button";

type ProductCardProps = {
  title: string;
  price: string;
  image?: string;
};

export default function ProductCard({ title, price, image }: ProductCardProps) {
  return (
    <article
      className="bg-white rounded-[var(--radius-md)] overflow-hidden border border-transparent shadow-sm"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="object-cover w-full h-full" />
        ) : (
          <span className="text-gray-400">Image</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold mb-2 leading-snug">{title}</h3>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-gray-700">{price}</div>
          </div>
          <div className="flex items-center gap-2">
            <a
              className="text-sm text-[var(--color-primary)] hover:underline"
              href="#"
            >
              Voir ce pneu
            </a>
            <Button size="sm">Demander un devis</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
