import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";

function createParticles(count, palette, spread = 1) {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i * 37) % 360) * (Math.PI / 180);
    const radius = 18 + ((i * 13) % 74) * spread;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: 1.5 + ((i * 17) % 5) * 0.35,
      delay: (i % 8) * 0.06,
      color: palette[i % palette.length],
    };
  });
}

export function ParticleBackground({ className = "", intensity = 1, count = 96 }) {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let raf = 0;
    let particles = [];
    const palette = ["124,58,237", "59,130,246", "6,182,212", "167,139,250"];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const particleCount = reducedMotion ? Math.min(24, count) : count;
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0.7 + Math.random() * 1.8 * intensity,
        vx: (Math.random() - 0.5) * 0.24 * intensity,
        vy: -0.04 - Math.random() * 0.26 * intensity,
        color: palette[(Math.random() * palette.length) | 0],
        alpha: 0.12 + Math.random() * 0.35,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.018;
        if (p.y < -12) {
          p.y = window.innerHeight + 12;
          p.x = Math.random() * window.innerWidth;
        }
        if (p.x < -12) p.x = window.innerWidth + 12;
        if (p.x > window.innerWidth + 12) p.x = -12;

        const alpha = p.alpha * (0.65 + 0.35 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${alpha})`;
        ctx.shadowColor = `rgba(${p.color},0.85)`;
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      if (!reducedMotion) {
        raf = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
    };
  }, [count, intensity, reducedMotion]);

  return <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}

export function EnergyOverlay({ className = "", intensity = 1 }) {
  const reducedMotion = useReducedMotion();
  const particles = useMemo(() => createParticles(12, ["#7c3aed", "#06b6d4", "#3b82f6", "#a78bfa"], intensity), [intensity]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.24), transparent 40%), radial-gradient(ellipse at 50% 100%, rgba(6,182,212,0.16), transparent 46%)",
          opacity: 0.9,
        }}
        animate={reducedMotion ? { opacity: 0.8 } : { opacity: [0.65, 1, 0.72], filter: ["saturate(1)", "saturate(1.25)", "saturate(1)"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute left-[-10%] top-[-12%] h-[130%] w-[28%] bg-gradient-to-b from-transparent via-violet-500/16 to-transparent blur-3xl"
        animate={reducedMotion ? {} : { x: [0, 24, 0], rotate: [12, 18, 12], opacity: [0.16, 0.3, 0.16] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-8%] top-[-14%] h-[145%] w-[30%] bg-gradient-to-b from-transparent via-cyan-400/12 to-transparent blur-3xl"
        animate={reducedMotion ? {} : { x: [0, -20, 0], rotate: [-12, -18, -12], opacity: [0.12, 0.24, 0.12] }}
        transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.5)_100%)]" />

      <div className="absolute inset-0 opacity-60 mix-blend-screen">
        {particles.map((p, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full"
            style={{
              left: `calc(50% + ${p.x}px)`,
              top: `calc(50% + ${p.y}px)`,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 10px ${p.color}`,
            }}
            animate={reducedMotion ? { opacity: 0.5 } : { opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2.8 + (index % 4), repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

export function PortalEffect({ className = "", color = "#7c3aed", accent = "#06b6d4", intensity = 1 }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={`absolute pointer-events-none ${className}`} aria-hidden>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${color}cc, ${accent}bb, transparent 38%, ${color}88, transparent 72%, ${accent}88, transparent)`,
          filter: "blur(18px)",
        }}
        animate={reducedMotion ? { opacity: 0.75 } : { rotate: 360, scale: [0.96, 1.04, 0.96], opacity: [0.55, 0.92, 0.55] }}
        transition={{ duration: 16 / intensity, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-[14%] rounded-full border"
        style={{
          borderColor: `${color}88`,
          boxShadow: `0 0 36px ${color}55, inset 0 0 24px ${color}33`,
        }}
        animate={reducedMotion ? {} : { rotate: -360 }}
        transition={{ duration: 20 / intensity, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-[30%] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(15,10,40,0.96) 30%, ${color}55 72%, transparent 78%)`,
          boxShadow: `0 0 70px ${color}44, inset 0 0 54px ${accent}44`,
          filter: "blur(1px)",
        }}
        animate={reducedMotion ? {} : { scale: [1, 1.05, 1], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 5.5 / intensity, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 bottom-[24%] h-[34%] w-[14%] -translate-x-1/2 rounded-full"
        style={{
          background: `linear-gradient(180deg, transparent, ${accent}66 55%, ${color}cc)`,
          filter: "blur(28px)",
        }}
        animate={reducedMotion ? { opacity: 0.25 } : { opacity: [0.18, 0.38, 0.18], scaleY: [0.9, 1.04, 0.9] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function CinematicIntro({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const portalRef = useRef(null);
  const fogRef = useRef(null);
  const doneRef = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (doneRef.current) return undefined;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setVisible(false);
      onComplete?.();
    };

    const root = rootRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const portal = portalRef.current;
    const fog = fogRef.current;

    if (!root || !title || !subtitle || !portal || !fog) {
      finish();
      return undefined;
    }

    gsap.set([title, subtitle, portal, fog], { opacity: 0 });
    gsap.set(root, { opacity: 1 });

    if (reducedMotion) {
      const timer = window.setTimeout(finish, 1200);
      return () => window.clearTimeout(timer);
    }

    const timeline = gsap.timeline({
      defaults: { ease: "power4.out" },
      onComplete: finish,
    });

    timeline
      .to(fog, { opacity: 1, duration: 0.75 })
      .fromTo(portal, { scale: 0.35, rotate: -20, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1.15 }, "<0.15")
      .fromTo(title, { y: 26, opacity: 0, filter: "blur(12px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8 }, "<0.15")
      .fromTo(subtitle, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, "<0.15")
      .to(root, { opacity: 0, duration: 0.9, delay: 0.9 });

    const timer = window.setTimeout(finish, 4800);
    return () => {
      window.clearTimeout(timer);
      timeline.kill();
    };
  }, [onComplete, reducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
      <motion.div
        ref={rootRef}
        className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.45 } }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.96)_0%,rgba(3,6,16,0.98)_50%,#02030a_100%)]" />
        <EnergyOverlay />
        <ParticleBackground intensity={0.8} count={72} />

        <motion.div
          ref={fogRef}
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(124,58,237,0.14), transparent 18%), radial-gradient(circle at 45% 55%, rgba(6,182,212,0.1), transparent 26%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.04), transparent 32%)",
            filter: "blur(18px)",
          }}
        />

        <motion.div ref={portalRef} className="relative flex flex-col items-center justify-center px-6 text-center">
          <PortalEffect className="left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 opacity-90" intensity={1.15} />
          <motion.p
            ref={subtitleRef}
            className="relative z-10 mb-4 text-[10px] sm:text-xs font-bold tracking-[0.7em] text-cyan-200/80"
          >
            HUNTER SYSTEM INITIALIZING
          </motion.p>
          <motion.h1
            ref={titleRef}
            className="relative z-10 max-w-3xl font-display text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-blue-200 to-cyan-200"
            style={{ filter: "drop-shadow(0 0 30px rgba(124,58,237,0.85))" }}
          >
            ENTERING THE COMMAND REALM
          </motion.h1>
          <motion.p
            className="relative z-10 mt-5 max-w-lg text-sm sm:text-base text-slate-300/85"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Atmospheric seals released. Power channels aligned. The hunter dashboard is materializing.
          </motion.p>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}

