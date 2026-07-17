import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, authErrorMessage } from "../lib/firebase";

/**
 * Firebase Auth state + actions.
 * `user` is undefined while the initial auth check is in flight,
 * null when signed out, and a Firebase User when signed in.
 */
export function useAuth() {
  const [user, setUser] = useState(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return {
    user,
    loading: user === undefined,
    async login(email, password) {
      await signInWithEmailAndPassword(auth, email, password);
    },
    async register(name, email, password) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
    },
    async loginWithGoogle() {
      await signInWithPopup(auth, googleProvider);
    },
    async logout() {
      await signOut(auth);
    },
  };
}

export { authErrorMessage };
