import "./globals.css";
import type { Metadata } from "next";
import Footer from "./_components/Footer";
import { Lexend } from "next/font/google";
import { Toasts } from "@/app/_components/Toasts";
import SignInModal from "./_components/auth/SignInModal";
import AskForInputModal from "@/app/_components/AskForInputModal";
import ConfirmationModal from "@/app/_components/ConfirmationModal";

export const metadata: Metadata = {
  title: "Vélo Michelin Marketplace",
  description: "Vente et achat de vélos d'occasion, pièces détachées et accessoires pour cyclistes.",
  keywords:
    "vélo, vélo haut de gamme, vélo premium, vélo pro, accessoires vélo, pièces détachées, cyclisme, cycliste, marché du vélo, vente de vélos, achat de vélos, vélo d'occasion, vélo neuf",
};

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={lexend.className}>
        {children}
        <Footer />
        <div id="toasts"></div>
        <div id="confirmation_dialogs"></div>
        <Toasts />
        <ConfirmationModal />
        <AskForInputModal />
        <SignInModal />
      </body>
    </html>
  );
}
