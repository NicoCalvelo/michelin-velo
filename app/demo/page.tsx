"use client";
import React, { useState } from "react";
import FilledButton, { SecondaryFilledButton } from "../_components/ui/Buttons/FilledButton";
import TextButton from "../_components/ui/Buttons/TextButton";
import FormInput from "../_components/ui/Forms/FormInput";
import FormSelect from "../_components/ui/Forms/FormSelect";
import ElevatedCard from "../_components/ui/Cards/ElevatedCard";
import Link from "next/link";

export default function DemoPage() {
  const [openModal, setOpenModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  function triggerToast() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  return (
    <div>
      <main className="site-container py-8">
        <section className="mb-8">
          <h1>Demo: Charte & Composants</h1>
          <p className="mb-4 text-sm text-gray-600">Palette, typographie et composants (mobile-first).</p>

          <div className="flex gap-3 mb-4">
            <FilledButton>Primaire</FilledButton>
            <SecondaryFilledButton>Secondaire</SecondaryFilledButton>
            <TextButton>Lien</TextButton>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Formulaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput title="Nom" placeholder="Entrez votre nom" />
            <FormInput title="Email (erreur)" placeholder="email@exemple" errorMessage="Email invalide" />
            <FormSelect
              title="Catégorie"
              placeholder="Sélectionnez une catégorie"
              options={[
                { value: "velos", label: "Vélos" },
                { value: "accessoires", label: "Accessoires" },
                { value: "pneus", label: "Pneus" },
              ]}
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Outils</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <FilledButton onClick={() => setOpenModal(true)}>Ouvrir la modal</FilledButton>
            <SecondaryFilledButton onClick={triggerToast}>Montrer le toast</SecondaryFilledButton>
            <Link href="/a-propos">Aller à la page À propos</Link>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Exemples généraux</h2>
          <ElevatedCard className="p-4">
            <h3 className="text-lg font-semibold">Card simple</h3>
            <p className="text-sm text-gray-600">Contenu de démonstration dans une carte.</p>
          </ElevatedCard>
        </section>
      </main>
    </div>
  );
}
