import { useState } from "react";
import { motion } from "framer-motion";
import { Swords, Mail, Lock, User, LogIn, Loader2 } from "lucide-react";
import { useAuth, authErrorMessage } from "../hooks/useAuth";

/**
 * Auth gate — Solo-Leveling-styled login / register screen shown
 * whenever no hunter is signed in. Email/password + Google sign-in,
 * backed by Firebase Auth.
 */
export default function Login() {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name.trim(), email, password);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#05070f]">
      {/* ambient glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(124,58,237,0.22), transparent 70%)," +
            "radial-gradient(45% 40% at 85% 90%, rgba(6,182,212,0.14), transparent 70%)," +
            "radial-gradient(40% 40% at 10% 85%, rgba(124,58,237,0.12), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass neon-border relative w-full max-w-md rounded-3xl p-8 sm:p-10"
      >
        {/* emblem */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-[0_0_36px_rgba(124,58,237,0.55)] mb-4">
            <Swords size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-glow-arcane text-white">
            HUNTER COMMAND CENTER
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            {mode === "login"
              ? "Identify yourself, Hunter."
              : "Register with the Hunter Association."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <Field icon={User}>
              <input
                className="holo-input"
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
              className="holo-input"
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
              className="holo-input"
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

        {/* divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-slate-700/60" />
          <span className="text-xs text-slate-500 tracking-widest">OR</span>
          <div className="h-px flex-1 bg-slate-700/60" />
        </div>

        <button
          onClick={google}
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
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, children }) {
  return (
    <div className="relative [&>input]:w-full [&>input]:rounded-xl [&>input]:bg-white/5 [&>input]:border [&>input]:border-white/10 [&>input]:py-3 [&>input]:pl-11 [&>input]:pr-4 [&>input]:text-slate-100 [&>input]:placeholder-slate-500 [&>input]:outline-none [&>input:focus]:border-cyan-400/50">
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
