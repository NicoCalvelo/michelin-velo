import {
  getAuth,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  Auth,
  User,
  UserCredential,
} from "firebase/auth";
import { app } from "../_providers/FirebaseProvider";
import UserRepository from "@/app/_repositories/user_repository";

export const auth: Auth = getAuth(app);
auth.languageCode = "fr";
const provider = new GoogleAuthProvider();

auth.onAuthStateChanged((user: User | null) => {
  if (user) {
    UserRepository.getUserById(user.uid).then((userData) => {
      if (userData) {
        // Met à jour la dernière connexion
        UserRepository.updateLastLogin(user.uid);
      }
    });
    // Cookie de session pour le middleware Next.js (protection des routes)
    if (typeof document !== "undefined") {
      document.cookie = `session=1; path=/; max-age=${60 * 60 * 24 * 14}; SameSite=Lax`;
    }
  } else {
    if (typeof window !== "undefined") localStorage.removeItem("user");
    // Suppression du cookie de session
    if (typeof document !== "undefined") {
      document.cookie = "session=; path=/; max-age=0; SameSite=Lax";
    }
  }
});

export function signInWithGoogle(): Promise<User> {
  return new Promise((resolve, reject) => {
    signInWithPopup(auth, provider)
      .then((result: UserCredential) => {
        const isFirstLogin = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
        if (isFirstLogin) {
          if (result.user.email !== null && result.user.email !== undefined)
            UserRepository.createUser(result.user.uid, {
              displayName: result.user.displayName,
              email: result.user.email,
              photoURL: result.user.photoURL,
              emailVerified: result.user.emailVerified,
            });
        }

        // The signed-in user info.
        resolve(result.user);
      })
      .catch((error: unknown) => {
        console.error("Google sign-in error:", error);
        reject(error);
      });
  });
}

export function sendSignInLink(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Vérifier que nous sommes côté client
    if (typeof window === "undefined") {
      reject(new Error("Cette fonction ne peut être appelée que côté client"));
      return;
    }

    const actionCodeSettings = {
      url: window.location.origin + "/auth/email-signin",
      handleCodeInApp: true,
    };
    sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem("emailForSignIn", email);
        resolve();
      })
      .catch((error: unknown) => {
        console.error("Send sign-in link error:", error);
        reject(error);
      });
  });
}

export function signInLink(email: string): Promise<User> {
  return new Promise((resolve, reject) => {
    // Vérifier que nous sommes côté client
    if (typeof window === "undefined") {
      reject(new Error("Cette fonction ne peut être appelée que côté client"));
      return;
    }

    if (isSignInWithEmailLink(auth, window.location.href)) {
      signInWithEmailLink(auth, email, window.location.href)
        .then((result: UserCredential) => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("emailForSignIn");
          }
          const isFirstLogin = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
          if (isFirstLogin) {
            if (result.user.email !== null && result.user.email !== undefined)
              UserRepository.createUser(result.user.uid, {
                displayName: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                emailVerified: result.user.emailVerified,
              });
          }
          resolve(result.user);
        })
        .catch((error: unknown) => {
          console.error("Email link sign-in error:", error);
          reject(error);
        });
    } else {
      reject(new Error("Invalid sign-in link"));
    }
  });
}

export function LogOut(): Promise<void> {
  return new Promise((resolve, reject) => {
    signOut(auth).then(resolve).catch(reject);
  });
}

export function isUserLoged(): boolean {
  return auth.currentUser !== null && auth.currentUser !== undefined;
}
