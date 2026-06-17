"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Disc, User } from "lucide-react";
import OutlinedButton from "./ui/Buttons/OutlinedButton";
import FilledButton from "./ui/Buttons/FilledButton";
import Dropdown, { DropdownItem } from "./ui/Components/Dropdown";
import { auth, signInWithGoogle, LogOut } from "@/app/_services/AuthService";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [show, setShow] = useState(true);
  const [user, setUser] = useState<any>(null);

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

  // Auth state listener
  useEffect(() => {
    if (!auth || typeof auth.onAuthStateChanged !== "function") return;
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u ?? null);
    });

    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error("Sign-in error", e);
    }
  };

  const handleSignOut = async () => {
    try {
      await LogOut();
    } catch (e) {
      console.error("Sign-out error", e);
    }
  };

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
            href="/expertise-michelin"
            className={`nav-link-michelin ${
              isActive("/expertise-michelin")
                ? "font-bold text-primary-dark"
                : ""
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
            href="/en-mouvement-pour-demain"
            className={`nav-link-michelin ${
              isActive("/en-mouvement-pour-demain")
                ? "font-bold text-primary-dark"
                : ""
            }`}
          >
            En mouvement pour demain
          </Link>
        </nav>

        {/* CTA + profile */}
        <div className="hidden md:flex items-center gap-4">
          <OutlinedButton onClick={() => router.push("/quiz")}>
            <span className="flex items-center gap-2">
              <Disc size={18} />
              Quel pneu est fait pour vous ?
            </span>
          </OutlinedButton>

          <div>
            <Dropdown
              showArrow={false}
              title={
                (
                  <span className="p-2 flex items-center justify-center">
                    {user?.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.photoURL}
                        alt={user.displayName ?? "avatar"}
                        className="w-8 h-8 object-cover rounded-full"
                      />
                    ) : (
                      <User size={18} className="text-primary-dark" />
                    )}
                  </span>
                ) as any
              }
            >
              {user ? (
                <>
                  <DropdownItem onClick={() => router.push("/profile")}>
                    Mon profil
                  </DropdownItem>
                  <DropdownItem onClick={handleSignOut}>
                    Se déconnecter
                  </DropdownItem>
                </>
              ) : (
                <>
                  <DropdownItem onClick={handleSignIn}>
                    Se connecter
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}
