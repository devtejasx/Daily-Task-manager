import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export default function ParticleSystem({ intensity = 1, seed = 0 }) {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let raf = 0;
    let particles = [];
    let rain = [];
    let wind = 0;
    let windPhase = Math.random() * Math.PI * 2;
    const pointer = { x: -9999, y: -9999 };

    const onPointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const palette = [
      { rgb: "124,58,237", alpha: 0.16 },
      { rgb: "59,130,246", alpha: 0.12 },
      { rgb: "6,182,212", alpha: 0.09 },
      { rgb: "148,163,184", alpha: 0.1 },
      { rgb: "245,158,11", alpha: 0.12 },
    ];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = reducedMotion ? 26 : Math.min(160, Math.floor((window.innerWidth * window.innerHeight) / 18000) + 40);
      particles = Array.from({ length: count }, () => {
        const kind = Math.random();
        const base = palette[(Math.random() * palette.length) | 0];
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: kind > 0.78 ? 1.4 + Math.random() * 1.6 : 0.4 + Math.random() * 1.1,
          vx: (Math.random() - 0.5) * (kind > 0.78 ? 0.14 : 0.06) * intensity,
          vy: (kind > 0.78 ? 0.2 : -0.03 - Math.random() * 0.2) * intensity,
          color: base.rgb,
          alpha: base.alpha,
          tw: Math.random() * Math.PI * 2,
          kind: kind > 0.78 ? "ember" : kind > 0.42 ? "ash" : "dust",
        };
      });

      const rainCount = reducedMotion ? 0 : Math.min(70, Math.floor(window.innerWidth / 24));
      rain = Array.from({ length: rainCount }, () => ({
        x: Math.random() * (window.innerWidth + 200) - 100,
        y: Math.random() * window.innerHeight,
        len: 8 + Math.random() * 14,
        speed: (3.4 + Math.random() * 2.6) * intensity,
        alpha: 0.05 + Math.random() * 0.09,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // slow sinusoidal wind gusts sweep every particle sideways
      windPhase += 0.0035;
      wind = Math.sin(windPhase) * 0.35 + Math.sin(windPhase * 2.7) * 0.12;

      for (const p of particles) {
        p.tw += p.kind === "ember" ? 0.04 : 0.02;
        p.x += p.vx + wind * (p.kind === "dust" ? 0.5 : 0.3) + (p.kind === "ember" ? 0.02 : 0);
        p.y += p.vy;

        // cursor gently displaces nearby particles — soft, never exaggerated
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 19600 && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const push = ((140 - dist) / 140) * 0.55;
          p.x += (dx / dist) * push;
          p.y += (dy / dist) * push;
        }

        if (p.y < -20) {
          p.y = window.innerHeight + 20;
          p.x = Math.random() * window.innerWidth;
        }
        if (p.y > window.innerHeight + 20) {
          p.y = -20;
          p.x = Math.random() * window.innerWidth;
        }
        if (p.x < -20) p.x = window.innerWidth + 20;
        if (p.x > window.innerWidth + 20) p.x = -20;

        const alpha = p.alpha * (0.65 + 0.35 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${alpha})`;
        ctx.shadowColor = `rgba(${p.color},0.75)`;
        ctx.shadowBlur = p.kind === "ember" ? 10 : 6;
        ctx.fill();
      }

      // faint slanted rain streaks, angled by the wind
      if (rain.length > 0) {
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        for (const drop of rain) {
          const slant = 1.1 + wind * 2.4;
          drop.x += slant;
          drop.y += drop.speed;
          if (drop.y > window.innerHeight + drop.len) {
            drop.y = -drop.len - Math.random() * 40;
            drop.x = Math.random() * (window.innerWidth + 200) - 100;
          }
          if (drop.x > window.innerWidth + 100) drop.x = -100;
          if (drop.x < -100) drop.x = window.innerWidth + 100;

          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - slant * (drop.len / drop.speed), drop.y - drop.len);
          ctx.strokeStyle = `rgba(148,180,220,${drop.alpha})`;
          ctx.stroke();
        }
      }

      if (!reducedMotion) {
        raf = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [intensity, reducedMotion, seed]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}