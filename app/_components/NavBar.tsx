import React from "react";
import Link from "next/link";
import FilledButton from "./ui/Buttons/FilledButton";

export default function NavBar() {
  return (
    <header className="nav-bar flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-3">
        <span className="nav-logo text-base font-medium tracking-wide">
          LOGO
        </span>
      </div>

      <nav className="nav-links flex gap-4 text-sm">
        <Link href="/" className="nav-link px-2 py-1 rounded hover:bg-white/10">
          Accueil
        </Link>
        <Link
          href="/profile"
          className="nav-link px-2 py-1 rounded hover:bg-white/10"
        >
          Nos pneus
        </Link>
        <Link
          href="/challenges"
          className="nav-link px-2 py-1 rounded hover:bg-white/10"
        >
          L'expertise Michelin
        </Link>
        <Link
          href="/challenges"
          className="nav-link px-2 py-1 rounded hover:bg-white/10"
        >
          Défis
        </Link>
        <Link
          href="/product"
          className="nav-link px-2 py-1 rounded hover:bg-white/10"
        >
          En mouvement pour demain
        </Link>
      </nav>

      <div>
        <FilledButton>Quel pneu est fait pour vous ?</FilledButton>
      </div>
    </header>
  );
}
