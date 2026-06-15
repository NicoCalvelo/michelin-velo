"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/_services/AuthService";
import { showSignInModal } from "@/app/_components/auth/SignInModal";
import UserRepository from "@/app/_repositories/user_repository";
import AdminShell from "./_components/AdminShell";
import Spinner from "@/app/_components/ui/Components/Spinner";

type AuthState = "loading" | "authorized" | "unauthorized";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthState("unauthorized");
        showSignInModal(
          "Accès réservé aux administrateurs",
          "Connectez-vous pour accéder au back-office.",
          "Se connecter",
        );
        return;
      }

      const isAdmin = await UserRepository.isAdmin(user.uid);
      if (!isAdmin) {
        router.replace("/");
        return;
      }

      setAuthState("authorized");
    });

    return () => unsubscribe();
  }, [router]);

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  if (authState === "unauthorized") {
    // SignInModal is already open via showSignInModal; render nothing behind it
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}
