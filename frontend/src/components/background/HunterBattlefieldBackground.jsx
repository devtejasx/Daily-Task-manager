import { useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { HUNTER_RANKS } from "../../game/constants";
import DungeonPortal from "./DungeonPortal";
import EnergyEffects from "./EnergyEffects";
import FloatingIslands from "./FloatingIslands";
import FogLayer from "./FogLayer";
import MonsterSilhouette from "./MonsterSilhouette";
import ParticleSystem from "./ParticleSystem";
import RuneField from "./RuneField";
import ShadowMonarchScene from "./ShadowMonarchScene";
import StarsNebula from "./StarsNebula";
import WorldEventEffects from "./WorldEventEffects";

function Ruins() {
  return (
    <svg className="absolute bottom-[-2%] left-0 h-[48vh] w-full pointer-events-none" viewBox="0 0 1600 460" preserveAspectRatio="none" aria-hidden>
      <path d="M0 420 L110 330 L160 350 L240 248 L328 350 L394 306 L492 388 L580 260 L670 320 L760 214 L848 334 L936 294 L1032 360 L1118 252 L1240 350 L1320 290 L1460 404 L1600 354 L1600 460 L0 460 Z" fill="rgba(2,6,23,0.95)" />
      <path d="M112 322 L112 190 L136 190 L136 316 Z" fill="rgba(15,23,42,0.9)" />
      <path d="M242 250 L242 120 L270 120 L270 238 Z" fill="rgba(15,23,42,0.92)" />
      <path d="M628 260 L628 132 L652 132 L652 252 Z" fill="rgba(15,23,42,0.88)" />
      <path d="M1004 352 L1004 172 L1033 172 L1033 334 Z" fill="rgba(15,23,42,0.9)" />
      <path d="M1312 288 L1312 156 L1338 156 L1338 270 Z" fill="rgba(15,23,42,0.88)" />
      <path d="M156 350 C220 316 286 282 354 250" stroke="rgba(59,130,246,0.14)" strokeWidth="2" fill="none" />
      <path d="M702 318 C780 286 850 246 914 202" stroke="rgba(124,58,237,0.12)" strokeWidth="2" fill="none" />
    </svg>
  );
}

function MoonAndStormClouds({ reducedMotion }) {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {/* moon disc + halo */}
      <motion.div
        className="absolute left-[16%] top-[9%] h-24 w-24 rounded-full"
        style={{
          background: "radial-gradient(circle at 42% 38%, rgba(226,232,240,0.92), rgba(148,163,184,0.5) 62%, rgba(100,116,139,0.24) 78%, transparent 82%)",
          boxShadow: "0 0 60px rgba(191,219,254,0.35), 0 0 140px rgba(148,163,184,0.22)",
        }}
        animate={reducedMotion ? { opacity: 0.8 } : { opacity: [0.7, 0.92, 0.7] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* moonlight shaft */}
      <motion.div
        className="absolute left-[6%] top-[4%] h-[70vh] w-[30%] blur-3xl"
        style={{ background: "linear-gradient(165deg, rgba(191,219,254,0.14), rgba(148,163,184,0.05) 46%, transparent 72%)" }}
        animate={reducedMotion ? { opacity: 0.5 } : { opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* storm clouds drifting across the moon */}
      <motion.div
        className="absolute left-[4%] top-[5%] h-40 w-[46rem] rounded-full blur-2xl"
        style={{ background: "radial-gradient(ellipse at 40% 55%, rgba(15,23,42,0.92), rgba(30,41,59,0.55) 55%, transparent 74%)" }}
        animate={reducedMotion ? { opacity: 0.7 } : { x: [0, 90, 0], opacity: [0.62, 0.88, 0.62] }}
        transition={{ duration: 46, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[10%] top-[12%] h-28 w-[38rem] rounded-full blur-2xl"
        style={{ background: "radial-gradient(ellipse at 60% 45%, rgba(2,6,23,0.9), rgba(15,23,42,0.5) 58%, transparent 76%)" }}
        animate={reducedMotion ? { opacity: 0.6 } : { x: [0, -70, 0], opacity: [0.5, 0.78, 0.5] }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[8%] top-[3%] h-36 w-[42rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(15,23,42,0.85), rgba(30,41,59,0.4) 60%, transparent 78%)" }}
        animate={reducedMotion ? { opacity: 0.6 } : { x: [0, -110, 0], opacity: [0.55, 0.8, 0.55] }}
        transition={{ duration: 54, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Mountains() {
  return (
    <svg className="absolute bottom-[10%] left-0 h-[36vh] w-full pointer-events-none" viewBox="0 0 1600 280" preserveAspectRatio="none" aria-hidden>
      <path d="M0 220 L120 150 L240 214 L336 96 L442 194 L548 116 L662 206 L786 86 L924 176 L1048 126 L1164 204 L1294 146 L1430 218 L1600 150 L1600 280 L0 280 Z" fill="rgba(6,10,20,0.9)" />
      <path d="M0 244 L200 180 L340 232 L480 156 L610 224 L760 138 L914 220 L1062 164 L1230 220 L1360 172 L1600 246 L1600 280 L0 280 Z" fill="rgba(2,6,23,0.86)" />
    </svg>
  );
}

export default function HunterBattlefieldBackground({
  rank,
  missionPulse = 0,
  xpPulse = 0,
  levelPulse = 0,
  promotionPulse = 0,
}) {
  const reducedMotion = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 26, damping: 22 });
  const sy = useSpring(my, { stiffness: 26, damping: 22 });
  const farX = useTransform(sx, (value) => value * -10);
  const midX = useTransform(sx, (value) => value * -20);
  const nearX = useTransform(sx, (value) => value * -32);
  const seed = missionPulse + xpPulse + levelPulse + promotionPulse;

  /* ---- scroll narrative: travelling deeper into the world ----
     0 → surface (portal waking), mid → depths (fog, runes, islands),
     1 → journey's end (world calms, portal settles) */
  const { scrollYProgress } = useScroll();
  const depth = useSpring(scrollYProgress, { stiffness: 42, damping: 24 });

  // depth travel: each parallax plane rises at a different rate
  const farY = useTransform([sy, depth], ([m, d]) => m * -6 + d * -22);
  const midY = useTransform([sy, depth], ([m, d]) => m * -12 + d * -46);
  const nearY = useTransform([sy, depth], ([m, d]) => m * -18 + d * -72);

  // the portal opens mid-journey, then settles near the end
  const portalGlow = useTransform(depth, [0, 0.35, 0.75, 1], [0.92, 1.04, 1.22, 0.96]);
  const portalScale = useTransform(depth, [0, 0.75, 1], [0.98, 1.07, 1.01]);
  const portalOpacity = useTransform(depth, [0, 0.4, 0.85, 1], [0.86, 1, 1, 0.82]);
  const portalFilter = useMotionTemplate`brightness(${portalGlow})`;

  // world dressing revealed by depth
  const runeOpacity = useTransform(depth, [0.1, 0.45, 0.9, 1], [0, 0.85, 0.9, 0.45]);
  const islandOpacity = useTransform(depth, [0.25, 0.6, 1], [0, 0.9, 0.7]);
  const denseFog = useTransform(depth, [0, 0.45, 0.85, 1], [0, 0.5, 0.38, 0.12]);
  const deepDark = useTransform(depth, [0, 0.6, 1], [0, 0.3, 0.16]);

  useEffect(() => {
    const onMove = (event) => {
      mx.set(event.clientX / window.innerWidth - 0.5);
      my.set(event.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const tier = HUNTER_RANKS.find((r) => r.key === rank?.key) ?? HUNTER_RANKS[0];

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden -z-10"
      initial={{ opacity: 0 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: [1.01, 1.045, 1.01] }}
      transition={
        reducedMotion
          ? { duration: 1.8, ease: "easeOut" }
          : {
              opacity: { duration: 1.8, ease: "easeOut" },
              scale: { duration: 48, repeat: Infinity, ease: "easeInOut" },
            }
      }
      style={{ willChange: "transform" }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-12%,rgba(30,41,59,0.96)_0%,rgba(11,17,32,0.98)_38%,#04050a_100%)]" />

      <motion.div className="absolute inset-0" style={{ x: farX, y: farY }}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,37,84,0.18)_0%,rgba(2,6,23,0.14)_34%,rgba(0,0,0,0.28)_100%)]" />
        <StarsNebula />
        <MoonAndStormClouds reducedMotion={reducedMotion} />
        <motion.div className="absolute inset-0" style={{ opacity: portalOpacity, scale: portalScale, filter: portalFilter }}>
          <DungeonPortal rank={tier} signal={seed} className="left-1/2 top-[4%] h-[56rem] w-[56rem] -translate-x-1/2 opacity-90" />
        </motion.div>
        <Mountains />
      </motion.div>

      <motion.div className="absolute inset-0" style={{ x: midX, y: midY }}>
        <Ruins />
        <MonsterSilhouette rank={tier} />
        <motion.div className="absolute inset-0" style={{ opacity: islandOpacity }}>
          <FloatingIslands rank={tier} />
        </motion.div>
      </motion.div>

      <motion.div className="absolute inset-0" style={{ x: nearX, y: nearY }}>
        <motion.div className="absolute inset-0" style={{ opacity: runeOpacity }}>
          <RuneField rank={tier} />
        </motion.div>
      </motion.div>

      {/* violet atmosphere grade — pushes the whole world toward deep purple */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(88,28,135,0.22), transparent 62%), radial-gradient(ellipse at 12% 85%, rgba(126,34,206,0.14), transparent 45%), radial-gradient(ellipse at 88% 85%, rgba(126,34,206,0.14), transparent 45%)",
        }}
      />

      <FogLayer intensity={tier.key === "NATIONAL" ? 1.35 : tier.key === "S" ? 1.2 : 1} />

      {/* depth fog: densifies as the user scrolls deeper, thins at journey's end */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: denseFog,
          background:
            "radial-gradient(ellipse at 30% 70%, rgba(30,27,75,0.5), transparent 55%), radial-gradient(ellipse at 74% 62%, rgba(15,23,42,0.55), transparent 58%), linear-gradient(180deg, transparent 30%, rgba(9,9,24,0.5) 100%)",
          filter: "blur(2px)",
        }}
      />
      <EnergyEffects rank={tier} intensity={tier.key === "NATIONAL" ? 1.5 : tier.key === "S" ? 1.25 : 1} />

      {/* key-art figures render ABOVE the fog so they stay visible */}
      <motion.div className="absolute inset-0" style={{ x: nearX, y: nearY }}>
        <ShadowMonarchScene rank={tier} />
      </motion.div>

      <ParticleSystem intensity={tier.key === "NATIONAL" ? 1.35 : tier.key === "S" ? 1.18 : 1} seed={seed} />
      <WorldEventEffects
        rank={tier}
        missionPulse={missionPulse}
        xpPulse={xpPulse}
        levelPulse={levelPulse}
        promotionPulse={promotionPulse}
      />

      {/* deep-world darkening, driven by scroll depth */}
      <motion.div className="absolute inset-0 pointer-events-none bg-black" style={{ opacity: deepDark }} />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_62%,rgba(0,0,0,0.42)_100%)]" />
    </motion.div>
  );
}