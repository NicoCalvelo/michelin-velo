"use client";
import Link from "next/link";
import React from "react";
import Button from "./Button";

export default function Navbar() {
  return (
    <header className="w-full bg-[var(--color-bg)] border-b border-gray-200">
      <div className="site-container flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            Michelin Velo
          </Link>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/produits" className="text-sm text-[var(--color-fg)]">
            Produits
          </Link>
          <Link href="/a-propos" className="text-sm text-[var(--color-fg)]">
            À propos
          </Link>
          <Button variant="ghost">Se connecter</Button>
        </nav>
      </div>
    </header>
  );
}
