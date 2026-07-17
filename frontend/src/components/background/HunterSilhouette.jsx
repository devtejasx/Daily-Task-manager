import { motion, useReducedMotion } from "framer-motion";

export default function HunterSilhouette({ rank, signal = 0 }) {
  const reducedMotion = useReducedMotion();
  const aura = rank?.aura ?? "rgba(124,58,237,0.35)";
  const color = rank?.color ?? "#a78bfa";

  return (
    <div className="absolute pointer-events-none" aria-hidden>
      <motion.div
        className="absolute right-[12%] bottom-[8%] h-[34rem] w-[22rem] -translate-x-1/2 blur-[1px]"
        style={{ filter: "drop-shadow(0 0 38px rgba(124,58,237,0.18))" }}
        animate={reducedMotion ? { opacity: 0.14 } : { y: [0, -8, 0], scaleY: [1, 1.02, 1], opacity: [0.11, 0.16, 0.11] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 rounded-[44%_44%_22%_22%/48%_48%_24%_24%]"
          style={{
            background: `radial-gradient(circle at 50% 18%, ${aura}, transparent 70%)`,
            boxShadow: `0 0 54px ${aura}`,
            filter: "blur(24px)",
          }}
          animate={reducedMotion ? { opacity: 0.35 } : { opacity: [0.2, 0.45, 0.2], scale: [0.98, 1.05, 0.98] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <svg viewBox="0 0 360 560" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMax meet">
          <path d="M173 36 C148 36 132 54 128 84 C126 103 132 114 137 123 C118 137 106 160 106 190 C106 220 118 241 126 266 C103 311 79 392 74 526 C107 534 131 536 180 536 C230 536 257 534 286 526 C281 387 255 310 233 266 C241 242 252 221 252 192 C252 159 239 136 220 123 C226 112 233 102 231 84 C227 54 211 36 187 36 Z" fill="rgba(2,6,23,0.88)" />
          <path d="M128 126 C150 112 168 104 181 104 C194 104 210 113 230 126 C230 131 221 138 216 141 C202 145 191 148 179 148 C166 148 151 145 137 141 C133 137 128 132 128 126 Z" fill="rgba(3,7,18,0.96)" />
          <path d="M124 151 C141 162 157 172 179 172 C202 172 218 162 236 151 C244 180 247 211 245 256 C244 301 226 364 224 534 C206 538 195 540 180 540 C165 540 155 538 135 534 C133 365 116 302 115 256 C113 210 116 180 124 151 Z" fill="rgba(8,11,22,0.94)" />
          <path d="M114 260 C87 315 65 404 60 526 C90 532 111 534 133 535 C135 451 140 390 155 326 C140 300 129 278 114 260 Z" fill="rgba(5,8,18,0.88)" />
          <path d="M245 260 C272 314 294 404 299 526 C269 532 248 534 226 535 C224 451 219 390 204 326 C219 300 230 278 245 260 Z" fill="rgba(5,8,18,0.88)" />
          <path d="M160 266 C151 284 142 309 135 334 C130 352 120 394 112 535" fill="none" stroke="rgba(167,139,250,0.34)" strokeWidth="2" />
          <path d="M200 266 C209 284 218 309 225 334 C230 352 240 394 248 535" fill="none" stroke="rgba(6,182,212,0.25)" strokeWidth="2" />
          <path d="M226 212 C262 196 292 186 314 180" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 14px ${aura})` }} />
          <circle cx="295" cy="178" r="4" fill={color} />
        </svg>
      </motion.div>

      <motion.div
        className="absolute right-[12%] bottom-[12%] h-[28rem] w-[26rem] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${aura}, transparent 72%)` }}
        animate={reducedMotion ? { opacity: 0.18 } : { opacity: [0.11, 0.24, 0.11], scale: [0.96, 1.06, 0.96] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute right-[13%] bottom-[16%] flex h-0 w-0 justify-center">
        {Array.from({ length: 6 }, (_, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full"
            style={{
              width: 2 + index * 0.5,
              height: 2 + index * 0.5,
              background: index % 2 === 0 ? color : "#0f172a",
              boxShadow: `0 0 12px ${aura}`,
            }}
            animate={reducedMotion ? { opacity: 0.3 } : { x: [0, -20 - index * 4], y: [0, -12 - index * 5], opacity: [0.7, 0] }}
            transition={{ duration: 2.4 + index * 0.3, repeat: Infinity, delay: index * 0.22, ease: "easeOut" }}
          />
        ))}
      </div>
    </div>
  );
}