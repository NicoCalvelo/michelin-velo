"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bike,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Gift,
  LockKeyhole,
  MapPin,
  Medal,
  Timer,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { showSignInModal } from "@/app/_components/auth/SignInModal";
import FilledButton from "../_components/ui/Buttons/FilledButton";
import { useRouter } from "next/navigation";
import { RowEnd } from "../_components/ui/Layout/Rows";

type ChallengeStatus = "active" | "premium" | "completed";
type ChallengeCategory = "distance" | "regularity" | "exploration";

interface Challenge {
  id: string;
  title: string;
  category: ChallengeCategory;
  status: ChallengeStatus;
  distanceGoalKm: number;
  progressPercent: number;
  reward: string;
  rewardDetail: string;
  period: string;
  location: string;
  proof: string;
  partner: string;
}

const STATUS_FILTERS: { value: "all" | ChallengeStatus; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "active", label: "Actifs" },
  { value: "premium", label: "Premium" },
  { value: "completed", label: "Réussis" },
];

const CHALLENGES: Challenge[] = [
  {
    id: "june-road-120",
    title: "120 km route en 14 jours",
    category: "distance",
    status: "active",
    distanceGoalKm: 120,
    progressPercent: 68,
    reward: "-15%",
    rewardDetail: "sur une sélection route Performance Line",
    period: "Jusqu'au 30 juin",
    location: "Route",
    proof: "Synchronisation Strava ou GPS",
    partner: "Michelin Bicycle",
  },
  {
    id: "gravel-weekend",
    title: "Week-end gravel 45 km",
    category: "exploration",
    status: "premium",
    distanceGoalKm: 45,
    progressPercent: 24,
    reward: "Pack entretien",
    rewardDetail: "offert chez un revendeur partenaire",
    period: "Ce week-end",
    location: "Gravel",
    proof: "Trace GPS validée",
    partner: "Revendeurs premium",
  },
  {
    id: "commute-five",
    title: "5 trajets vélotaf",
    category: "regularity",
    status: "active",
    distanceGoalKm: 35,
    progressPercent: 40,
    reward: "-10%",
    rewardDetail: "sur pneus ville et e-bike",
    period: "7 jours restants",
    location: "Ville",
    proof: "5 activités distinctes",
    partner: "Michelin Mobility",
  },
  {
    id: "wet-grip",
    title: "Sortie confiance pluie",
    category: "exploration",
    status: "completed",
    distanceGoalKm: 25,
    progressPercent: 100,
    reward: "Code débloqué",
    rewardDetail: "avantage valable 15 jours",
    period: "Terminé",
    location: "Route / Ville",
    proof: "Activité validée",
    partner: "Michelin Bicycle",
  },
];

const CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  distance: "Distance",
  regularity: "Régularité",
  exploration: "Exploration",
};

const STATUS_STYLES: Record<ChallengeStatus, string> = {
  active: "bg-success-light text-success-dark",
  premium: "bg-secondary-light text-secondary-on",
  completed: "bg-primary-light text-primary-color",
};

const STATUS_LABELS: Record<ChallengeStatus, string> = {
  active: "Actif",
  premium: "Premium",
  completed: "Réussi",
};

function getChallengeAction(challenge: Challenge) {
  if (challenge.status === "completed") {
    return {
      href: "#avantages",
      label: "Voir le code",
      icon: CheckCircle2,
    };
  }

  if (challenge.status === "premium") {
    return {
      href: "#premium",
      label: "Voir l'abonnement Premium",
      icon: LockKeyhole,
    };
  }

  return {
    href: "#strava",
    label: "Connecter Strava",
    icon: Activity,
  };
}

