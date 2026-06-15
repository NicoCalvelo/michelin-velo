"use client";
import React, { useState } from "react";
import Navbar from "../../components/ui/Navbar";
import Button from "../../components/ui/Button";
import ProductCard from "../../components/ui/ProductCard";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import Link from "../../components/ui/Link";
import Modal from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";

export default function DemoPage() {
  const [openModal, setOpenModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  function triggerToast() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  return (
    <div>
      <Navbar />
      <main className="site-container py-8">
        <section className="mb-8">
          <h1>Demo: Charte & Composants</h1>
          <p className="mb-4 text-sm text-gray-600">
            Palette, typographie et composants (mobile-first). Modifiez les
            tokens dans <code>app/globals.css</code> pour rafraîchir le thème.
          </p>

          <div className="flex gap-4 items-center mb-6">
            <div
              style={{
                background: "var(--color-primary)",
                width: 120,
                height: 80,
              }}
              className="rounded-lg shadow-sm"
            />
            <div
              style={{
                background: "var(--color-secondary)",
                width: 120,
                height: 80,
              }}
              className="rounded-lg shadow-sm"
            />
            <div
              style={{
                background: "var(--color-accent)",
                width: 120,
                height: 80,
              }}
              className="rounded-lg shadow-sm"
            />
          </div>

          <div className="flex gap-3 mb-4">
            <Button>Primaire</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="link">Lien</Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Formulaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nom" placeholder="Entrez votre nom" />
            <Input
              label="Email (erreur)"
              placeholder="email@exemple"
              error="Email invalide"
            />
            <Select label="Catégorie">
              <option>Vélos</option>
              <option>Accessoires</option>
              <option>Pneus</option>
            </Select>
            <div>
              <label className="block mb-1 text-sm font-medium">Badges</label>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Cartes & Produits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <ProductCard title="Vélo urbain" price="€799" />
            <ProductCard title="Casque" price="€59" />
            <ProductCard title="Pneu Michelin" price="€29" />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Outils</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setOpenModal(true)}>Ouvrir la modal</Button>
            <Button variant="secondary" onClick={triggerToast}>
              Montrer le toast
            </Button>
            <Link href="/a-propos">Aller à la page À propos</Link>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Exemples généraux</h2>
          <Card className="p-4">
            <h3 className="text-lg font-semibold">Card simple</h3>
            <p className="text-sm text-gray-600">
              Contenu de démonstration dans une carte.
            </p>
          </Card>
        </section>
      </main>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Modal de test"
      >
        <p>
          Contenu de la modal. Cliquez en dehors ou sur Fermer pour la fermer.
        </p>
      </Modal>

      {showToast && <Toast>Notification: action réussie</Toast>}
    </div>
  );
}
