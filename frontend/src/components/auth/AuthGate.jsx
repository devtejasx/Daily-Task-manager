import { createContext, useCallback, useContext, useRef, useState } from "react";
import LoginModal from "./LoginModal";

/**
 * AuthGate — a reusable guard for protected actions (UX only; real
 * enforcement lives in Firestore security rules).
 *
 *   const { requireAuth } = useAuthGate();
 *   <button onClick={() => requireAuth(() => createTask())}>+ Add Task</button>
 *
 * If the visitor is authenticated, the action runs immediately. If not, the
 * login modal opens and the action is withheld. On successful sign-in the app
 * re-mounts into authenticated mode (loading the user's own data), so the
 * withheld action is intentionally dropped rather than replayed against a
 * stale, guest-mode component tree.
 */
const AuthGateContext = createContext(null);

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error("useAuthGate must be used within <AuthGateProvider>");
  return ctx;
}

export function AuthGateProvider({ user, children }) {
  const [open, setOpen] = useState(false);
  const isAuthed = Boolean(user);
  const isAuthedRef = useRef(isAuthed);
  isAuthedRef.current = isAuthed;

  const requireAuth = useCallback((action) => {
    if (isAuthedRef.current) {
      action?.();
      return true;
    }
    setOpen(true);
    return false;
  }, []);

  const openLogin = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <AuthGateContext.Provider value={{ requireAuth, openLogin, isAuthed }}>
      {children}
      {/* onSuccess: auth state flips -> Root swaps guest app for the real one */}
      <LoginModal open={open} onClose={close} onSuccess={close} />
    </AuthGateContext.Provider>
  );
}
