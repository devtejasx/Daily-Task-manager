import { createContext, useCallback, useContext, useRef, useState } from "react";
import LoginModal from "./LoginModal";

/**
 * AuthGate — a reusable guard for protected actions (UX only; real
 * enforcement lives in Firestore security rules).
 *
 *   const { requireAuth } = useAuthGate();
 *   <button onClick={() => requireAuth(() => createTask(), "create-mission")}>+ Add Task</button>
 *
 * If the visitor is authenticated, the action runs immediately. If not, the
 * login modal opens and the action is withheld. On successful sign-in the app
 * re-mounts into authenticated mode (loading the user's own data), so the
 * closure can't be replayed directly — instead the caller passes a serialisable
 * `intent` string that survives the remount (the provider sits above it). The
 * newly-mounted authed app reads `pendingIntent` and resumes the action, so a
 * guest who clicked "New Mission" lands back on the open form.
 */
const AuthGateContext = createContext(null);

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error("useAuthGate must be used within <AuthGateProvider>");
  return ctx;
}

export function AuthGateProvider({ user, children }) {
  const [open, setOpen] = useState(false);
  const [pendingIntent, setPendingIntent] = useState(null);
  const isAuthed = Boolean(user);
  const isAuthedRef = useRef(isAuthed);
  isAuthedRef.current = isAuthed;

  const requireAuth = useCallback((action, intent = null) => {
    if (isAuthedRef.current) {
      action?.();
      return true;
    }
    if (intent) setPendingIntent(intent);
    setOpen(true);
    return false;
  }, []);

  const openLogin = useCallback(() => setOpen(true), []);
  const consumeIntent = useCallback(() => setPendingIntent(null), []);
  // success: keep the intent so the authed app can resume it; just close the modal
  const onSuccess = useCallback(() => setOpen(false), []);
  // cancel: drop any pending intent so it doesn't fire on a later login
  const onCancel = useCallback(() => {
    setPendingIntent(null);
    setOpen(false);
  }, []);

  return (
    <AuthGateContext.Provider value={{ requireAuth, openLogin, isAuthed, pendingIntent, consumeIntent }}>
      {children}
      <LoginModal open={open} onClose={onCancel} onSuccess={onSuccess} />
    </AuthGateContext.Provider>
  );
}
