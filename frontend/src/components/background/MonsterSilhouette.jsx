import { motion, useReducedMotion } from "framer-motion";

export default function MonsterSilhouette({ rank }) {
  const reducedMotion = useReducedMotion();
  const aura = rank?.aura ?? "rgba(124,58,237,0.24)";

  return (
    <div className="absolute pointer-events-none" aria-hidden>
      <motion.svg
        className="absolute left-[5%] top-[22%] h-[18rem] w-[32rem] opacity-[0.14] blur-[1px]"
        viewBox="0 0 900 360"
        preserveAspectRatio="xMidYMid meet"
        animate={reducedMotion ? { opacity: 0.1 } : { y: [0, -5, 0], x: [0, 8, 0], opacity: [0.09, 0.15, 0.09] }}
        transition={{ duration: 7.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M84 250 C148 170 242 122 344 124 C414 126 482 150 544 184 C606 218 660 228 746 208 C680 270 606 312 522 324 C390 342 270 322 178 286 C130 267 100 254 84 250 Z" fill="rgba(3,7,18,0.96)" />
        <path d="M550 171 C592 142 620 123 651 110 C668 123 682 142 691 162 C670 158 648 158 622 166 C603 171 585 173 550 171 Z" fill="rgba(2,6,23,0.92)" />
        <circle cx="614" cy="165" r="3.5" fill="#dbeafe" />
        <circle cx="631" cy="162" r="3.5" fill="#dbeafe" />
      </motion.svg>

      <motion.svg
        className="absolute right-[6%] top-[8%] h-[16rem] w-[28rem] opacity-[0.12] blur-[1px]"
        viewBox="0 0 800 300"
        preserveAspectRatio="xMidYMid meet"
        animate={reducedMotion ? { opacity: 0.09 } : { y: [0, 6, 0], x: [0, -10, 0], opacity: [0.08, 0.13, 0.08] }}
        transition={{ duration: 8.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M48 206 C88 154 154 126 220 120 C280 114 344 128 404 164 C458 196 520 212 610 202 C562 236 506 258 442 266 C332 280 204 260 116 230 C84 219 61 212 48 206 Z" fill="rgba(5,8,18,0.94)" />
        <path d="M330 166 C368 138 388 124 414 118 C430 129 441 145 446 164 C428 160 406 160 389 166 C372 171 356 170 330 166 Z" fill="rgba(2,6,23,0.96)" />
        <circle cx="396" cy="161" r="3" fill="#fde68a" />
        <circle cx="415" cy="159" r="3" fill="#fde68a" />
      </motion.svg>

      <motion.div
        className="absolute left-[50%] top-[18%] h-[10rem] w-[22rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${aura}, transparent 72%)` }}
        animate={reducedMotion ? { opacity: 0.12 } : { opacity: [0.06, 0.16, 0.06], scale: [0.98, 1.03, 0.98] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}