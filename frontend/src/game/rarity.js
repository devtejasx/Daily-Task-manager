/* =========================================================
   Rarity

   Rarity exists to say "this one mattered". That only works if most
   things are not rare — a wall where every card glows is a wall where
   nothing does, which is the same rule PROJECT_VISION.md states about
   celebration.

   So `glow` is deliberately false for the bottom two tiers. Common and
   Rare records are earned, dated and permanent; they simply do not
   shout. Epic and Legendary do.
   ========================================================= */

export const RARITY = {
  common: {
    key: "common",
    label: "Common",
    color: "#94a3b8",
    order: 0,
    glow: false,
    blurb: "Earned by everyone who keeps going.",
  },
  rare: {
    key: "rare",
    label: "Rare",
    color: "#38bdf8",
    order: 1,
    glow: false,
    blurb: "Most hunters stop before this one.",
  },
  epic: {
    key: "epic",
    label: "Epic",
    color: "#a78bfa",
    order: 2,
    glow: true,
    blurb: "Months of consistency, not a good week.",
  },
  legendary: {
    key: "legendary",
    label: "Legendary",
    color: "#f59e0b",
    order: 3,
    glow: true,
    blurb: "The record of a hunter who did not stop.",
  },
};

/** Rarity record for a key, defaulting to Common for anything unlabelled. */
export function rarityOf(key) {
  return RARITY[key] ?? RARITY.common;
}

/** Rarest first — the order a hall of records is worth reading in. */
export const RARITY_ORDER = Object.values(RARITY).sort((a, b) => b.order - a.order);

/** Sort comparator: rarest first, then alphabetical for a stable order. */
export function byRarity(a, b) {
  const delta = rarityOf(b.rarity).order - rarityOf(a.rarity).order;
  return delta !== 0 ? delta : String(a.title ?? a.name).localeCompare(String(b.title ?? b.name));
}
