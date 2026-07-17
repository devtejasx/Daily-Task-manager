import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, LogIn, Loader2 } from "lucide-react";
import { useAuth, authErrorMessage } from "../../hooks/useAuth";

/**
 * Shared email/password + Google auth form (login & register toggle).
 * Used by both the full-screen gate and the LoginModal. Calls `onSuccess`
 * once Firebase confirms the sign-in/registration.
 */
export default function AuthForm({ onSuccess, heading }) {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn) {
    setError("");
    setBusy(true);
    try {
      await fn();
      onSuccess?.();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const submit = (e) => {
    e.preventDefault();
    run(() =>
      mode === "login" ? login(email, password) : register(name.trim(), email, password)
    );
  };

  return (
    <div>
      <div className="flex flex-col items-center mb-6 text-center">
        <p className="text-sm text-slate-400">
          {heading ??
            (mode === "login"
              ? "Identify yourself, Hunter."
              : "Register with the Hunter Association.")}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "register" && (
          <Field icon={User}>
            <input
              className="w-full rounded-xl bg-white/5 border border-white/10 py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400/50"
              type="text"
              placeholder="Hunter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </Field>
        )}
        <Field icon={Mail}>
          <input
            className="w-full rounded-xl bg-white/5 border border-white/10 py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400/50"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </Field>
        <Field icon={Lock}>
          <input
            className="w-full rounded-xl bg-white/5 border border-white/10 py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400/50"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
          />
        </Field>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-rose-400 text-center"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={busy}
          whileHover={{ scale: busy ? 1 : 1.02 }}
          whileTap={{ scale: busy ? 1 : 0.97 }}
          className="w-full py-3 rounded-xl font-semibold tracking-wider text-white
            bg-gradient-to-r from-violet-600 to-cyan-500
            shadow-[0_0_24px_rgba(124,58,237,0.5)] hover:shadow-[0_0_36px_rgba(6,182,212,0.6)]
            transition-shadow disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          {mode === "login" ? "ENTER THE GATE" : "AWAKEN"}
        </motion.button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-slate-700/60" />
        <span className="text-xs text-slate-500 tracking-widest">OR</span>
        <div className="h-px flex-1 bg-slate-700/60" />
      </div>

      <button
        onClick={() => run(loginWithGoogle)}
        disabled={busy}
        className="w-full py-3 rounded-xl font-medium text-slate-200 bg-white/5 border border-white/10
          hover:bg-white/10 hover:border-cyan-400/40 transition-colors disabled:opacity-60
          flex items-center justify-center gap-3"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="text-sm text-slate-400 text-center mt-6">
        {mode === "login" ? "No hunter license yet?" : "Already awakened?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="text-cyan-400 hover:text-cyan-300 font-medium"
        >
          {mode === "login" ? "Register" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

function Field({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.1 3.56-5.18 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.38-2.29v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4-3.1z" />
      <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.58 1.8l3.44-3.44C17.95 1.2 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4 3.1C6.23 6.87 8.88 4.76 12 4.76z" />
    </svg>
  );
}
