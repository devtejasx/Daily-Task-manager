import { useEffect, useRef, useState } from "react";

/**
 * Screen-reader announcer for things that are otherwise purely visual:
 * XP bursts, level-ups, rank promotions, day rollovers and the Resolve
 * screens.
 *
 * The cinematics are gorgeous and completely silent to assistive tech, so
 * this mirrors them as polite live-region text. Sighted users never see it.
 *
 * Resolve events matter most here: a hunter who cannot see the shield
 * cinematic would otherwise have no idea their streak survived, which is
 * the single most reassuring fact the app has to offer. Titles and cleared
 * challenges are announced for the same reason — every one of them is
 * delivered visually and would otherwise simply not happen.
 */
export default function LiveAnnouncer({
  totalXP,
  level,
  rankTitle,
  streak,
  shields,
  recovery,
  title = null,
  titleCount = 0,
  challengeCleared = null,
}) {
  const [message, setMessage] = useState("");
  const prev = useRef({ totalXP, level, rankTitle, streak, shields, recovery, title, titleCount, challengeCleared });

  useEffect(() => {
    const before = prev.current;
    const parts = [];

    if (level > before.level) parts.push(`Level up. You are now level ${level}.`);
    if (rankTitle !== before.rankTitle) parts.push(`Promoted to ${rankTitle}.`);

    // Progression the cinematics show and say nothing about.
    if (titleCount > before.titleCount) {
      parts.push(title ? `Title earned. You are now ${title}.` : "New title earned.");
    } else if (title && title !== before.title) {
      parts.push(`Now wearing the title ${title}.`);
    }

    if (challengeCleared && challengeCleared !== before.challengeCleared) {
      parts.push(
        challengeCleared.kind === "boss"
          ? `Boss cleared. ${challengeCleared.label}. ${challengeCleared.xp} XP.`
          : `Weekly challenge cleared. ${challengeCleared.xp} XP.`
      );
    }

    // Resolve transitions, phrased the way the cinematics phrase them.
    if (shields < before.shields) {
      parts.push(
        `A streak shield absorbed a missed day. Your ${streak} day streak is intact. ${shields} shields remaining.`
      );
    } else if (shields > before.shields) {
      parts.push(`Streak shield forged. ${shields} banked.`);
    }

    if (recovery && !before.recovery) {
      parts.push(
        `Your ${recovery.streak} day streak is being held for one day. Clear today's quest to reclaim it.`
      );
    } else if (!recovery && before.recovery) {
      parts.push(`Streak recovered. ${streak} days restored.`);
    }

    if (streak > before.streak && parts.length === 0) parts.push(`Streak is now ${streak} days.`);
    if (totalXP > before.totalXP && parts.length === 0) {
      parts.push(`Gained ${totalXP - before.totalXP} XP. Total ${totalXP}.`);
    }

    prev.current = { totalXP, level, rankTitle, streak, shields, recovery, title, titleCount, challengeCleared };
    if (parts.length > 0) setMessage(parts.join(" "));
  }, [totalXP, level, rankTitle, streak, shields, recovery, title, titleCount, challengeCleared]);

  return (
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </p>
  );
}
