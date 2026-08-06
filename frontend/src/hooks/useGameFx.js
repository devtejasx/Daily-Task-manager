import { useEffect, useRef, useState } from "react";

/** How long the floating "+N XP" burst stays on screen. */
const XP_BURST_MS = 1600;
/** Grace period after mount before FX are allowed to fire. */
const SETTLE_MS = 400;

/**
 * Turns state *changes* into one-shot visual cues.
 *
 * The background scene and the XP burst react to transitions, not to
 * values — so this watches the previous value of each and emits a pulse
 * counter when it moves. Everything is held back for a beat after mount,
 * otherwise simply loading a save would fire a level-up cinematic and an
 * XP burst for progress the hunter made days ago.
 *
 * @param {object} state  the game state
 * @returns {{xpBurst: object|null, xpPulse: number, missionPulse: number,
 *            levelPulse: number, promotionPulse: number}}
 */
export function useGameFx(state) {
  const [settled, setSettled] = useState(false);
  const [xpBurst, setXpBurst] = useState(null);
  const [xpPulse, setXpPulse] = useState(0);
  const [missionPulse, setMissionPulse] = useState(0);
  const [levelPulse, setLevelPulse] = useState(0);
  const [promotionPulse, setPromotionPulse] = useState(0);

  const previousXP = useRef(state.totalXP);
  const previousHistoryId = useRef(state.history[0]?.id ?? null);
  const previousLevelUp = useRef(state.fx.levelUp);
  const previousPromotion = useRef(state.fx.promotion);

  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(true), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  /* XP gained -> floating burst + a pulse through the background */
  useEffect(() => {
    if (!settled) {
      previousXP.current = state.totalXP;
      return;
    }
    const before = previousXP.current;
    if (state.totalXP > before) {
      setXpBurst({
        id: `${before}-${state.totalXP}-${Date.now()}`,
        amount: state.totalXP - before,
      });
      setXpPulse((value) => value + 1);
    }
    previousXP.current = state.totalXP;
  }, [settled, state.totalXP]);

  useEffect(() => {
    if (!xpBurst) return undefined;
    const timer = window.setTimeout(() => setXpBurst(null), XP_BURST_MS);
    return () => window.clearTimeout(timer);
  }, [xpBurst]);

  /* a new history entry means a mission was just cleared */
  useEffect(() => {
    const latest = state.history[0]?.id ?? null;
    if (!settled) {
      previousHistoryId.current = latest;
      return;
    }
    if (latest && latest !== previousHistoryId.current) {
      setMissionPulse((value) => value + 1);
    }
    previousHistoryId.current = latest;
  }, [settled, state.history]);

  useEffect(() => {
    if (!settled) {
      previousLevelUp.current = state.fx.levelUp;
      return;
    }
    if (state.fx.levelUp && state.fx.levelUp !== previousLevelUp.current) {
      setLevelPulse((value) => value + 1);
    }
    previousLevelUp.current = state.fx.levelUp || null;
  }, [settled, state.fx.levelUp]);

  useEffect(() => {
    if (!settled) {
      previousPromotion.current = state.fx.promotion;
      return;
    }
    if (state.fx.promotion && state.fx.promotion !== previousPromotion.current) {
      setPromotionPulse((value) => value + 1);
    }
    previousPromotion.current = state.fx.promotion || null;
  }, [settled, state.fx.promotion]);

  return { xpBurst, xpPulse, missionPulse, levelPulse, promotionPulse };
}
