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
    throw err;
  }
  if (!snap.exists()) return null;
  const raw = snap.data()?.save;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Persists the (fx-stripped) game state. */
export async function writeSave(uid, state) {
  await setDoc(saveRef(uid), {
    userId: uid,
    save: JSON.stringify(state),
    updatedAt: new Date().toISOString(),
  });
}
