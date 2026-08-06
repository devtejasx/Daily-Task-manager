import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import WelcomeIntro from "./components/cinematic/WelcomeIntro.jsx";
import { AuthGateProvider } from "./components/auth/AuthGate.jsx";
import BootScreen from "./components/ui/BootScreen.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import PWAPrompt from "./components/ui/PWAPrompt.jsx";
import { useAuth } from "./hooks/useAuth";
import { loadSave } from "./services/saveService";
import "./index.css";

const INTRO_KEY = "arise-intro-seen";

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
      {/* Last line of defence: a render crash shows a themed panel with a
          reload action instead of a white screen. */}
      <ErrorBoundary>
        <Root />
        <PWAPrompt />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
