"use client";
import Slider from "./_components/Slider";
import { ArrowRight, Clock, Gauge, Sparkles } from "lucide-react";
import FilledButton from "./_components/ui/Buttons/FilledButton";
import TireSection from "./_components/TireSection";
import { FilledIconButton } from "./_components/ui/Buttons/IconButton";

export default function Home() {
  const items = [
    {
      id: 1,
      title: "Romain Bardet",
      subtitle: "Ambassadeur Gravel Michelin",
      description:
        "Utilisés par plusieurs équipes professionnelles, les pneus Michelin sont testés en conditions réelles et participent au développement des pneus de demain.”",
      image: "/demo.jpg",
      button: "En savoir plus",
    },
    {
      id: 2,
      title: "En mouvement pour demain",
      subtitle: "Nos actions pour un cyclisme plus durable",
      image: "/demo.jpg",
      button: "En savoir plus",
    },
    {
      id: 3,
      title: "Pneu Course",
      subtitle: "Léger et rapide",
      image: "/demo.jpg",
      button: "Voir le produit",
    },
  ];

  return (
    <main className="flex flex-col">
      <div className="relative">
        <section>
          <Slider items={items} />
        </section>

        <section className="relative z-20 -mt-24 mx-20 overflow-hidden rounded-2xl bg-[var(--midnight-blue)] p-16 text-white">
          <div
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--yellow-ref)] opacity-20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center gap-12 md:flex-row md:justify-between">
            <div className="max-w-xl text-center md:text-left">
              <span className="mb-4 inline-block rounded-full bg-[var(--yellow-ref)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--yellow-ref)]">
                Quiz pneus
              </span>

              <h2 className="typo-h1 mb-4">
                Quel pneu correspond vraiment à votre usage ?
              </h2>

              <p className="mb-8 text-white/80">
                Répondez à quelques questions sur votre véhicule et votre façon
                de conduire : on vous recommande le pneu le plus adapté, sans
                avoir à comparer des dizaines de références.
              </p>

              <div className="mb-10 flex flex-wrap justify-center gap-6 md:justify-start">
                <div className="flex max-w-[140px] flex-col items-center text-center md:items-start md:text-left">
                  <Clock
                    className="mb-2 h-6 w-6"
                    style={{ color: "var(--yellow-ref)" }}
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold">2 minutes chrono</p>
                </div>

                <div className="flex max-w-[140px] flex-col items-center text-center md:items-start md:text-left">
                  <Sparkles
                    className="mb-2 h-6 w-6"
                    style={{ color: "var(--yellow-ref)" }}
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold">
                    Conseils personnalisés
                  </p>
                </div>
              </div>

              <FilledButton
                type="button"
                onClick={() => {
                  // Navigation vers le quiz
                }}
              >
                <span className="relative z-10">Démarrer le quiz</span>
                <ArrowRight
                  className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </FilledButton>
            </div>

            <div className="relative flex h-56 w-56 shrink-0 items-center justify-center md:h-64 md:w-64">
              <div className="absolute h-full w-full rounded-full border border-white/10" />
              <div className="absolute h-[80%] w-[80%] rounded-full border border-white/10" />

              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--yellow-ref)]">
                <Gauge
                  className="h-10 w-10"
                  style={{ color: "var(--midnight-blue)" }}
                  aria-hidden="true"
                />
              </div>

              <span className="absolute -left-2 top-4 animate-bounce rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                Route
              </span>

              <span className="absolute -right-2 bottom-6 animate-bounce rounded-full bg-white/10 px-3 py-1 text-xs font-semibold [animation-delay:300ms]">
                Cross
              </span>
            </div>
          </div>
        </section>
      </div>
      <TireSection />
      <section className="site-container pb-18">
        <div className="relative z-10 flex flex-col gap-14">
          {/* HEADER + CTA (2 colonnes) */}
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            {/* LEFT - TEXT */}
            <div className="max-w-2xl">
              <span className="mb-4 inline-flex rounded-full bg-[var(--yellow-ref)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                Avantages & réductions
              </span>

              <h2 className="typo-h1 mb-6">
                Le cyclisme devient une expérience connectée
              </h2>

              <p>
                Michelin connecte vos sorties à votre quotidien. Strava, GPS,
                montres connectées… vos kilomètres deviennent une nouvelle façon
                d’interagir avec la marque.
              </p>
            </div>

            {/* RIGHT - CTA STORE */}
            <div className="flex flex-col gap-4 md:items-end">
              <div className="flex flex-col gap-4 sm:flex-row md:justify-end">
                {/* App Store */}
                <a
                  href="https://www.apple.com/app-store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg bg-[var(--yellow-ref)] text-[var(--midnight-blue)] px-5 py-3 transition hover:opacity-90"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.564 12.568c-.02-2.23 1.82-3.293 1.904-3.343-1.036-1.514-2.648-1.72-3.22-1.744-1.37-.14-2.673.808-3.37.808-.698 0-1.77-.788-2.91-.766-1.497.022-2.89.87-3.66 2.2-1.55 2.687-.395 6.67 1.115 8.85.742 1.07 1.63 2.27 2.794 2.23 1.12-.045 1.54-.72 2.89-.72 1.35 0 1.73.72 2.91.7 1.2-.02 1.96-1.09 2.69-2.17.84-1.2 1.19-2.37 1.21-2.43-.026-.01-2.32-.89-2.34-3.517z" />
                  </svg>

                  <div className="flex flex-col leading-tight">
                    <span className="text-xs opacity-80">Télécharger sur</span>
                    <span className="text-sm font-semibold">App Store</span>
                  </div>
                </a>

                {/* Google Play */}
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg bg-[var(--yellow-ref)] text-[var(--midnight-blue)] px-5 py-3 transition hover:opacity-90"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3.6 2.2c-.4.3-.6.8-.6 1.4v16.8c0 .6.2 1.1.6 1.4l9.7-9.7L3.6 2.2zM14.2 10.5l2.6 2.6-12.4 6.9 9.8-9.5z" />
                  </svg>

                  <div className="flex flex-col leading-tight">
                    <span className="text-xs opacity-80">Disponible sur</span>
                    <span className="text-sm font-semibold">Google Play</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* CARDS */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* CARD 1 */}
            <div className="group relative overflow-hidden rounded-xl bg-[var(--midnight-blue)] p-6 text-white transition">
              <div className="mb-4 text-xs uppercase tracking-widest text-[var(--yellow-ref)]">
                01 — Connecter
              </div>

              <h3 className="mb-3 text-lg font-semibold">
                Vos applications sportives
              </h3>

              <p className="text-sm text-white/70">
                Synchronisez Strava ou votre montre connectée pour centraliser
                automatiquement vos activités.
              </p>

              <div className="mt-6 h-[2px] w-0 bg-[var(--yellow-ref)] transition-all duration-500 group-hover:w-full" />
            </div>

            {/* CARD 2 */}
            <div className="group relative overflow-hidden rounded-xl bg-[var(--midnight-blue)] p-6 text-white transition">
              <div className="mb-4 text-xs uppercase tracking-widest text-[var(--yellow-ref)]">
                02 — Explorer
              </div>

              <h3 className="mb-3 text-lg font-semibold">
                Analyse de vos parcours
              </h3>

              <p className="text-sm text-white/70">
                Vos kilomètres, terrains et usages permettent d’identifier les
                pneus les plus adaptés à votre pratique.
              </p>

              <div className="mt-6 h-[2px] w-0 bg-[var(--yellow-ref)] transition-all duration-500 group-hover:w-full" />
            </div>

            {/* CARD 3 */}
            <div className="group relative overflow-hidden rounded-xl bg-[var(--midnight-blue)] p-6 text-white transition">
              <div className="mb-4 text-xs uppercase tracking-widest text-[var(--yellow-ref)]">
                03 — Récompenser
              </div>

              <h3 className="mb-3 text-lg font-semibold">
                Avantages exclusifs
              </h3>

              <p className="text-sm text-white/70">
                Vos efforts se transforment en réductions et expériences sur les
                produits Michelin.
              </p>

              <div className="mt-6 h-[2px] w-0 bg-[var(--yellow-ref)] transition-all duration-500 group-hover:w-full" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
