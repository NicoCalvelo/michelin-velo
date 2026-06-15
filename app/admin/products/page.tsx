"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Product } from "@/app/_models/product";
import ProductRepository from "@/app/_repositories/product_repository";
import ProductCard from "./_components/ProductCard";
import SearchBar from "@/app/_components/ui/Components/SearchBar";
import FilledButton from "@/app/_components/ui/Buttons/FilledButton";
import Spinner from "@/app/_components/ui/Components/Spinner";
import { showDangerConfirmationModal } from "@/app/_components/ui/Dialogs/ConfirmationModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductRepository.getAllProducts(200);
      setProducts(data);
      setFiltered(data);
    } catch {
      setError("Impossible de charger les produits.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (query: string) => {
    const q = query.toLowerCase();
    setFiltered(
      products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
      ),
    );
  };

  const handleDelete = async (product: Product) => {
    try {
      await showDangerConfirmationModal(
        `Supprimer "${product.name}" ?`,
        "Cette action est irréversible. Les images seront également supprimées.",
        "Annuler",
        "Supprimer",
      );
      await ProductRepository.deleteProduct(product.id!);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setFiltered((prev) => prev.filter((p) => p.id !== product.id));
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} produit{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/products/new">
          <FilledButton hasIcon>
            <Plus className="w-4 h-4 shrink-0" />
            Ajouter un produit
          </FilledButton>
        </Link>
      </div>

      {/* Search */}
      <SearchBar onChange={handleSearch} placeholder="Rechercher par nom ou marque…" />

      {/* States */}
      {loading && (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Aucun produit trouvé</p>
          <p className="text-sm mt-1">Modifiez votre recherche ou ajoutez un produit.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
