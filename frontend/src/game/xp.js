/* =========================================================
   XP integrity

   The XP curve itself (game/constants) is untouched: levels cost
   what they always cost, and nothing a hunter has already earned is
   recalculated. What lives here is the guard around the *inflow*.

   The failure mode this exists to prevent is the one every gamified
   task app eventually hits: splitting one real task into thirty fake
   ones because thirty clears pay more than one. That trains the exact
   opposite of the habit the product is for. So XP earned in a single
   day is credited in full up to a generous cap and at a reducing rate
   beyond it — a hunter clearing a genuinely heavy day still gains,
   but manufacturing missions stops paying.

   The cap is deliberately far above an honest day's work. A hunter
   who never games the system will never meet it.
   ========================================================= */

/** Raw XP that a single day credits in full. Roughly five heavy missions. */
export const DAILY_XP_SOFT_CAP = 2500;

/**
 * Credit rate for the band `raw` falls in, where `raw` is XP already
 * attempted today. Full value, then half, then a quarter, then a floor —
 * the floor matters, because reaching zero would read as a punishment.
 */
const BANDS = [
  { upTo: DAILY_XP_SOFT_CAP, rate: 1 },
  { upTo: DAILY_XP_SOFT_CAP * 2, rate: 0.5 },
  { upTo: DAILY_XP_SOFT_CAP * 3, rate: 0.25 },
  { upTo: Infinity, rate: 0.1 },
];

function bandAt(position) {
  return BANDS.find((b) => position < b.upTo) ?? BANDS[BANDS.length - 1];
}

/**
 * Credit an XP award against what today has already paid out.
 *
 * The award is integrated across the bands rather than assigned a single
 * rate, so a mission that straddles the cap is paid in full up to it and
 * at the reduced rate only for the part beyond.
 *
 * @param {number} raw       XP the award is nominally worth
 * @param {number} earnedToday  raw XP already attempted today (not credited)
 * @returns {{credited:number, raw:number, damped:boolean}}
 */
export function creditXP(raw, earnedToday = 0) {
  const amount = Math.max(0, Math.round(Number(raw) || 0));
  let position = Math.max(0, Number(earnedToday) || 0);
  let remaining = amount;
  let credited = 0;

  while (remaining > 0) {
    const band = bandAt(position);
    const chunk = Math.min(remaining, band.upTo - position);
    credited += chunk * band.rate;
    position += chunk;
    remaining -= chunk;
  }

  const rounded = Math.round(credited);
  return { credited: rounded, raw: amount, damped: rounded < amount };
}

/**
 * The credit a *withdrawal* should reverse.
 *
 * Un-ticking a habit has always refunded its XP immediately, so a mis-click
 * can never inflate a level. With damping in play the refund has to match
 * what was actually paid, not the nominal value — otherwise un-ticking and
 * re-ticking past the cap would mint XP. Reversing from `earnedToday - raw`
 * reproduces exactly the credit the award received.
 */
export function refundXP(raw, earnedToday = 0) {
  const amount = Math.max(0, Math.round(Number(raw) || 0));
  const before = Math.max(0, (Number(earnedToday) || 0) - amount);
  return creditXP(amount, before).credited;
}

/**
 * How much of today's full-rate allowance is left, for the UI.
 * Never phrased as a limit the hunter is approaching — it is only ever
 * surfaced once damping has actually happened.
 */
export function fullRateRemaining(earnedToday = 0) {
  return Math.max(0, DAILY_XP_SOFT_CAP - Math.max(0, Number(earnedToday) || 0));
}

/* ---------- daily quest reward ----------
 * Clearing the daily quest used to move the streak and pay nothing, which
 * made the single most important action in the game the only one with no
 * reward attached to it. It pays now: a flat bonus for showing up, plus a
 * consistency bonus that grows with the streak and then stops. The cap is
 * the point — a hundred-day hunter should feel richer than a two-day one,
 * but never so much richer that missing a day feels financially ruinous. */

/** Flat reward for clearing today's quest. */
export const DAILY_CLEAR_XP = 200;
/** Extra XP per streak day held, before the cap. */
export const STREAK_BONUS_PER_DAY = 5;
/** Ceiling on the streak component. Reached at 40 days. */
export const STREAK_BONUS_MAX = 200;

/** Total XP for clearing the daily quest at `streak` days. */
export function dailyQuestXP(streak = 0) {
  const days = Math.max(0, Number(streak) || 0);
  return DAILY_CLEAR_XP + Math.min(STREAK_BONUS_MAX, days * STREAK_BONUS_PER_DAY);
}
