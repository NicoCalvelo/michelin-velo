"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bike, CheckCircle2, Gauge, Map, RotateCcw, ShoppingBag, Sparkles } from "lucide-react";
import FilledButton from "@/app/_components/ui/Buttons/FilledButton";
import OutlinedButton from "@/app/_components/ui/Buttons/OutlinedButton";
import { Product } from "@/app/_models/product";
import { formatDimension, getFirstAvailableVariant, getProductPriceRange } from "@/app/product/_utils/productDisplay";

type ProfileKey = "road" | "gravel" | "mountain" | "city";

interface QuizOption {
  label: string;
  description: string;
  profile: ProfileKey;
  keywords: string[];
}

interface QuizQuestion {
  id: string;
  title: string;
  hint: string;
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "practice",
    title: "Votre sortie idéale, c'est plutôt quoi ?",
    hint: "Choisissez le terrain qui vous donne envie de repartir.",
    options: [
      {
        label: "Route rapide",
        description: "Allure soutenue, longues distances, rendement.",
        profile: "road",
        keywords: ["route", "performance", "rendement", "vitesse", "competition"],
      },
      {
        label: "Gravel aventure",
        description: "Asphalte, chemins, liberté de trajectoire.",
        profile: "gravel",
        keywords: ["gravel", "polyvalence", "aventure", "controle"],
      },
      {
        label: "VTT engagé",
        description: "Relief, appuis, grip et passages techniques.",
        profile: "mountain",
        keywords: ["vtt", "grip", "robustesse", "controle", "enduro"],
      },
      {
        label: "Ville active",
        description: "Trajets quotidiens, sécurité, fiabilité.",
        profile: "city",
        keywords: ["ville", "securite", "fiabilite", "longévite", "protection"],
      },
    ],
  },
  {
    id: "priority",
    title: "Qu'attendez-vous d'abord de vos pneus ?",
    hint: "La bonne recommandation part de votre besoin le plus concret.",
    options: [
      {
        label: "Plus de vitesse",
        description: "Un pneu qui accompagne vos accélérations.",
        profile: "road",
        keywords: ["vitesse", "rendement", "performance", "competition"],
      },
      {
        label: "Plus de polyvalence",
        description: "Rouler quand le terrain change.",
        profile: "gravel",
        keywords: ["polyvalence", "gravel", "aventure", "mixte"],
      },
      {
        label: "Plus d'adhérence",
        description: "Rester en confiance dans les passages difficiles.",
        profile: "mountain",
        keywords: ["adhérence", "grip", "controle", "traction"],
      },
      {
        label: "Plus de sécurité",
        description: "Freiner, tourner et repartir sereinement.",
        profile: "city",
        keywords: ["securite", "protection", "freinage", "pluie"],
      },
    ],
  },
  {
    id: "rhythm",
    title: "Votre rythme de pratique ?",
    hint: "Pour ajuster le niveau d'exigence sans surdimensionner le choix.",
    options: [
      {
        label: "Objectif performance",
        description: "Vous cherchez à progresser ou préparer un événement.",
        profile: "road",
        keywords: ["performance", "competition", "racing", "rendement"],
      },
      {
        label: "Sorties longues",
        description: "Vous aimez explorer et varier les surfaces.",
        profile: "gravel",
        keywords: ["longue distance", "aventure", "polyvalence", "durabilite"],
      },
      {
        label: "Sessions intenses",
        description: "Vous roulez fort quand le terrain se complique.",
        profile: "mountain",
        keywords: ["intense", "grip", "robustesse", "enduro"],
      },
      {
        label: "Usage régulier",
        description: "Vous voulez un choix fiable au quotidien.",
        profile: "city",
        keywords: ["usage régulier", "fiabilite", "longévite", "protection"],
      },
    ],
  },
  {
    id: "feeling",
    title: "La sensation la plus importante pour vous ?",
    hint: "Ce détail change souvent tout dans l'expérience de roulage.",
    options: [
      {
        label: "Un vélo plus vif",
        description: "Réactivité et rendement sur route.",
        profile: "road",
        keywords: ["vif", "reactivite", "rendement", "route"],
      },
      {
        label: "Un vélo plus libre",
        description: "Changer d'itinéraire sans se poser trop de questions.",
        profile: "gravel",
        keywords: ["liberte", "polyvalence", "gravel", "aventure"],
      },
      {
        label: "Un vélo plus posé",
        description: "Tenir la ligne quand le sol décroche.",
        profile: "mountain",
        keywords: ["controle", "grip", "stabilite", "terrain"],
      },
      {
        label: "Un vélo plus rassurant",
        description: "Garder le contrôle dans le trafic et la pluie.",
        profile: "city",
        keywords: ["rassurant", "securite", "pluie", "protection"],
      },
    ],
  },
];

