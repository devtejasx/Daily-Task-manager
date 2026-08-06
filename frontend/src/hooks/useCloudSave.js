import { useCallback, useEffect, useRef, useState } from "react";
import { writeSave } from "../services/saveService";

/** Exponential backoff between automatic retries, capped. */
const BACKOFF_MS = [1_500, 4_000, 10_000];

/**
 * Persists the game state to Firestore with retry, offline awareness and a
 * user-facing failure toast that carries a "Retry" action.
 *
 * The last state handed to `persist` is always the one written, so a retry
 * fired minutes later still saves the newest data rather than a stale copy.
 *
 * @param {string|null} uid          null for guests (nothing is written)
 * @param {(toast: object) => void} pushToast
 * @returns {{persist: (state: object) => void, status: string, retry: () => void}}
 */
export function useCloudSave(uid, pushToast) {
  const [status, setStatus] = useState("idle"); // idle | saving | error | offline
  const latestRef = useRef(null);
  const attemptRef = useRef(0);
  const timerRef = useRef(null);
  const pushRef = useRef(pushToast);
  pushRef.current = pushToast;

  const flush = useCallback(
    async (manual = false) => {
      if (!uid || latestRef.current == null) return;

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setStatus("offline");
        return;
      }

      setStatus("saving");
      try {
        await writeSave(uid, latestRef.current);
        attemptRef.current = 0;
        setStatus("idle");
      } catch (err) {
        console.error("Cloud save failed:", err);
        setStatus("error");

        const attempt = attemptRef.current;
        attemptRef.current = attempt + 1;

        if (attempt < BACKOFF_MS.length) {
          // Quiet automatic retry first — most failures are a blip.
          window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => flush(), BACKOFF_MS[attempt]);
        } else {
          // Out of quiet retries: tell the hunter, and hand them the action.
          pushRef.current?.({
            kind: "error",
            key: "cloud-save",
            title: "CLOUD SYNC FAILED",
            desc: "Your progress is safe in this tab but hasn't reached the cloud.",
            color: "#ef4444",
            icon: "ShieldCheck",
            action: {
              label: "RETRY",
              run: () => {
                attemptRef.current = 0;
                flush(true);
              },
            },
          });
        }
        if (manual) throw err;
      }
    },
    [uid]
  );

  const persist = useCallback(
    (state) => {
      latestRef.current = state;
      flush();
    },
    [flush]
  );

  /* retry as soon as the connection comes back */
  useEffect(() => {
    const onOnline = () => {
      attemptRef.current = 0;
      flush();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", () => setStatus("offline"));
    return () => {
      window.removeEventListener("online", onOnline);
      window.clearTimeout(timerRef.current);
    };
  }, [flush]);

  const retry = useCallback(() => {
    attemptRef.current = 0;
    flush(true).catch(() => {});
  }, [flush]);

  return { persist, status, retry };
}
