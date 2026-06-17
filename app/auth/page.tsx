"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  signInWithPassword,
  registerWithPassword,
  signInWithGoogle,
} from "@/app/_services/AuthService";

import { Mail, Lock, User, ArrowRight } from "lucide-react";
import FilledButton from "../_components/ui/Buttons/FilledButton";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (isLogin) {
        await signInWithPassword(email, password);
      } else {
        await registerWithPassword(email, password, displayName);
      }

      router.push("/");
    } catch (err: any) {
      console.error(err);

      switch (err.code) {
        case "auth/user-not-found":
          setError("Aucun compte associé à cet email.");
          break;

        case "auth/wrong-password":
          setError("Mot de passe incorrect.");
          break;

        case "auth/email-already-in-use":
          setError("Cette adresse email est déjà utilisée.");
          break;

        case "auth/weak-password":
          setError("Le mot de passe doit contenir au moins 6 caractères.");
          break;

        case "auth/invalid-email":
          setError("Adresse email invalide.");
          break;

        default:
          setError("Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      await signInWithGoogle();

      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Impossible de se connecter avec Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Partie gauche */}
      <section className="relative hidden overflow-hidden lg:flex">
        <Image
          src="/demo.jpg"
          alt="Michelin Bicycle"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-[var(--midnight-blue)]/75" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <span className="mb-4 text-sm uppercase tracking-widest text-[var(--yellow-ref)]">
            Michelin Bicycle
          </span>

          <h1 className="mb-6 max-w-lg">
            Roulez, progressez et gagnez des récompenses.
          </h1>

          <div className="mb-6 h-1 w-24 rounded bg-[var(--yellow-ref)]" />

          <p className="max-w-md text-white/80">
            Connectez votre compte Michelin Bicycle à Strava et accédez à des
            défis exclusifs, réductions et avantages réservés à la communauté.
          </p>
        </div>
      </section>

      {/* Partie droite */}
      <section className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="mb-2 text-4xl font-bold text-primary-dark">
              {isLogin ? "Connexion" : "Créer un compte"}
            </h2>

            <div className="mb-4 h-1 w-20 rounded bg-[var(--yellow-ref)]" />

            <p className="text-gray-500">
              Accédez à votre espace Michelin Bicycle.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-md py-3 transition ${
                isLogin ? "bg-white shadow text-primary-dark" : "text-gray-500"
              }`}
            >
              Connexion
            </button>

            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-md py-3 transition ${
                !isLogin ? "bg-white shadow text-primary-dark" : "text-gray-500"
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Nom complet"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--yellow-ref)]"
                />
              </div>
            )}

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--yellow-ref)]"
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--yellow-ref)]"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <FilledButton
              type="submit"
              disabled={loading}
              className="w-full justify-center"
            >
              <span className="flex items-center gap-2">
                {loading
                  ? "Chargement..."
                  : isLogin
                    ? "Se connecter"
                    : "Créer mon compte"}

                {!loading && <ArrowRight size={18} />}
              </span>
            </FilledButton>
          </form>

          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-400">ou</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 py-4 transition hover:bg-gray-50"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
              />
            </svg>
            Continuer avec Google
          </button>

          <p className="mt-8 text-center text-sm text-gray-500">
            En continuant, vous acceptez les conditions d'utilisation Michelin
            Bicycle.
          </p>
        </div>
      </section>
    </main>
  );
}
