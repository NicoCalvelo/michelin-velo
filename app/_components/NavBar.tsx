"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Disc } from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();

  const [show, setShow] = useState(true);

  const isActive = (path: string) => pathname === path;

  // Hide on scroll down / show on scroll up
  useEffect(() => {
    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const current = window.scrollY;

      if (current < lastScroll) {
        setShow(true);
      } else {
        setShow(false);
      }

      lastScroll = current;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`nav-bar fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="site-container flex items-center justify-between py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-wide text-primary-dark">
            MICHELIN
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-10 text-sm">
          <Link
            href="/"
            className={`nav-link-michelin ${
              isActive("/") ? "font-bold text-primary-dark" : ""
            }`}
          >
            Accueil
          </Link>

          <Link
            href="/product"
            className={`nav-link-michelin ${
              isActive("/product") ? "font-bold text-primary-dark" : ""
            }`}
          >
            Nos pneus
          </Link>

          <Link
            href="/challenges"
            className={`nav-link-michelin ${
              isActive("/challenges") ? "font-bold text-primary-dark" : ""
            }`}
          >
            L’expertise Michelin
          </Link>

          <Link
            href="/challenges"
            className={`nav-link-michelin ${
              isActive("/challenges") ? "font-bold text-primary-dark" : ""
            }`}
          >
            Défis
          </Link>

          <Link
            href="/product"
            className={`nav-link-michelin ${
              isActive("/product") ? "font-bold text-primary-dark" : ""
            }`}
          >
            En mouvement pour demain
          </Link>
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <Link href="/quiz" className="btn bg-secondary-color text-secondary-on hover:bg-secondary-dark">
            <span className="flex items-center gap-2">
              <Disc size={18} />
              Quel pneu est fait pour vous ?
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
