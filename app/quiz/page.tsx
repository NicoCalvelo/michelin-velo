"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bike, CheckCircle2, Gauge, Map, RotateCcw, ShoppingBag, Sparkles } from "lucide-react";
import FilledButton from "@/app/_components/ui/Buttons/FilledButton";
import OutlinedButton from "@/app/_components/ui/Buttons/OutlinedButton";
import PublicProductCard from "@/app/product/_components/PublicProductCard";
import { MOCK_PRODUCTS } from "@/app/product/_data/mockProducts";

type ProfileKey = "road" | "gravel" | "mountain" | "city";

interface QuizOption {
  label: string;
  description: string;
  profile: ProfileKey;
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
      { label: "Route rapide", description: "Allure soutenue, longues distances, rendement.", profile: "road" },
      { label: "Gravel aventure", description: "Asphalte, chemins, liberté de trajectoire.", profile: "gravel" },
      { label: "VTT engagé", description: "Relief, appuis, grip et passages techniques.", profile: "mountain" },
      { label: "Ville active", description: "Trajets quotidiens, sécurité, fiabilité.", profile: "city" },
    ],
  },
  {
    id: "priority",
    title: "Qu'attendez-vous d'abord de vos pneus ?",
    hint: "La bonne recommandation part de votre besoin le plus concret.",
    options: [
      { label: "Plus de vitesse", description: "Un pneu qui accompagne vos accélérations.", profile: "road" },
      { label: "Plus de polyvalence", description: "Rouler quand le terrain change.", profile: "gravel" },
      { label: "Plus d'adhérence", description: "Rester en confiance dans les passages difficiles.", profile: "mountain" },
      { label: "Plus de sécurité", description: "Freiner, tourner et repartir sereinement.", profile: "city" },
    ],
  },
  {
    id: "rhythm",
    title: "Votre rythme de pratique ?",
    hint: "Pour ajuster le niveau d'exigence sans surdimensionner le choix.",
    options: [
      { label: "Objectif performance", description: "Vous cherchez à progresser ou préparer un événement.", profile: "road" },
      { label: "Sorties longues", description: "Vous aimez explorer et varier les surfaces.", profile: "gravel" },
      { label: "Sessions intenses", description: "Vous roulez fort quand le terrain se complique.", profile: "mountain" },
      { label: "Usage régulier", description: "Vous voulez un choix fiable au quotidien.", profile: "city" },
    ],
  },
  {
    id: "feeling",
    title: "La sensation la plus importante pour vous ?",
    hint: "Ce détail change souvent tout dans l'expérience de roulage.",
    options: [
      { label: "Un vélo plus vif", description: "Réactivité et rendement sur route.", profile: "road" },
      { label: "Un vélo plus libre", description: "Changer d'itinéraire sans se poser trop de questions.", profile: "gravel" },
      { label: "Un vélo plus posé", description: "Tenir la ligne quand le sol décroche.", profile: "mountain" },
      { label: "Un vélo plus rassurant", description: "Garder le contrôle dans le trafic et la pluie.", profile: "city" },
    ],
  },
];

const PROFILE_DETAILS: Record<ProfileKey, { title: string; summary: string; productId: string; strengths: string[] }> = {
  road: {
    title: "Profil route performance",
    summary: "Vous cherchez un pneu vif, précis et rassurant pour garder du rythme sur la durée.",
    productId: "mock-power-cup-tlr",
    strengths: ["Rendement", "Précision", "Tubeless Ready"],
  },
  gravel: {
    title: "Profil gravel aventure",
    summary: "Vous voulez passer de la route aux chemins avec un pneu polyvalent et stable.",
    productId: "mock-power-gravel",
    strengths: ["Polyvalence", "Contrôle", "Aventure"],
  },
  mountain: {
    title: "Profil VTT contrôle",
    summary: "Vous privilégiez l'adhérence, la robustesse et la confiance sur terrain technique.",
    productId: "mock-wild-enduro",
    strengths: ["Grip", "Robustesse", "Terrain engagé"],
  },
  city: {
    title: "Profil urbain sécurité",
    summary: "Vous recherchez un pneu fiable, lisible et rassurant pour les trajets réguliers.",
    productId: "mock-power-gravel",
    strengths: ["Fiabilité", "Contrôle", "Usage régulier"],
  },
};

function getResult(answers: Record<string, ProfileKey>) {
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
  const product = MOCK_PRODUCTS.find((item) => item.id === details.productId) ?? MOCK_PRODUCTS[0];

  return { profile: winner, details, product, score: Math.round((scores[winner] / QUESTIONS.length) * 100) };
}

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ProfileKey>>({});
  const [showResult, setShowResult] = useState(false);
  const currentQuestion = QUESTIONS[step];
  const isComplete = Object.keys(answers).length === QUESTIONS.length;
  const progress = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);
  const result = useMemo(() => (isComplete && showResult ? getResult(answers) : null), [answers, isComplete, showResult]);

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
          <Link href="/product" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-light hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Retour aux produits
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="space-y-4">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary-color px-4 py-2 text-sm font-bold text-secondary-on">
                <Sparkles className="h-4 w-4" />
                Sélecteur Michelin Bike
              </span>
              <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
                Quelques réponses. Un pneu plus juste.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-primary-light sm:text-lg">
                Dites-nous comment vous roulez. Nous vous orientons vers le pneu Michelin le plus cohérent avec votre pratique, vos sensations et votre niveau d&apos;exigence.
              </p>
            </div>

            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Progression</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-secondary-color transition-all" style={{ width: `${progress}%` }} />
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
                  disabled={!answers[currentQuestion.id]}
                  onClick={goNext}
                  hasIcon
                >
                  {step === QUESTIONS.length - 1 ? "Voir ma recommandation" : "Continuer"}
                  <ArrowRight className="h-4 w-4" />
                </FilledButton>
              </div>
            </article>

            <aside className="grid gap-3">
              {[
                { icon: Bike, title: "Pratique", text: "Route, gravel, VTT ou ville." },
                { icon: Gauge, title: "Sensation", text: "Vitesse, grip, contrôle ou sécurité." },
                { icon: Map, title: "Terrain", text: "Un choix adapté à vos sorties réelles." },
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
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <article className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <p className="text-sm font-bold uppercase text-primary-color">Votre profil</p>
              <h2 className="mt-2 text-3xl font-black text-primary-dark">{result.details.title}</h2>
              <p className="mt-3 text-base leading-7 text-gray-600">{result.details.summary}</p>

              <div className="mt-6 rounded-lg bg-primary-dark p-5 text-primary-on">
                <p className="text-sm font-semibold text-primary-light">Compatibilité estimée</p>
                <p className="mt-2 text-5xl font-black text-secondary-color">{result.score}%</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.details.strengths.map((strength) => (
                    <span key={strength} className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/product/${result.product.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-color px-6 py-3 font-semibold text-primary-on transition-colors hover:bg-primary-dark"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Voir le produit
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
            </article>

            <div>
              <p className="mb-3 text-sm font-bold uppercase text-primary-color">Recommandation Michelin</p>
              <PublicProductCard product={result.product} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