const PROFILE_DETAILS: Record<ProfileKey, { title: string; summary: string; strengths: string[] }> = {
  road: {
    title: "Profil route performance",
    summary: "Vous cherchez un pneu vif, précis et rassurant pour garder du rythme sur la durée.",
    strengths: ["Rendement", "Précision", "Tubeless Ready"],
  },
  gravel: {
    title: "Profil gravel aventure",
    summary: "Vous voulez passer de la route aux chemins avec un pneu polyvalent et stable.",
    strengths: ["Polyvalence", "Contrôle", "Aventure"],
  },
  mountain: {
    title: "Profil VTT contrôle",
    summary: "Vous privilégiez l'adhérence, la robustesse et la confiance sur terrain technique.",
    strengths: ["Grip", "Robustesse", "Terrain engagé"],
  },
  city: {
    title: "Profil urbain sécurité",
    summary: "Vous recherchez un pneu fiable, lisible et rassurant pour les trajets réguliers.",
    strengths: ["Fiabilité", "Contrôle", "Usage régulier"],
  },
};

const BIKE_TYPE_LABELS: Record<string, string> = {
  road: "Route",
  mountain: "VTT",
  gravel: "Gravel",
  city: "Ville",
  bmx: "BMX",
  electric: "E-bike",
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasFirebaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
}

function getSelectedOptions(answers: Record<string, ProfileKey>) {
  return QUESTIONS.map((question) => question.options.find((option) => option.profile === answers[question.id])).filter(
    Boolean,
  ) as QuizOption[];
}

function getProductSearchText(product: Product) {
  return normalize(
    [
      product.name,
      product.brand,
      product.shortDescription,
      product.description,
      ...(product.tags ?? []),
      ...(product.bikeType ?? []),
      ...(product.variants ?? []).flatMap((variant) => [
        variant.title,
        variant.bead ?? "",
        variant.sidewallColor ?? "",
        variant.dimension?.isoSize ?? "",
      ]),
    ].join(" "),
  );
}

function scoreProduct(
  product: Product,
  winner: ProfileKey,
  selectedOptions: QuizOption[],
  profileScores: Record<ProfileKey, number>,
) {
  let score = 0;
  const productText = getProductSearchText(product);

  if ((product.bikeType ?? []).includes(winner)) score += 50;

  Object.entries(profileScores).forEach(([profile, count]) => {
    if ((product.bikeType ?? []).includes(profile as ProfileKey)) {
      score += count * 8;
    }
  });

  selectedOptions
    .flatMap((option) => option.keywords)
    .forEach((keyword) => {
      if (productText.includes(normalize(keyword))) score += 6;
    });

  return score;
}

function getBikeTypeLabel(product: Product) {
  return (product.bikeType ?? []).map((type) => BIKE_TYPE_LABELS[type] ?? type).join(" / ");
}

