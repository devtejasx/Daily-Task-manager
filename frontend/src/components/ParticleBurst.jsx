import { motion } from "framer-motion";

/**
 * A one-shot radial burst of glowing particles.
 * Mount it when a mission completes; it fades itself out.
 */
export default function ParticleBurst({ color = "#a78bfa", count = 14 }) {
  const parts = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 40 + Math.random() * 70;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      size: 3 + Math.random() * 5,
      delay: Math.random() * 0.1,
    };
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: color,
            boxShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
