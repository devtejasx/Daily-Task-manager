import { motion, useReducedMotion } from "framer-motion";

export default function FogLayer({ intensity = 1 }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-16 top-[14%] h-[28rem] w-[48rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.16), transparent 68%)" }}
        animate={reducedMotion ? { opacity: 0.22 } : { x: [0, 40, 0], y: [0, -12, 0], opacity: [0.12, 0.24, 0.12] }}
        transition={{ duration: 28 / intensity, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-20 top-[30%] h-[24rem] w-[42rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15), transparent 66%)" }}
        animate={reducedMotion ? { opacity: 0.18 } : { x: [0, -48, 0], y: [0, 10, 0], opacity: [0.1, 0.22, 0.1] }}
        transition={{ duration: 34 / intensity, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-[-10%] h-[32vh] blur-3xl"
        style={{ background: "linear-gradient(180deg, transparent, rgba(11,17,32,0.24) 30%, rgba(5,6,10,0.78))" }}
        animate={reducedMotion ? { opacity: 0.7 } : { opacity: [0.6, 0.9, 0.6], y: [0, 8, 0] }}
        transition={{ duration: 22 / intensity, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)" }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: [0.88, 1, 0.88] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}