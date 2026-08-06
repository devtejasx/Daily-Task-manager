import { describe, it, expect } from "vitest";
import { buildBackup, toJSON, toCSV, validateBackup, readBackup, BACKUP_KIND } from "./backup";
import { SCHEMA_VERSION } from "./migration";
import { makeSave, makeMission, makeHabit, makeHistory } from "../test/factories";

/** A save with one of everything, for the round-trip tests. */
function fullSave() {
  return makeSave({
    totalXP: 4820,
    streak: 12,
    missions: [
      makeMission({ id: "m-1", title: "Morning Training" }),
      makeMission({ id: "m-2", title: 'Report, "Q4"', category: "Guild" }), // CSV-hostile
    ],
    history: [makeHistory(1, { id: "h-1" })],
    habits: [makeHabit({ id: "hb-1", log: { "2026-08-05": true, "2026-08-06": true } })],
  });
}

describe("buildBackup", () => {
  it("wraps the save in an identifiable, versioned envelope", () => {
    const backup = buildBackup(fullSave());
    expect(backup.kind).toBe(BACKUP_KIND);
    expect(backup.schemaVersion).toBe(SCHEMA_VERSION);
    expect(backup.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("strips the transient fx block", () => {
    const backup = buildBackup({ ...fullSave(), fx: { toasts: [{ id: 1 }], levelUp: 5 } });
    expect(backup.save.fx).toBeUndefined();
  });
});

describe("JSON round trip", () => {
  it("survives export -> import with the record intact", () => {
    const original = fullSave();
    const result = readBackup(toJSON(original));

    expect(result.ok).toBe(true);
    expect(result.save.totalXP).toBe(4820);
    expect(result.save.streak).toBe(12);
    expect(result.save.missions).toHaveLength(2);
    expect(result.save.habits[0].log).toEqual({ "2026-08-05": true, "2026-08-06": true });
    expect(result.warnings).toEqual([]);
  });
});

describe("CSV export", () => {
  it("tags every row with its record type", () => {
    const rows = toCSV(fullSave()).split("\n");
    expect(rows[0].startsWith("record,id,title")).toBe(true);
    expect(rows.some((r) => r.startsWith("mission,"))).toBe(true);
    expect(rows.some((r) => r.startsWith("history,"))).toBe(true);
    expect(rows.some((r) => r.startsWith("habit-log,"))).toBe(true);
  });

  it("emits one row per logged habit day", () => {
    const habitRows = toCSV(fullSave())
      .split("\n")
      .filter((r) => r.startsWith("habit-log,"));
    expect(habitRows).toHaveLength(2);
  });

  it("quotes and escapes fields that would break the format", () => {
    const csv = toCSV(fullSave());
    // A title containing a comma AND quotes must be quoted with "" doubling.
    expect(csv).toContain('"Report, ""Q4"""');
  });

  it("renders a recurrence rule compactly", () => {
    const save = makeSave({
      missions: [makeMission({ recurrence: { type: "weekly", interval: 2, paused: false, skipped: 0, completed: 0 } })],
    });
    expect(toCSV(save)).toContain("weekly/2");
  });
});

describe("validateBackup — rejections", () => {
  it("rejects a non-object", () => {
    expect(validateBackup(null).ok).toBe(false);
    expect(validateBackup("nope").ok).toBe(false);
  });

  it("rejects a file with no save data", () => {
    const result = validateBackup({ kind: BACKUP_KIND, save: null });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/no save data/i);
  });

  it("refuses a backup from a NEWER schema rather than mangling it", () => {
    const result = validateBackup({
      kind: BACKUP_KIND,
      schemaVersion: SCHEMA_VERSION + 5,
      save: makeSave(),
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/newer version/i);
  });

  it("rejects a save whose arrays are the wrong type", () => {
    const result = validateBackup({ save: { ...makeSave(), missions: { not: "a list" } } });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/should be a list/i);
  });

  it("rejects a non-numeric XP total", () => {
    const result = validateBackup({ save: { ...makeSave(), totalXP: "loads" } });
    expect(result.ok).toBe(false);
  });

  it("reports invalid JSON in plain language", () => {
    const result = readBackup("{ definitely not json");
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/isn't valid JSON/i);
  });
});

describe("validateBackup — partial recovery", () => {
  it("drops individual bad rows with a warning instead of failing the import", () => {
    const result = validateBackup({
      save: {
        ...makeSave(),
        missions: [
          makeMission({ id: "good", title: "Keep me" }),
          { id: "no-title" },
          { title: "no id" },
          makeMission({ id: "bad-date", title: "Broken", dueDate: "06/08/2026" }),
        ],
      },
    });

    expect(result.ok).toBe(true);
    expect(result.save.missions).toHaveLength(1);
    expect(result.save.missions[0].id).toBe("good");
    expect(result.warnings).toHaveLength(3);
  });

  it("drops history entries with an unusable completion date", () => {
    const result = validateBackup({
      save: { ...makeSave(), history: [makeHistory(0), { title: "no date" }] },
    });
    expect(result.save.history).toHaveLength(1);
    expect(result.warnings[0]).toMatch(/bad completion date/i);
  });

  it("drops habits missing an id or title", () => {
    const result = validateBackup({
      save: { ...makeSave(), habits: [makeHabit({ id: "keep" }), { icon: "Flame" }] },
    });
    expect(result.save.habits).toHaveLength(1);
    expect(result.warnings[0]).toMatch(/skipped habit/i);
  });
});

describe("validateBackup — acceptance", () => {
  it("accepts a bare save payload without the envelope", () => {
    const result = validateBackup(fullSave());
    expect(result.ok).toBe(true);
    expect(result.stats.missions).toBe(2);
  });

  it("migrates an old backup on the way in", () => {
    const result = validateBackup({
      save: {
        missions: [{ id: "m-1", title: "Legacy mission", dueDate: "2026-08-01" }],
        totalXP: 900,
      },
    });

    expect(result.ok).toBe(true);
    expect(result.save.version).toBe(SCHEMA_VERSION);
    expect(result.save.missions[0].recurrence).toBeNull();
    expect(result.save.settings).toBeTruthy();
  });

  it("summarises what will be restored", () => {
    const result = validateBackup(buildBackup(fullSave()));
    expect(result.stats).toMatchObject({ missions: 2, history: 1, habits: 1, totalXP: 4820 });
    expect(result.stats.exportedAt).toBeTruthy();
  });
});
