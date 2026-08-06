import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import WelcomeIntro from "./components/cinematic/WelcomeIntro.jsx";
import { AuthGateProvider } from "./components/auth/AuthGate.jsx";
import { useAuth } from "./hooks/useAuth";
import { loadSave } from "./services/saveService";
import "./index.css";

const INTRO_KEY = "arise-intro-seen";

/** Full-screen themed status panel used while auth/save are resolving. */
function BootScreen({ label, error, onRetry }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#05070f]">
      {!error && (
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400/60 border-t-transparent animate-spin" />
      )}
      <p className="text-xs tracking-[0.3em] text-slate-500 font-semibold">{label}</p>
      {error && (
        <button
          onClick={onRetry}
          className="text-xs font-bold tracking-wider text-cyan-300 border border-cyan-400/30 bg-cyan-400/10 rounded-xl px-4 py-2"
        >
          RETRY
        </button>
      )}
    </div>
  );
}

/** Loads the signed-in hunter's cloud save before mounting the game. */
function SaveGate({ user, onSignOut }) {
  const [save, setSave] = useState(undefined); // undefined = loading
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setSave(undefined);
    setError(false);
    loadSave(user.uid)
      .then((data) => {
        if (!cancelled) setSave(data); // null = new hunter, object = existing save
      })
      .catch((err) => {
        console.error("Failed to load cloud save:", err);
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user.uid, attempt]);

  if (error)
    return (
      <BootScreen label="CLOUD SYNC FAILED" error onRetry={() => setAttempt((n) => n + 1)} />
    );
  if (save === undefined) return <BootScreen label="SYNCING HUNTER DATA" />;
  return <App user={user} initialSave={save} onSignOut={onSignOut} />;
}

function Root() {
  const { user, loading, logout } = useAuth();
  // Intro plays once per browser session, on initial site entry — not on
  // subsequent in-app navigation or refreshes within the same session.
  const [introDone, setIntroDone] = useState(
    () => sessionStorage.getItem(INTRO_KEY) === "1"
  );

  const finishIntro = () => {
    sessionStorage.setItem(INTRO_KEY, "1");
    setIntroDone(true);
  };

  return (
    <AuthGateProvider user={user}>
      {!introDone && <WelcomeIntro onEnter={finishIntro} />}

      {loading ? (
        <BootScreen label="CONNECTING TO THE SYSTEM" />
      ) : user ? (
        // key by uid so switching accounts fully remounts the game state
        <SaveGate key={user.uid} user={user} onSignOut={logout} />
      ) : (
        // Guest mode: explore the empty UI; protected actions open the login modal
        <App user={null} initialSave={null} onSignOut={null} />
      )}
    </AuthGateProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Real URLs, real browser history — the Netlify SPA redirect already
        serves index.html for every path. */}
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>
);
