import { useEffect, useRef } from "react";
import { dueDateTime, MINUTE_MS } from "../utils/date";
import { notify, playChime, requestPermissionOnce, getPermission } from "../services/notifications";

/** How often we sweep the board looking for reminders that came due. */
const SWEEP_MS = 20_000;
/** Don't fire a reminder that came due while the tab was closed for hours. */
const STALE_AFTER_MS = 30 * MINUTE_MS;

/**
 * Fires browser notifications for missions whose reminder moment has arrived.
 *
 * A polling sweep (rather than one setTimeout per mission) is deliberate: it
 * survives laptop sleep, timer throttling in background tabs and missions
 * being edited mid-flight, and it costs one cheap array scan every 20s.
 *
 * @param {object[]} missions
 * @param {object}   settings   the persisted settings block
 * @param {(id: string, patch: object) => void} onFired  marks the mission so it
 *        never notifies twice (persisted via reminderFiredAt)
 */
export function useReminders(missions, settings, onFired) {
  const firedRef = useRef(new Set());
  const onFiredRef = useRef(onFired);
  onFiredRef.current = onFired;

  const enabled = Boolean(settings?.notifications?.enabled && settings?.notifications?.reminders);

  // Ask once, the first time a hunter actually has a reminder to deliver.
  useEffect(() => {
    if (!enabled) return;
    if (getPermission() === "default") requestPermissionOnce();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    const sweep = () => {
      const now = Date.now();

      for (const mission of missions) {
        if (mission.status === "completed") continue;
        if (mission.reminder == null) continue;
        if (mission.reminderFiredAt) continue;
        if (firedRef.current.has(mission.id)) continue;

        const due = dueDateTime(mission);
        if (!due) continue;

        const fireAt = due.getTime() - mission.reminder * MINUTE_MS;
        if (now < fireAt) continue;
        // Long past its window: mark it handled rather than dumping a pile of
        // stale notifications on someone who just reopened the tab.
        const stale = now - fireAt > STALE_AFTER_MS;

        firedRef.current.add(mission.id);
        if (!stale) {
          notify("GATE CLOSING SOON", {
            body: `${mission.title} · due ${mission.dueTime || "today"}`,
            tag: `reminder-${mission.id}`,
          });
          if (settings?.sound) playChime("alert");
        }
        onFiredRef.current?.(mission.id, { reminderFiredAt: new Date().toISOString() });
      }
    };

    sweep();
    const id = window.setInterval(sweep, SWEEP_MS);
    return () => window.clearInterval(id);
  }, [enabled, missions, settings?.sound]);
}