function getResult(answers: Record<string, ProfileKey>, products: Product[]) {
  const scores: Record<ProfileKey, number> = {
    road: 0,
    gravel: 0,
    mountain: 0,
    city: 0,
  };

  Object.values(answers).forEach((profile) => {
    scores[profile] += 1;
  });

  const winner = (Object.entries(scores) as Array<[ProfileKey, number]>).sort((a, b) => b[1] - a[1])[0][0];
  const details = PROFILE_DETAILS[winner];
  const selectedOptions = getSelectedOptions(answers);
  const rankedProducts = products
    .map((product) => ({
      product,
      score: scoreProduct(product, winner, selectedOptions, scores),
    }))
    .sort((a, b) => b.score - a.score);
  const recommendations = rankedProducts.filter((item) => item.score > 0).map((item) => item.product);
  const product = recommendations[0] ?? products[0] ?? null;

  return {
    profile: winner,
    details,
    product,
    recommendations: recommendations.slice(0, 3),
    score: Math.round((scores[winner] / QUESTIONS.length) * 100),
  };
}

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ProfileKey>>({});
  const [showResult, setShowResult] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [usesMockData, setUsesMockData] = useState(true);
  const currentQuestion = QUESTIONS[step];
  const isComplete = Object.keys(answers).length === QUESTIONS.length;
  const progress = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);
  const result = useMemo(
    () => (isComplete && showResult ? getResult(answers, products) : null),
    [answers, isComplete, products, showResult],
  );
  const recommendedProduct = result?.product ?? null;
  const recommendedVariant = recommendedProduct ? getFirstAvailableVariant(recommendedProduct) : null;
  const alternativeProducts =
    result?.recommendations.filter((product) => product.id !== recommendedProduct?.id).slice(0, 2) ?? [];

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      if (!hasFirebaseConfig()) {
        setLoadingProducts(false);
        return;
      }

      try {
        const { default: ProductRepository } = await import("@/app/_repositories/product_repository");
        const data = await ProductRepository.getActiveProducts(100);

        if (!mounted) return;

        if (data.length > 0) {
          setProducts(data);
          setUsesMockData(false);
        } else {
          setProducts([]);
          setUsesMockData(true);
        }
      } catch {
        if (!mounted) return;
        setProducts([]);
        setUsesMockData(true);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const selectAnswer = (profile: ProfileKey) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: profile }));
  };

  const goNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep((value) => value + 1);
      return;
    }

    if (isComplete) setShowResult(true);
  };

  const resetQuiz = () => {
    setAnswers({});
    setStep(0);
    setShowResult(false);
  };

  return (
    <main className="min-h-screen bg-background-dark">
      <section className="bg-primary-dark text-primary-on">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/product"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-light hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux produits
          </Link>

          <div className="mt-4 grid items-center gap-8 lg:grid-cols-[1fr_360px]">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary-color px-4 py-2 text-sm font-bold text-secondary-on">
              Quiz
            </span>

            <div className="rounded-lg border border-white/15 bg-white/10 p-4 w-full">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Progression</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-secondary-color transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!result ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <p className="text-sm font-bold uppercase text-primary-color">
                Question {step + 1} / {QUESTIONS.length}
              </p>
              <h2 className="mt-2 text-2xl font-black text-primary-dark">{currentQuestion.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{currentQuestion.hint}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {currentQuestion.options.map((option) => {
                  const selected = answers[currentQuestion.id] === option.profile;

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => selectAnswer(option.profile)}
                      className={`min-h-32 rounded-lg border p-4 text-left transition-colors ${
                        selected
                          ? "border-primary-color bg-primary-light text-primary-dark"
                          : "border-gray-200 bg-white text-primary-dark hover:border-primary-color hover:bg-background-dark"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="block text-base font-black">{option.label}</span>
                          <span className="mt-2 block text-sm leading-6 text-gray-600">{option.description}</span>
                        </span>
                        {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-color" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <OutlinedButton
                  className="justify-center bg-white"
                  disabled={step === 0}
                  onClick={() => setStep((value) => Math.max(0, value - 1))}
                >
                  Précédent
                </OutlinedButton>
                <FilledButton
                  className="justify-center"
                  disabled={!answers[currentQuestion.id] || (step === QUESTIONS.length - 1 && loadingProducts)}
                  onClick={goNext}
                  hasIcon
                >
                  {step === QUESTIONS.length - 1
                    ? loadingProducts
                      ? "Chargement des produits..."
                      : "Voir ma recommandation"
                    : "Continuer"}
                  <ArrowRight className="h-4 w-4" />
                </FilledButton>
              </div>
            </article>

            <aside className="grid gap-3">
              {[
                {
                  icon: Bike,
                  title: "Pratique",
                  text: "Route, gravel, VTT ou ville.",
                },
                {
                  icon: Gauge,
                  title: "Sensation",
                  text: "Vitesse, grip, contrôle ou sécurité.",
                },
                {
                  icon: Map,
                  title: "Terrain",
                  text: "Un choix adapté à vos sorties réelles.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-lg border border-gray-200 bg-white p-4">
                    <Icon className="h-5 w-5 text-primary-color" />
                    <h3 className="mt-3 text-base font-black text-primary-dark">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-600">{item.text}</p>
                  </div>
                );
              })}
            </aside>
          </div>
        ) : recommendedProduct ? (
          <div className="space-y-6">
            <div className="rounded-lg bg-primary-dark p-5 text-primary-on sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                <div>
                  <p className="text-sm font-bold uppercase text-secondary-color">Votre profil</p>
                  <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">{result.details.title}</h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-primary-light">{result.details.summary}</p>
                </div>

                <div className="rounded-lg border border-white/15 bg-white/10 p-4">
                  <p className="text-sm font-semibold text-primary-light">Compatibilité estimée</p>
                  <p className="mt-1 text-5xl font-black text-secondary-color">{result.score}%</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.details.strengths.map((strength) => (
                      <span key={strength} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {usesMockData && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                Catalogue réel indisponible pour le moment : recommandation de démonstration affichée.
              </p>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
              <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="grid md:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]">
                  <div className="relative min-h-72 bg-primary-light">
                    {recommendedProduct.images?.[0] ? (
                      <Image
                        src={recommendedProduct.images[0].url}
                        alt={recommendedProduct.images[0].altText ?? recommendedProduct.name}
                        fill
                        priority
                        unoptimized
                        sizes="(min-width: 1024px) 38vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-72 items-center justify-center">
                        <div className="h-44 w-44 rounded-full border-[26px] border-gray-900 bg-white shadow-inner">
                          <div className="m-auto mt-12 h-16 w-16 rounded-full border-[10px] border-primary-color bg-primary-light" />
                        </div>
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-secondary-color px-3 py-1 text-xs font-bold text-secondary-on">
                      Recommandé
                    </span>
                  </div>

                  <div className="flex flex-col gap-5 p-5 sm:p-6">
                    <div>
                      <p className="text-sm font-bold uppercase text-primary-color">
                        {recommendedProduct.brand} · {getBikeTypeLabel(recommendedProduct)}
                      </p>
                      <h3 className="mt-2 text-2xl font-black leading-tight text-primary-dark">
                        {recommendedProduct.name}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-gray-600">{recommendedProduct.shortDescription}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-background-dark p-3">
                        <p className="text-xs font-bold uppercase text-gray-500">Prix</p>
                        <p className="mt-1 text-lg font-black text-primary-color">
                          {getProductPriceRange(recommendedProduct)}
                        </p>
                      </div>
                      <div className="col-span-2 rounded-lg bg-background-dark p-3">
                        <p className="text-xs font-bold uppercase text-gray-500">Dimension conseillée</p>
                        <p className="mt-1 font-black text-primary-dark">{formatDimension(recommendedVariant)}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={`/product/${recommendedProduct.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-color px-6 py-3 font-semibold text-primary-on transition-colors hover:bg-primary-dark"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Voir ce pneu
                      </Link>
                      <button
                        type="button"
                        onClick={resetQuiz}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-color bg-white px-6 py-3 font-semibold text-primary-color transition-colors hover:bg-primary-light"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Refaire le quiz
                      </button>
                    </div>
                  </div>
                </div>
              </article>

              <aside className="space-y-4">
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <p className="text-sm font-bold uppercase text-primary-color">Pourquoi ce choix ?</p>
                  <div className="mt-4 space-y-3">
                    {result.details.strengths.map((strength) => (
                      <p key={strength} className="flex items-start gap-3 text-sm leading-6 text-gray-600">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-color" />
                        <span>{strength}</span>
                      </p>
                    ))}
                    <p className="flex items-start gap-3 text-sm leading-6 text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-color" />
                      <span>Produit disponible dans le catalogue actuel.</span>
                    </p>
                  </div>
                </div>

                {alternativeProducts.length > 0 && (
                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <p className="text-sm font-bold uppercase text-primary-color">Autres pistes</p>
                    <div className="mt-4 space-y-3">
                      {alternativeProducts.map((product) => (
                        <Link
                          key={product.id ?? product.slug}
                          href={`/product/${product.id}`}
                          className="block rounded-lg border border-gray-100 bg-background-dark p-3 transition-colors hover:border-primary-color"
                        >
                          <p className="text-sm font-black text-primary-dark">{product.name}</p>
                          <p className="mt-1 text-xs font-semibold text-primary-color">
                            {getProductPriceRange(product)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="font-bold text-primary-dark">Aucune recommandation disponible pour le moment.</p>
            <button
              type="button"
              onClick={resetQuiz}
              className="mx-auto mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-primary-color bg-white px-6 py-3 font-semibold text-primary-color transition-colors hover:bg-primary-light"
            >
              <RotateCcw className="h-4 w-4" />
              Refaire le quiz
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
