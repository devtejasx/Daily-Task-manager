import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

/**
 * Firebase initialization — single instance shared across the app.
 * The web config below is public by design (security comes from
 * Firebase Auth + Firestore security rules, not from hiding these keys).
 */
const firebaseConfig = {
  apiKey: "AIzaSyDErxetQViLB4NTnYvW6htcTBYvoif92jU",
  authDomain: "taskmanger-7f8b5.firebaseapp.com",
  projectId: "taskmanger-7f8b5",
  storageBucket: "taskmanger-7f8b5.firebasestorage.app",
  messagingSenderId: "407682990295",
  appId: "1:407682990295:web:34a7c08e96dd8ed5cbf092",
  measurementId: "G-RMTBEWNBF4",
};

// Guard against re-initialization during hot reloads
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Force long-polling: Firestore's default WebChannel transport is blocked by
// some proxies/firewalls/embedded browsers, which makes writes hang forever.
// Long-polling works everywhere; the perf difference is negligible at this scale.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const googleProvider = new GoogleAuthProvider();

/** Map Firebase error codes to friendly, user-facing messages. */
export function authErrorMessage(error) {
  const code = error?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password";
    case "auth/email-already-in-use":
      return "An account with this email already exists";
    case "auth/weak-password":
      return "Password should be at least 6 characters";
    case "auth/invalid-email":
      return "Please enter a valid email address";
    case "auth/too-many-requests":
      return "Too many attempts — please wait a moment and try again";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-in was cancelled";
    case "auth/popup-blocked":
      return "Popup was blocked — allow popups for this site and try again";
    case "auth/network-request-failed":
      return "Network error — check your connection";
    default:
      return "Something went wrong. Please try again.";
  }
}
