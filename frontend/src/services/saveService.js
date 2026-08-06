import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Cloud save — the whole game state lives in ONE Firestore document per
 * user: tasks/{uid}. The payload is stored as a JSON string so we never
 * hit Firestore's nested-data restrictions, and the doc carries a
 * `userId` field so the existing security rules ("you can only touch
 * docs whose userId is your uid") apply unchanged.
 */

function saveRef(uid) {
  return doc(db, "tasks", uid);
}

/* ---------------- local mirror ----------------
 * Firestore's IndexedDB cache already serves reads offline, but it can be
 * evicted (storage pressure, "clear site data", a browser that refuses
 * persistence). A plain localStorage mirror is a cheap second line: if the
 * cloud read fails outright, the hunter still opens the app to their own
 * data instead of an empty board. */
const mirrorKey = (uid) => `arise-save-mirror:${uid}`;

function writeMirror(uid, state) {
  try {
    localStorage.setItem(mirrorKey(uid), JSON.stringify(state));
  } catch {
    /* quota or private mode — the mirror is optional by design */
  }
}

function readMirror(uid) {
  try {
    const raw = localStorage.getItem(mirrorKey(uid));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Returns the parsed save payload, or null if this user has no save yet. */
export async function loadSave(uid) {
  let snap;
  try {
    snap = await getDoc(saveRef(uid));
  } catch (err) {
    // The security rules check `resource.data.userId`, which cannot be
    // evaluated on a document that doesn't exist yet — Firestore reports
    // that as permission-denied. The doc ID is our own uid, so this can
    // only mean "no save yet": treat it as a brand-new hunter.
    if (err?.code === "permission-denied") return null;
    // Cloud unreachable AND the Firestore cache came up empty — fall back to
    // the local mirror rather than dropping the hunter into an empty board.
    const mirrored = readMirror(uid);
    if (mirrored) {
      console.warn("Cloud read failed; restored from the local mirror.", err);
      return mirrored;
    }
    throw err;
  }
  if (!snap.exists()) return readMirror(uid);

  const raw = snap.data()?.save;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    writeMirror(uid, parsed);
    return parsed;
  } catch {
    return readMirror(uid);
  }
}

/**
 * Persists the (fx-stripped) game state.
 *
 * The local mirror is written FIRST and synchronously, so it is up to date
 * even if the tab is closed before Firestore acknowledges. Offline, the
 * Firestore write is queued by IndexedDB persistence and replays on
 * reconnect — this promise simply stays pending until then.
 */
export async function writeSave(uid, state) {
  writeMirror(uid, state);
  await setDoc(saveRef(uid), {
    userId: uid,
    save: JSON.stringify(state),
    updatedAt: new Date().toISOString(),
  });
}

/** Drop the local mirror, e.g. on sign-out from a shared machine. */
export function clearMirror(uid) {
  try {
    localStorage.removeItem(mirrorKey(uid));
  } catch {
    /* nothing to do */
  }
}