export default function ChallengesPage() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<"all" | ChallengeStatus>("all");

  const filteredChallenges = useMemo(() => {
    if (activeStatus === "all") return CHALLENGES;
    return CHALLENGES.filter((challenge) => challenge.status === activeStatus);
  }, [activeStatus]);

  const completedCount = CHALLENGES.filter((challenge) => challenge.status === "completed").length;
  const averageProgress = Math.round(
    CHALLENGES.reduce((total, challenge) => total + challenge.progressPercent, 0) / CHALLENGES.length,
  );

  return (
    <main className="min-h-screen bg-background-dark">
      <section className="bg-primary-dark text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center gap-6">
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase text-secondary-color">Challenges Michelin Bike</p>
              <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                Transformez vos sorties en avantages.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-primary-light sm:text-lg">
                Relevez des défis adaptés à votre pratique, faites valider vos kilomètres et débloquez des réductions ou
                des conseils en fonction de vos activités à vélo.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="#defis"
                className="btn inline-flex items-center gap-2 bg-secondary-color text-secondary-on hover:bg-secondary-dark"
              >
                <Trophy className="h-4 w-4" />
                Voir les défis
              </Link>
              <Link
                href="#strava"
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500  px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
              >
                <Activity className="h-4 w-4" />
                Connecter Strava
              </Link>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/15 bg-white/10">
            <Image
              src="/demo.jpg"
              alt="Cycliste Michelin en sortie"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-primary-dark/45" />
            <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold uppercase text-secondary-color">Challenges complétés</p>
                  <p className="text-2xl font-black">{completedCount}</p>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold uppercase text-secondary-color">Progression moyenne</p>
                  <p className="text-2xl font-black">{averageProgress}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="strava" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-12 mt-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 rounded-lg border border-gray-200 bg-white p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#fc4c02] text-white">
              <Activity className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-bold uppercase text-primary-color">Suivi Strava</p>
            <h2 className="mt-2 text-2xl font-black text-primary-dark">Validez vos défis avec vos sorties réelles.</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Une fois votre compte connecté, vos activités vélo peuvent alimenter automatiquement la progression des
              défis : distance, fréquence, terrain et période.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://www.strava.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#fc4c02] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Connecter mon compte Strava
                <ExternalLink className="h-4 w-4" />
              </a>
              <Link
                href="#participer"
                className="inline-flex items-center gap-2 rounded-lg border border-primary-color px-4 py-2 text-sm font-semibold text-primary-color transition-colors hover:bg-primary-light"
              >
                Voir le parcours
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-lg bg-background-dark p-4">
            <div className="rounded-lg bg-primary-dark p-4 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-secondary-color">Activité synchronisée</p>
                  <h3 className="mt-1 text-xl font-black">Sortie route du matin</h3>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-secondary-color">
                  Strava
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Distance", "42,6 km"],
                  ["Durée", "1 h 34"],
                  ["Défi", "+35%"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white p-3 text-primary-dark">
                    <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
                    <p className="mt-1 text-lg font-black">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-white/10 p-3">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Challenge 120 km route</span>
                  <span className="font-bold text-secondary-color">68%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[68%] rounded-full bg-secondary-color" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="participer" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-14 sm:px-6 lg:px-8">
        <article className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="mt-1 text-2xl font-black text-primary-dark">Comment participer ?</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              [Timer, "1", "Choisir", "Objectif et avantage visibles avant départ."],
              [Activity, "2", "Synchroniser", "Strava met à jour les kilomètres."],
              [Bike, "3", "Rouler", "La progression évolue après chaque sortie."],
              [
                Gift,
                "4",
                "Débloquer",
                "Un code de réduction, un produit offert ou tout autre avantage que peut proposer nos revendeurs.",
              ],
            ].map(([Icon, step, title, text]) => {
              const StepIcon = Icon;

              return (
                <div key={title as string} className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-color text-sm font-black text-primary-on">
                      {step as string}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <StepIcon className="h-8 w-8 shrink-0 text-primary-color" />
                        <h4 className="text-base font-black text-primary-dark">{title as string}</h4>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-gray-600">{text as string}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section id="defis" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-primary-color">Programme challenges</p>
            <h2 className="mt-1 text-2xl font-black text-primary-dark">Défis disponibles</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveStatus(filter.value)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  activeStatus === filter.value
                    ? "border-primary-color bg-primary-color text-primary-on"
                    : "border-gray-200 bg-white text-primary-color hover:border-primary-color"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {filteredChallenges.map((challenge) => {
            const action = getChallengeAction(challenge);
            const ActionIcon = action.icon;

            return (
              <article key={challenge.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[challenge.status]}`}>
                        {STATUS_LABELS[challenge.status]}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                        {CATEGORY_LABELS[challenge.category]}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-black text-primary-dark">{challenge.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      Objectif de {challenge.distanceGoalKm} km avec validation par {challenge.proof.toLowerCase()}.
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary-color px-4 py-3 text-secondary-on sm:text-right">
                    <p className="text-xs font-bold uppercase">Avantage</p>
                    <p className="mt-1 text-xl font-black">{challenge.reward}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary-dark">Progression</span>
                    <span className="font-bold text-primary-color">{challenge.progressPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-primary-color"
                      style={{ width: `${challenge.progressPercent}%` }}
                    />
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    [CalendarDays, "Période", challenge.period],
                    [MapPin, "Terrain", challenge.location],
                    [BadgeCheck, "Validation", challenge.proof],
                    [Medal, "Partenaire", challenge.partner],
                  ].map(([Icon, label, value]) => {
                    const DetailIcon = Icon;

                    return (
                      <div key={`${challenge.id}-${label}`} className="flex gap-3 rounded-lg bg-gray-50 p-3">
                        <DetailIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-color" />
                        <div>
                          <dt className="text-xs font-bold uppercase text-gray-500">{label as string}</dt>
                          <dd className="mt-1 font-semibold text-primary-dark">{value as string}</dd>
                        </div>
                      </div>
                    );
                  })}
                </dl>

                <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-gray-600">{challenge.rewardDetail}</p>
                  <Link
                    href={action.href}
                    className={
                      "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-on transition-colors hover:bg-primary-dark " +
                      (action.label === "Connecter Strava" ? "bg-orange-500" : "bg-primary-color")
                    }
                  >
                    <ActionIcon className="h-4 w-4" />
                    {action.label}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
