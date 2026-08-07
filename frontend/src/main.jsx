import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import WelcomeIntro from "./components/cinematic/WelcomeIntro.jsx";
import Landing from "./pages/Landing.jsx";
import Awakening from "./components/cinematic/Awakening.jsx";
import { AuthGateProvider } from "./components/auth/AuthGate.jsx";
import BootScreen from "./components/ui/BootScreen.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import PWAPrompt from "./components/ui/PWAPrompt.jsx";
import { useAuth } from "./hooks/useAuth";
import { loadSave } from "./services/saveService";
import { buildDemoSave } from "./data/demoSave";
import "./index.css";

const INTRO_KEY = "arise-intro-seen";
const DEMO_KEY = "arise-demo";
/** Per-hunter, in localStorage: the awakening is a rite, not a loading screen. */
const awakenedKey = (uid) => `arise-awakened-${uid}`;

/** Loads the signed-in hunter's cloud save before mounting the game. */
function SaveGate({ user, onSignOut }) {
  const [save, setSave] = useState(undefined); // undefined = loading
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setSave(undefined);
    setError(null);
    loadSave(user.uid)
      .then((data) => {
        if (!cancelled) setSave(data); // null = new hunter, object = existing save
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [user.uid, attempt]);

  // A brand-new hunter (no cloud save) is welcomed by the awakening cinematic
  // before the dashboard — once, ever. Existing hunters never see it.
  const [awakened, setAwakened] = useState(
    () => localStorage.getItem(awakenedKey(user.uid)) === "1"
  );

  const finishAwakening = () => {
    localStorage.setItem(awakenedKey(user.uid), "1");
    setAwakened(true);
  };

  if (error)
    return (
      <BootScreen
        label="CLOUD SYNC FAILED"
        detail={
          navigator.onLine === false
            ? "You appear to be offline. Reconnect and try again — nothing has been lost."
            : "The system couldn't reach your hunter record. Your data is safe in the cloud."
        }
        error
        onRetry={() => setAttempt((n) => n + 1)}
      />
    );
  if (save === undefined) return <BootScreen label="PREPARING YOUR NEXT QUEST" />;

  if (save === null && !awakened)
    return <Awakening onDone={finishAwakening} />;

  return <App user={user} initialSave={save} onSignOut={onSignOut} />;
}

function Root() {
  const { user, loading, logout } = useAuth();
  // Intro plays once per browser session, on initial site entry — not on
  // subsequent in-app navigation or refreshes within the same session.
  const [introDone, setIntroDone] = useState(
    () => sessionStorage.getItem(INTRO_KEY) === "1"
  );

  // Demo mode survives in-app navigation (it is a mode, not a route) but not
  // a new session — a visitor should never come back tomorrow into someone
  // else's save.
  const [demo, setDemo] = useState(() => sessionStorage.getItem(DEMO_KEY) === "1");

  // Built once per entry so every date in the showcase is relative to today.
  const demoSave = useMemo(() => (demo ? buildDemoSave() : null), [demo]);

  const finishIntro = () => {
    sessionStorage.setItem(INTRO_KEY, "1");
    setIntroDone(true);
  };

  const enterDemo = () => {
    sessionStorage.setItem(DEMO_KEY, "1");
    setDemo(true);
  };

  const exitDemo = () => {
    sessionStorage.removeItem(DEMO_KEY);
    setDemo(false);
  };

  // Signing in always wins over the demo: the hunter's own record is the
  // point, and leaving the ribbon up over real data would be a lie.
  useEffect(() => {
    if (user && demo) exitDemo();
  }, [user, demo]);

  if (loading) return <BootScreen label="CONNECTING TO THE SYSTEM" />;

  return (
    <AuthGateProvider user={user}>
      {!introDone && <WelcomeIntro onEnter={finishIntro} />}

      {user ? (
        // key by uid so switching accounts fully remounts the game state
        <SaveGate key={user.uid} user={user} onSignOut={logout} />
      ) : demo ? (
        <App
          key="demo"
          user={null}
          initialSave={demoSave}
          onSignOut={null}
          demo
          onExitDemo={exitDemo}
        />
      ) : (
        <Landing onEnterDemo={enterDemo} />
      )}
    </AuthGateProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Real URLs, real browser history — the Netlify SPA redirect already
        serves index.html for every path. */}
    <BrowserRouter>
      {/* Last line of defence: a render crash shows a themed panel with a
          reload action instead of a white screen. */}
      <ErrorBoundary>
        <Root />
        <PWAPrompt />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
