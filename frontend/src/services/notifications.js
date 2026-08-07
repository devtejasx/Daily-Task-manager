/* =========================================================
   Browser notifications

   Permission is requested EXACTLY ONCE per browser. We record the
   attempt in localStorage so a hunter who dismissed the prompt is
   never nagged again on later visits — they can still opt in
   deliberately from the settings page, which is the only path that
   bypasses the once-only guard.
   ========================================================= */

const ASKED_KEY = "arise-notification-asked";

/** Notifications API available in this browser? */
export function isSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

/** "granted" | "denied" | "default" | "unsupported" */
export function getPermission() {
  if (!isSupported()) return "unsupported";
  return Notification.permission;
}

/** Have we already shown this browser the permission prompt? */
export function hasBeenAsked() {
  try {
    return localStorage.getItem(ASKED_KEY) === "1";
  } catch {
    return false;
  }
}

function markAsked() {
  try {
    localStorage.setItem(ASKED_KEY, "1");
  } catch {
    /* private mode — worst case we ask again next session */
  }
}

/**
 * Ask for permission at most once.
 * @param {boolean} force  bypass the once-only guard (settings toggle)
 * @returns {Promise<string>} the resulting permission state
 */
export async function requestPermissionOnce(force = false) {
  if (!isSupported()) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  if (hasBeenAsked() && !force) return "default";

  markAsked();
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/**
 * Fire a notification. Silently no-ops when unsupported or not granted,
 * so callers never need to guard.
 *
 * @param {string} title
 * @param {{body?: string, tag?: string, silent?: boolean, onClick?: () => void}} options
 * @returns {Notification|null}
 */
export function notify(title, { body, tag, silent = false, onClick } = {}) {
  if (!isSupported() || Notification.permission !== "granted") return null;
  try {
    const n = new Notification(title, {
      body,
      tag, // same tag replaces rather than stacks
      silent,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    });
    if (onClick) {
      n.onclick = () => {
        window.focus();
        onClick();
        n.close();
      };
    }
    return n;
  } catch {
    return null;
  }
}

/* ---------------- audio cue ---------------- */

let audioCtx = null;

/**
 * Short synthesised chime — no asset to ship, no autoplay policy issues
 * once the user has interacted with the page.
 * @param {"success"|"alert"} kind
 */
export function playChime(kind = "success") {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;

  try {
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();

    // A rising pair for success, a falling pair for alerts.
    const notes = kind === "alert" ? [880, 587.33] : [587.33, 880];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      const start = audioCtx.currentTime + i * 0.16;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);

      osc.connect(gain).connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  } catch {
    /* audio is a nicety — never let it break a flow */
  }
}