export function XPAnimation({ amount, active }) {
  const reducedMotion = useReducedMotion();
  const sparks = useMemo(() => createParticles(10, ["#a78bfa", "#7c3aed", "#06b6d4"], 0.9), [amount]);

  return (
    <AnimatePresence>
      {active && amount > 0 && (
        <motion.div
          className="fixed inset-0 z-[75] pointer-events-none flex items-start justify-center pt-24 sm:pt-28"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
        >
          <motion.div
            className="absolute left-1/2 top-28 h-56 w-56 -translate-x-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(167,139,250,0.24) 0%, rgba(124,58,237,0.18) 38%, transparent 72%)",
              filter: "blur(16px)",
            }}
            animate={reducedMotion ? { opacity: 0.5 } : { scale: [0.7, 1.18, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          <motion.div
            className="absolute left-1/2 top-28 h-32 w-32 -translate-x-1/2 rounded-full border border-violet-300/50"
            style={{ boxShadow: "0 0 44px rgba(124,58,237,0.55), inset 0 0 24px rgba(6,182,212,0.2)" }}
            animate={reducedMotion ? {} : { scale: [0.8, 1.15, 1.45], opacity: [0.8, 0.55, 0] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.div
            className="relative z-10 flex flex-col items-center gap-2 rounded-2xl border border-violet-400/30 bg-slate-950/65 px-6 py-4 shadow-[0_0_32px_rgba(124,58,237,0.3)] backdrop-blur-md"
            initial={{ y: 26, scale: 0.92, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -16, opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[10px] font-bold tracking-[0.55em] text-cyan-200/80">ENERGY SURGE</span>
            <span className="font-display text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-blue-200 to-cyan-200">
              +{amount.toLocaleString()} XP
            </span>
          </motion.div>

          <div className="absolute inset-0 overflow-hidden">
            {sparks.map((spark, index) => (
              <motion.span
                key={index}
                className="absolute rounded-full"
                style={{
                  left: `calc(50% + ${spark.x}px)`,
                  top: `calc(50% + ${spark.y}px)`,
                  width: spark.size,
                  height: spark.size,
                  background: spark.color,
                  boxShadow: `0 0 10px ${spark.color}`,
                }}
                animate={reducedMotion ? { opacity: 0.6 } : { x: spark.x * 1.35, y: spark.y * 1.35, opacity: [1, 0], scale: [1, 0.2] }}
                transition={{ duration: 1.05 + spark.delay, delay: spark.delay, ease: "easeOut" }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}