/* =========================================================
   Export / import

   A backup is the same payload the cloud save holds, wrapped in a
   small envelope so a file can be identified and version-checked
   before it is ever allowed near the hunter's live save.
   ========================================================= */

import { localISO } from "../game/constants";
import { migrateSave, SCHEMA_VERSION } from "./migration";

export const BACKUP_KIND = "arise-hunter-save";

/* ---------------- export ---------------- */

/** Wrap the (fx-stripped) game state in a backup envelope. */
export function buildBackup(state) {
  const { fx, ...save } = state ?? {};
  return {
    kind: BACKUP_KIND,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    save,
  };
}

export function toJSON(state) {
  return JSON.stringify(buildBackup(state), null, 2);
}

/** Escape one CSV field (quotes doubled, field quoted when it needs to be). */
function csvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvRows(rows) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

/**
 * Flat CSV of everything a spreadsheet can usefully hold: the live board,
 * cleared history and habit logs, tagged by a `record` column.
 */
export function toCSV(state) {
  const header = [
    "record",
    "id",
    "title",
    "category",
    "difficulty",
    "priority",
    "status",
    "xp",
    "dueDate",
    "dueTime",
    "endDate",
    "recurrence",
    "reminder",
    "completedAt",
    "createdAt",
  ];

  const missionRows = (state.missions ?? []).map((m) => [
    "mission",
    m.id,
    m.title,
    m.category,
    m.difficulty,
    m.priority,
    m.status,
    m.xp,
    m.dueDate,
    m.dueTime ?? "",
    m.endDate ?? "",
    m.recurrence ? `${m.recurrence.type}/${m.recurrence.interval}` : "",
    m.reminder ?? "",
    "",
    m.createdAt,
  ]);

  const historyRows = (state.history ?? []).map((h) => [
    "history",
    h.id,
    h.title,
    h.category,
    h.difficulty,
    "",
    "completed",
    h.xp,
    "",
    "",
    "",
    "",
    "",
    h.completedAt,
    "",
  ]);

  // One row per logged day keeps habits readable in a spreadsheet.
  const habitRows = (state.habits ?? []).flatMap((habit) =>
    Object.keys(habit.log ?? {})
      .filter((day) => habit.log[day])
      .sort()
      .map((day) => [
        "habit-log",
        habit.id,
        habit.title,
        habit.cadence,
        "",
        "",
        "logged",
        habit.xp,
        "",
        "",
        "",
        "",
        "",
        day,
        habit.createdAt,
      ])
  );

  return csvRows([header, ...missionRows, ...historyRows, ...habitRows]);
}

/** Trigger a browser download. No-ops outside the browser. */
export function download(filename, content, mime = "application/json") {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke on the next frame — Safari needs the URL to survive the click.
  requestAnimationFrame(() => URL.revokeObjectURL(url));
}

export function exportJSON(state) {
  download(`arise-backup-${localISO()}.json`, toJSON(state), "application/json");
}

export function exportCSV(state) {
  download(`arise-backup-${localISO()}.csv`, toCSV(state), "text/csv");
}

/* ---------------- import ---------------- */

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate a parsed backup before it is allowed anywhere near the live save.
 *
 * Rejects only what would corrupt the game (wrong file, malformed arrays,
 * a schema from the future). Individual bad rows are dropped with a warning
 * rather than failing the whole import — a backup with one broken mission is
 * still worth restoring.
 *
 * @returns {{ok: boolean, errors: string[], warnings: string[], save: object|null, stats: object}}
 */
export function validateBackup(parsed) {
  const errors = [];
  const warnings = [];

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, errors: ["That file isn't valid JSON."], warnings, save: null, stats: {} };
  }

  // Accept both the envelope and a bare save payload.
  const envelope = parsed.kind === BACKUP_KIND || parsed.save ? parsed : { save: parsed };
  const save = envelope.save;

  if (!save || typeof save !== "object") {
    errors.push("No save data found in this file.");
    return { ok: false, errors, warnings, save: null, stats: {} };
  }

  const version = Number(envelope.schemaVersion ?? save.version ?? 1);
  if (version > SCHEMA_VERSION) {
    errors.push(
      `This backup was written by a newer version of ARISE (schema v${version}). Update the app first.`
    );
    return { ok: false, errors, warnings, save: null, stats: {} };
  }

  for (const key of ["missions", "history", "habits"]) {
    if (save[key] != null && !Array.isArray(save[key])) {
      errors.push(`"${key}" should be a list but is ${typeof save[key]}.`);
    }
  }
  if (save.totalXP != null && !Number.isFinite(Number(save.totalXP))) {
    errors.push("Total XP is not a number.");
  }
  if (errors.length) return { ok: false, errors, warnings, save: null, stats: {} };

  const missions = (save.missions ?? []).filter((m, i) => {
    if (!m || typeof m !== "object" || !m.id || !m.title) {
      warnings.push(`Skipped mission #${i + 1}: missing an id or title.`);
      return false;
    }
    if (m.dueDate && !ISO_DAY.test(m.dueDate)) {
      warnings.push(`Skipped "${m.title}": due date "${m.dueDate}" isn't YYYY-MM-DD.`);
      return false;
    }
    return true;
  });

  const history = (save.history ?? []).filter((h, i) => {
    if (!h || typeof h !== "object" || !h.completedAt || !ISO_DAY.test(h.completedAt)) {
      warnings.push(`Skipped history entry #${i + 1}: bad completion date.`);
      return false;
    }
    return true;
  });

  const habits = (save.habits ?? []).filter((h, i) => {
    if (!h || typeof h !== "object" || !h.id || !h.title) {
      warnings.push(`Skipped habit #${i + 1}: missing an id or title.`);
      return false;
    }
    return true;
  });

  // Run it through the same migration path a cloud save takes, so an old
  // backup arrives fully upgraded.
  const migrated = migrateSave({ ...save, missions, history, habits });

  return {
    ok: true,
    errors,
    warnings,
    save: migrated,
    stats: {
      missions: migrated.missions.length,
      history: migrated.history.length,
      habits: migrated.habits.length,
      totalXP: migrated.totalXP ?? 0,
      exportedAt: envelope.exportedAt ?? null,
    },
  };
}

/** Parse + validate the text of a backup file. */
export function readBackup(text) {
  try {
    return validateBackup(JSON.parse(text));
  } catch {
    return {
      ok: false,
      errors: ["That file isn't valid JSON — pick a .json backup exported from ARISE."],
      warnings: [],
      save: null,
      stats: {},
    };
  }
}
