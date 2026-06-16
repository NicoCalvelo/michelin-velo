"use client";
import { Counter } from "@/functions/Counter";
import Slider from "./_components/Slider";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Gauge,
  Leaf,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import FilledButton from "./_components/ui/Buttons/FilledButton";

export default function Home() {
  const items = [
    {
      id: 1,
      title: "Romain Bardet",
      subtitle: "Ambassadeur Gravel Michelin",
      description:
        "La performance naît de l'expérience du terrain. Chaque course contribue à développer les pneus de demain.",
      image: "/demo.jpg",
      button: "En savoir plus",
    },
    {
      id: 2,
      title: "En mouvement pour demain",
      subtitle: "Nos actions pour un cyclisme plus durable",
      image: "/demo.jpg",
    },
    {
      id: 3,
      title: "Pneu Course",
      subtitle: "Léger et rapide",
      image: "/demo.jpg",
    },
  ];

  return (
    <main className="flex flex-col gap-24">
      <div className="relative pb-20">
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
                Été
              </span>

              <span className="absolute -right-2 bottom-6 animate-bounce rounded-full bg-white/10 px-3 py-1 text-xs font-semibold [animation-delay:300ms]">
                Hiver
              </span>
            </div>
          </div>
        </section>
      </div>
      <section className="flex flex-col gap-6 justify-center text-center bg-[var(--midnight-blue)] text-white py-12 px-6">
        <h1>Quelques chiffres</h1>
        <div className="flex gap-8 justify-center mt-4">
          <div className="border-2 border-[var(--primary)] rounded-lg p-4 text-center flex flex-col justify-center items-center">
            <Award className="w-15 h-15 mb-4" aria-hidden="true" />
            <Counter
              end={10000}
              prefix="+ "
              style={{ color: "var(--yellow-ref)" }}
            />
            <p>Brevets déposés</p>
          </div>
          <div className="border-2 border-[var(--primary)] rounded-lg p-4 text-center flex flex-col justify-center items-center">
            <Leaf className="w-15 h-15 mb-4" aria-hidden="true" />
            <Counter
              end={40}
              suffix="%"
              style={{ color: "var(--yellow-ref)" }}
            />
            <p>
              de matériaux durables <br />
              d'ici 2030
            </p>
          </div>
          <div className="border-2 border-[var(--primary)] rounded-lg p-4 text-center flex flex-col justify-center items-center">
            <Lightbulb className="w-15 h-15 mb-4" aria-hidden="true" />
            <Counter end={130} style={{ color: "var(--yellow-ref)" }} />
            <p>ans d'innovation</p>
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-6 justify-center text-center">
        <h1>Nos pneus</h1>
        <div className="flex justify-center mt-4 flex-wrap gap-4 items-center">
          <div>
            <div className="flex justify-center mt-4">
              <div className="group w-64 h-64 md:w-80 md:h-80 rounded-lg overflow-hidden shadow-sm relative transition-transform duration-300 hover:scale-105 cursor-pointer">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/demo.jpg')" }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/40"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="typo-h1 text-white m-0 transition-transform duration-300 group-hover:-translate-y-2">
                    VTT
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-center mt-4">
              <div className="group w-64 h-64 md:w-80 md:h-80 rounded-lg overflow-hidden shadow-sm relative transition-transform duration-300 hover:scale-105 cursor-pointer">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/demo.jpg')" }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/40"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="typo-h1 text-white m-0 transition-transform duration-300 group-hover:-translate-y-2">
                    Gravel et Cross
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-center mt-4">
              <div className="group w-64 h-64 md:w-80 md:h-80 rounded-lg overflow-hidden shadow-sm relative transition-transform duration-300 hover:scale-105 cursor-pointer">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/demo.jpg')" }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/40"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="typo-h1 text-white m-0 transition-transform duration-300 group-hover:-translate-y-2">
                    Vélo de course
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-center mt-4">
              <div className="group w-64 h-64 md:w-80 md:h-80 rounded-lg overflow-hidden shadow-sm relative transition-transform duration-300 hover:scale-105 cursor-pointer">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/demo.jpg')" }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/40"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="typo-h1 text-white m-0 transition-transform duration-300 group-hover:-translate-y-2">
                    Tour et ville
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
