import { motion, useReducedMotion } from "framer-motion";

/* =========================================================
   ShadowMonarchScene — original key-art style composition:
   a lone coat-clad figure seen from behind, flanked by two
   towering shadow soldiers wreathed in violet flame.
   Pure silhouettes + glow. No copyrighted characters.
   ========================================================= */

function FlameAura({ className, color = "rgba(168,85,247,0.5)", duration = 3.2, delay = 0 }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={`absolute rounded-full blur-2xl ${className}`}
      style={{ background: `radial-gradient(ellipse at 50% 80%, ${color}, rgba(124,58,237,0.18) 55%, transparent 75%)` }}
      animate={
        reducedMotion
          ? { opacity: 0.5 }
          : { opacity: [0.38, 0.72, 0.45, 0.66, 0.38], scaleY: [1, 1.08, 1.02, 1.1, 1], scaleX: [1, 0.96, 1.03, 0.97, 1] }
      }
      transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

/* towering armored silhouette, horned helm, spiked pauldrons, burning eyes */
function ShadowSoldier({ side, aura, color, delay = 0 }) {
  const reducedMotion = useReducedMotion();
  const isLeft = side === "left";

  return (
    <motion.div
      className={`absolute bottom-[-3%] h-[64vh] w-[32vw] max-w-[27rem] min-w-[17rem] ${isLeft ? "left-[-2%]" : "right-[-2%]"}`}
      style={isLeft ? undefined : { scaleX: -1 }}
      animate={reducedMotion ? { opacity: 0.9 } : { y: [0, -7, 0], opacity: [0.82, 0.95, 0.82] }}
      transition={{ duration: 8.5, repeat: Infinity, delay, ease: "easeInOut" }}
      aria-hidden
    >
      {/* violet flame sheath behind the body */}
      <FlameAura className="inset-x-[6%] top-[4%] bottom-[6%]" color={aura} duration={2.9} delay={delay} />
      <FlameAura className="inset-x-[20%] top-[-4%] h-[38%]" color="rgba(192,132,252,0.42)" duration={3.7} delay={delay + 0.8} />

      <svg viewBox="0 0 300 540" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMax meet">
        {/* horned helm */}
        <path d="M118 92 C112 56 96 38 84 20 C110 34 122 44 132 58 C138 40 146 26 152 12 C158 26 166 40 172 58 C182 44 194 34 220 20 C208 38 192 56 186 92 C186 108 178 122 152 126 C126 122 118 108 118 92 Z" fill="rgba(6,4,16,0.94)" />
        {/* torso + jagged armor plates */}
        <path d="M112 120 C88 138 74 160 70 190 C58 198 42 210 34 230 C52 226 66 224 78 228 C70 262 70 300 82 344 C64 356 52 374 46 398 C62 388 76 384 90 386 C96 430 108 478 128 524 L176 524 C196 478 208 430 214 386 C228 384 242 388 258 398 C252 374 240 356 222 344 C234 300 234 262 226 228 C238 224 252 226 270 230 C262 210 246 198 234 190 C230 160 216 138 192 120 C180 132 166 138 152 138 C138 138 124 132 112 120 Z" fill="rgba(8,5,20,0.92)" />
        {/* spiked pauldrons */}
        <path d="M64 176 L38 148 L74 160 L60 128 L92 152 L88 118 L110 146 Z" fill="rgba(10,6,24,0.9)" />
        <path d="M236 176 L262 148 L226 160 L240 128 L208 152 L212 118 L190 146 Z" fill="rgba(10,6,24,0.9)" />
        {/* armor seams lit from within */}
        <path d="M120 200 C136 214 168 214 184 200" fill="none" stroke={color} strokeWidth="2.4" opacity="0.55" style={{ filter: `drop-shadow(0 0 8px ${aura})` }} />
        <path d="M108 268 C134 284 170 284 196 268" fill="none" stroke={color} strokeWidth="2" opacity="0.4" style={{ filter: `drop-shadow(0 0 7px ${aura})` }} />
        <path d="M100 340 C130 358 174 358 204 340" fill="none" stroke={color} strokeWidth="1.8" opacity="0.3" style={{ filter: `drop-shadow(0 0 6px ${aura})` }} />
        {/* burning chest core */}
        <ellipse cx="152" cy="236" rx="14" ry="20" fill={color} opacity="0.32" style={{ filter: `blur(6px)` }} />
      </svg>

      {/* burning eyes */}
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${44 + i * 9}%`,
            top: "16.5%",
            width: 7,
            height: 5,
            background: color,
            boxShadow: `0 0 14px ${color}, 0 0 30px ${aura}`,
          }}
          animate={reducedMotion ? { opacity: 0.85 } : { opacity: [0.65, 1, 0.75, 1, 0.65], scale: [1, 1.18, 1, 1.14, 1] }}
          transition={{ duration: 4.4, repeat: Infinity, delay: delay + i * 0.25, ease: "easeInOut" }}
        />
      ))}

      {/* embers rising off the flames */}
      {Array.from({ length: 7 }, (_, i) => (
        <motion.span
          key={`e${i}`}
          className="absolute rounded-full"
          style={{
            left: `${18 + ((i * 37) % 60)}%`,
            bottom: `${8 + ((i * 23) % 30)}%`,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            background: i % 2 ? color : "#c084fc",
            boxShadow: `0 0 8px ${aura}`,
          }}
          animate={reducedMotion ? { opacity: 0.3 } : { y: [0, -60 - (i % 4) * 22], x: [0, (i % 2 ? 14 : -12)], opacity: [0, 0.85, 0] }}
          transition={{ duration: 3.2 + (i % 5) * 0.7, repeat: Infinity, delay: delay + i * 0.5, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}

/* the lone monarch: long-coat figure from behind, bottom center */
function MonarchFigure({ aura, color }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="absolute bottom-[-2%] left-1/2 h-[46vh] w-[17rem] -translate-x-1/2"
      animate={reducedMotion ? { opacity: 0.95 } : { y: [0, -5, 0], opacity: [0.9, 1, 0.9] }}
      transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      {/* bright violet sky-glow BEHIND the figure — makes the black coat read */}
      <motion.div
        className="absolute inset-x-[-55%] top-[-14%] bottom-[-12%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(168,85,247,0.5), rgba(126,34,206,0.28) 48%, transparent 72%)" }}
        animate={reducedMotion ? { opacity: 0.65 } : { opacity: [0.5, 0.78, 0.5], scale: [0.97, 1.06, 0.97] }}
        transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* hot inner core right behind the shoulders */}
      <motion.div
        className="absolute inset-x-[-8%] top-[2%] h-[44%] rounded-full blur-2xl"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(216,180,254,0.4), transparent 70%)" }}
        animate={reducedMotion ? { opacity: 0.5 } : { opacity: [0.38, 0.66, 0.38] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 240 420" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMax meet">
        {/* head + collar */}
        <path d="M104 44 C104 24 112 12 120 12 C128 12 136 24 136 44 C136 56 130 64 120 66 C110 64 104 56 104 44 Z" fill="rgba(4,3,12,0.97)" />
        <path d="M92 74 C102 64 138 64 148 74 C144 82 132 86 120 86 C108 86 96 82 92 74 Z" fill="rgba(4,3,12,0.97)" />
        {/* shoulders + arms relaxed */}
        <path d="M88 78 C68 90 58 108 56 132 L64 210 L80 206 L84 132 Z" fill="rgba(5,4,14,0.96)" />
        <path d="M152 78 C172 90 182 108 184 132 L176 210 L160 206 L156 132 Z" fill="rgba(5,4,14,0.96)" />
        {/* long coat, flaring at the hem */}
        <path d="M88 80 C104 92 136 92 152 80 C164 110 170 150 168 196 C178 268 186 336 196 404 C170 414 148 418 120 418 C92 418 70 414 44 404 C54 336 62 268 72 196 C70 150 76 110 88 80 Z" fill="rgba(4,3,12,0.96)" />
        {/* coat split */}
        <path d="M120 240 C118 296 116 352 114 410" fill="none" stroke="rgba(30,20,60,0.9)" strokeWidth="3" />
        {/* violet rim light on coat edges */}
        <path d="M72 196 C62 268 54 336 44 404" fill="none" stroke={color} strokeWidth="1.6" opacity="0.5" style={{ filter: `drop-shadow(0 0 7px ${aura})` }} />
        <path d="M168 196 C178 268 186 336 196 404" fill="none" stroke={color} strokeWidth="1.6" opacity="0.5" style={{ filter: `drop-shadow(0 0 7px ${aura})` }} />
        {/* faint glow at the hands */}
        <circle cx="62" cy="212" r="5" fill={color} opacity="0.4" style={{ filter: "blur(3px)" }} />
      </svg>

      {/* wisps of shadow curling off the coat hem */}
      {Array.from({ length: 5 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full blur-sm"
          style={{
            left: `${26 + i * 12}%`,
            bottom: "2%",
            width: 8 + (i % 3) * 4,
            height: 8 + (i % 3) * 4,
            background: "rgba(10,6,24,0.85)",
            boxShadow: `0 0 10px ${aura}`,
          }}
          animate={reducedMotion ? { opacity: 0.3 } : { y: [0, -34 - (i % 3) * 14], x: [0, i % 2 ? 16 : -14], opacity: [0.55, 0], scale: [1, 1.7] }}
          transition={{ duration: 3.6 + i * 0.5, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}

export default function ShadowMonarchScene({ rank }) {
  /* the scene always burns violet (the key-art look); high ranks recolor the eyes */
  const isHighRank = rank?.key === "S" || rank?.key === "NATIONAL";
  const color = isHighRank ? rank.color : "#c084fc";
  const aura = "rgba(147,51,234,0.6)";

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <ShadowSoldier side="left" aura={aura} color={color} />
      <ShadowSoldier side="right" aura={aura} color={color} delay={1.6} />
      <MonarchFigure aura={aura} color={color} />
    </div>
  );
}
