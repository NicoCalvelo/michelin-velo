import "./globals.css";
import type { Metadata } from "next";
import Footer from "./_components/Footer";
import NavBar from "./_components/NavBar";
import { Lexend } from "next/font/google";
import { Toasts } from "@/app/_components/ui/Components/Toasts";
import SignInModal from "./_components/auth/SignInModal";
import ConfirmationModal from "@/app/_components/ui/Dialogs/ConfirmationModal";

export const metadata: Metadata = {
  title: "Vélo Michelin Marketplace",
  description:
    "Vente et achat de vélos d'occasion, pièces détachées et accessoires pour cyclistes.",
  keywords:
    "vélo, vélo haut de gamme, vélo premium, vélo pro, accessoires vélo, pièces détachées, cyclisme, cycliste, marché du vélo, vente de vélos, achat de vélos, vélo d'occasion, vélo neuf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <NavBar />
        {children}
        <Footer />
        <div id="toasts"></div>
        <div id="confirmation_dialogs"></div>
        <Toasts />
        <ConfirmationModal />
        <SignInModal />
      </body>
    </html>
  );
}
