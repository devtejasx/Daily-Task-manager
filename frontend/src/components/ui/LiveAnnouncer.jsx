import { useEffect, useRef, useState } from "react";

/**
 * Screen-reader announcer for things that are otherwise purely visual:
 * XP bursts, level-ups, rank promotions, day rollovers.
 *
 * The cinematics are gorgeous and completely silent to assistive tech, so
 * this mirrors them as polite live-region text. Sighted users never see it.
 */
export default function LiveAnnouncer({ totalXP, level, rankTitle, streak }) {
  const [message, setMessage] = useState("");
  const prev = useRef({ totalXP, level, rankTitle, streak });

  useEffect(() => {
    const before = prev.current;
    const parts = [];

    if (level > before.level) parts.push(`Level up. You are now level ${level}.`);
    if (rankTitle !== before.rankTitle) parts.push(`Promoted to ${rankTitle}.`);
    if (streak > before.streak) parts.push(`Streak is now ${streak} days.`);
    if (totalXP > before.totalXP && parts.length === 0) {
      parts.push(`Gained ${totalXP - before.totalXP} XP. Total ${totalXP}.`);
    }

    prev.current = { totalXP, level, rankTitle, streak };
    if (parts.length > 0) setMessage(parts.join(" "));
  }, [totalXP, level, rankTitle, streak]);

  return (
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </p>
  );
}
