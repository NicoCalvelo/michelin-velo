"use client";

import { User } from "firebase/auth";
import { Mail, Loader2 } from "lucide-react";
import FormInput from "@/app/_components/ui/Forms/FormInput";
import React, { useEffect, useState } from "react";
import GoogleSignInButton from "./GoogleSignInButton";
import OutlinedButton from "@/app/_components/ui/Buttons/OutlinedButton";
import GenericModal, { ModalSize } from "@/app/_components/ui/Dialogs/GenericModal";

interface SignInModalInfo {
  title: string;
  comment: string;
  buttonText: string;
}

function hasFirebaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
}

export default function SignInModal(): React.JSX.Element {
  const [connectedUser, setConnectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [isLoadingGoogle, setIsLoadingGoogle] = useState<boolean>(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [info, setInfo] = useState<SignInModalInfo>({
    title: "Connectez-vous pour accéder à cette section",
    comment: "Vous devez être connecté pour voir les commentaires.",
    buttonText: "Se connecter",
  });

  useEffect(() => {
    showModal = (data: SignInModalInfo) => {
      setInfo(data);
      setOpen(true);
      // Reset form state when modal opens
      setEmail("");
      setEmailSent(false);
      setError("");
      setIsLoadingGoogle(false);
      setIsLoadingEmail(false);
    };
  }, []);

  useEffect(() => {
    // Vérifier que nous sommes côté client avant d'importer AuthHelper
    if (typeof window !== "undefined" && hasFirebaseConfig()) {
      import("@/app/_services/AuthService").then(({ auth }) =>
        auth.onAuthStateChanged(async (user: User | null) => {
          if (user) {
            setConnectedUser(user);
            setOpen(false); // Close modal when user signs in
          }
        }),
      );
    }
  }, []);

  const handleGoogleSignIn = async () => {
    // Vérifier que nous sommes côté client
    if (typeof window === "undefined") {
      setError("Cette fonctionnalité n'est disponible que côté client.");
      return;
    }

    setIsLoadingGoogle(true);
    setError("");
    try {
      const { signInWithGoogle } = await import("@/app/_services/AuthService");
      await signInWithGoogle();
      // Modal will close automatically when auth state changes
    } catch (error) {
      setError("Erreur lors de la connexion avec Google. Veuillez réessayer.");
      console.error("Google sign in error:", error);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleEmailSignIn = async () => {
    // Vérifier que nous sommes côté client
    if (typeof window === "undefined") {
      setError("Cette fonctionnalité n'est disponible que côté client.");
      return;
    }

    if (!email.trim()) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }

    setIsLoadingEmail(true);
    setError("");
    try {
      const { sendSignInLink } = await import("@/app/_services/AuthService");
      await sendSignInLink(email);
      setEmailSent(true);
    } catch (error) {
      setError("Erreur lors de l'envoi du lien. Veuillez vérifier votre adresse email.");
      console.error("Email sign in error:", error);
    } finally {
      setIsLoadingEmail(false);
    }
  };

  return connectedUser ? (
    <></>
  ) : (
    <GenericModal showHeader={false} open={open} setOpen={setOpen} modalSize={ModalSize.SMALL} showFooter={false}>
      <div className="flex flex-col justify-center items-center h-full text-center space-y-6">
        <div className="p-5 sm:flex-1">
          <h2 className="text-lg font-semibold mb-2">{info.title}</h2>
          <p className="text-gray-600 text-sm">{info.comment}</p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 mt-3 px-3 py-2 rounded-md text-xs sm:text-sm">
              {error}
            </div>
          )}
        </div>

        {emailSent ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span className="font-medium">Email envoyé !</span>
              </div>
              <p className="text-sm mt-1">Vérifiez votre boîte email et cliquez sur le lien pour vous connecter.</p>
            </div>
            <button onClick={() => setEmailSent(false)} className="text-blue-600 hover:text-blue-800 text-sm underline">
              Utiliser une autre adresse email
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:w-4/5">
            {/* Google Sign In Button */}
            <GoogleSignInButton
              onClick={handleGoogleSignIn}
              disabled={isLoadingGoogle || isLoadingEmail}
              isLoading={isLoadingGoogle}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Email Sign In */}
            <div className="space-y-3 sm:w-3/4 mx-auto">
              <FormInput
                type="email"
                title="Votre adresse email"
                placeholder="jean.dupont@mail.fr"
                value={email}
                setValue={(v) => setEmail(v.toString())}
                id="signin-email"
                disabled={isLoadingGoogle || isLoadingEmail}
                className="w-full"
              />
              <OutlinedButton
                onClick={handleEmailSignIn}
                disabled={isLoadingGoogle || isLoadingEmail || !email.trim()}
                className="w-full items-center justify-center"
                hasIcon
              >
                {isLoadingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Mail className="w-4 h-4 shrink-0" />
                )}
                <span>Recevoir un lien de connexion</span>
              </OutlinedButton>
            </div>
          </div>
        )}
      </div>
    </GenericModal>
  );
}

let showModal: ((data: SignInModalInfo) => void) | null = null;

export function showSignInModal(
  title: string = "Se connecter",
  comment: string = "Vous devez être connecté pour voir les commentaires.",
  buttonText: string = "Se connecter",
): void {
  if (showModal) {
    showModal({
      title,
      comment,
      buttonText,
    });
  } else {
    console.error("showSignInModal is not initialized yet.");
  }
}
