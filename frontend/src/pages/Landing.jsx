/* =========================================================
   Landing — the 30-second answer

   A first-time visitor used to be dropped straight into an empty
   dashboard, which cannot explain a progression system: there is
   nothing on screen to progress. This page tells the story instead,
   in the order a stranger actually asks it —

     hook → the real problem → our answer → how it works →
     what you become → what's inside → proof → voices →
     what's next → the invitation

   Every section reuses the existing Solo-Leveling language (glass,
   neon-border, holo-scan, Orbitron display) rather than introducing a
   second visual identity. The strongest argument is not on this page
   at all: it's the Explore-the-demo button, which drops the visitor
   into a veteran hunter's live record.
   ========================================================= */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, BarChart3, CalendarDays, ChevronDown, Eye, Flame, Hourglass,
  Repeat, ShieldCheck, Sparkles, Swords, Target, Trophy, Zap,
} from "lucide-react";
import { ParticleBackground, EnergyOverlay } from "../components/CinematicLayers";
import { useAuthGate } from "../components/auth/AuthGate";
import { HUNTER_RANKS, SHIELD_EVERY, SHIELD_MAX } from "../game/constants";

/* ---------- shared section frame ---------- */

function Section({ id, eyebrow, title, lead, children, className = "" }) {
  return (
    <section id={id} className={`relative px-5 sm:px-8 py-16 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {eyebrow && (
          <motion.p
            className="font-display text-[10px] sm:text-xs font-bold tracking-[0.35em] text-cyan-300/80"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            {eyebrow}
          </motion.p>
        )}
        {title && (
          <motion.h2
            className="font-display font-black text-2xl sm:text-4xl text-slate-100 mt-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {title}
          </motion.h2>
        )}
        {lead && (
          <motion.p
            className="text-slate-400 text-sm sm:text-base mt-4 max-w-2xl leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            {lead}
          </motion.p>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

function Card({ icon: Icon, title, children, color = "#06b6d4", delay = 0 }) {
  return (
    <motion.div
      className="glass holo-scan rounded-2xl p-5 h-full"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}1f`, border: `1px solid ${color}55` }}
      >
        <Icon size={19} style={{ color, filter: `drop-shadow(0 0 6px ${color})` }} aria-hidden />
      </div>
      <h3 className="font-display font-bold text-sm tracking-wide text-slate-100">{title}</h3>
      <p className="text-slate-400 text-sm mt-2 leading-relaxed">{children}</p>
    </motion.div>
  );
}

/* ---------- 1. hero ---------- */

function Hero({ onEnterDemo, onSignIn, reduced }) {
  return (
    <header className="relative min-h-[92vh] flex flex-col items-center justify-center px-5 text-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,27,75,0.55)_0%,rgba(3,6,16,0.96)_60%,#02030a_100%)]" />
      {!reduced && (
        <>
          <ParticleBackground />
          <EnergyOverlay intensity={0.4} />
        </>
      )}

      <motion.p
        className="relative font-display text-[10px] sm:text-xs font-bold tracking-[0.4em] text-violet-300/90"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        THE SYSTEM HAS SELECTED YOU
      </motion.p>

      <motion.h1
        className="relative font-display font-black text-4xl sm:text-7xl leading-[1.05] mt-6 text-slate-50"
        initial={{ opacity: 0, scale: reduced ? 1 : 1.15, filter: reduced ? "none" : "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ textShadow: "0 0 60px rgba(124,58,237,0.55)" }}
      >
        BECOME STRONGER
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-300 to-violet-400">
          THROUGH DISCIPLINE
        </span>
      </motion.h1>

      <motion.p
        className="relative text-slate-300 text-base sm:text-xl mt-7 max-w-2xl leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        Your real life is the dungeon. Your habits are the grind.
        <span className="block text-slate-400 text-sm sm:text-lg mt-2">
          Turn everyday tasks into missions, earn XP for finishing them, and climb from
          E-Rank to National-Level — one honest day at a time.
        </span>
      </motion.p>

      <motion.div
        className="relative flex flex-col sm:flex-row items-center gap-3 mt-10 w-full sm:w-auto"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.75 }}
      >
        <motion.button
          onClick={onEnterDemo}
          className="w-full sm:w-auto group flex items-center justify-center gap-2.5 font-display font-black text-sm tracking-[0.15em]
                     text-slate-950 bg-gradient-to-r from-cyan-300 to-violet-300 rounded-xl px-8 py-4
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          whileHover={reduced ? undefined : { scale: 1.03 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          animate={
            reduced
              ? undefined
              : {
                  boxShadow: [
                    "0 0 22px rgba(6,182,212,0.35)",
                    "0 0 44px rgba(124,58,237,0.5)",
                    "0 0 22px rgba(6,182,212,0.35)",
                  ],
                }
          }
          transition={{ boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
        >
          <Eye size={17} aria-hidden />
          ENTER THE DEMO
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
        </motion.button>

        <button
          onClick={onSignIn}
          className="w-full sm:w-auto font-display font-bold text-sm tracking-[0.15em] text-slate-200
                     border border-white/15 hover:border-cyan-300/50 hover:text-white bg-white/5 rounded-xl px-8 py-4
                     transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          START MY CLIMB
        </button>
      </motion.div>

      <motion.p
        className="relative text-[11px] text-slate-500 mt-5 tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        No sign-up needed to look around. The demo is a real hunter&apos;s record.
      </motion.p>

      {!reduced && (
        <motion.div
          className="absolute bottom-7 text-slate-600"
          animate={{ y: [0, 9, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <ChevronDown size={22} />
        </motion.div>
      )}
    </header>
  );
}

/* ---------- 2 + 3. problem → solution ---------- */

function ProblemSolution() {
  return (
    <Section
      id="why"
      eyebrow="THE REAL PROBLEM"
      title="You already know what to do."
      lead="That was never the hard part. Every to-do app on earth helps you write the list — and
            none of them help you feel like doing it. Organisation is not the bottleneck. Motivation is."
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <motion.div
          className="glass rounded-2xl p-6 border border-slate-500/20"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-display text-[10px] font-bold tracking-[0.3em] text-slate-500">
            A TASK MANAGER REWARDS
          </p>
          <p className="font-display font-black text-2xl text-slate-400 mt-3">Organisation</p>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            A tidy list. A satisfying tick. Then the same blank page tomorrow, and no sense
            whatsoever that yesterday counted for anything.
          </p>
        </motion.div>

        <motion.div
          className="glass holo-scan neon-border rounded-2xl p-6"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="font-display text-[10px] font-bold tracking-[0.3em] text-cyan-300">
            DISCIPLINE QUEST REWARDS
          </p>
          <p className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300 mt-3">
            Discipline
          </p>
          <p className="text-slate-300 text-sm mt-3 leading-relaxed">
            Every mission you clear is XP. Every consistent day is power. Yesterday is
            permanently on your record, and today you are measurably stronger than you were.
          </p>
        </motion.div>
      </div>
    </Section>
  );
}

/* ---------- 4. how it works ---------- */

const STEPS = [
  { icon: Swords, color: "#06b6d4", title: "Turn tasks into missions", body: "Give it a difficulty, a category and an XP value. A chore becomes a gate worth clearing." },
  { icon: Target, color: "#7c3aed", title: "Pick four for today", body: "The daily quest is deliberately small. Four honest missions, chosen by you, is a day that counts." },
  { icon: Zap, color: "#f59e0b", title: "Clear them and feel it", body: "XP bursts, the level curve moves, the world reacts. The feedback is the point." },
  { icon: Flame, color: "#10b981", title: "Come back tomorrow", body: "Consistency compounds into streaks, ranks and titles. Discipline is the progression system." },
];

function HowItWorks() {
  return (
    <Section
      id="how"
      eyebrow="HOW IT WORKS"
      title="Four steps. That's the whole loop."
      lead="No methodology to learn, no inbox to process, no system to maintain. Just the loop that
            makes showing up feel worth it."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STEPS.map((s, i) => (
          <div key={s.title} className="relative">
            <span
              className="absolute -top-3 -left-1 font-display font-black text-5xl text-white/[0.06] select-none"
              aria-hidden
            >
              {i + 1}
            </span>
            <Card icon={s.icon} title={s.title} color={s.color} delay={i * 0.08}>
              {s.body}
            </Card>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- 5. hunter progression ---------- */

function Progression() {
  return (
    <Section
      id="ranks"
      eyebrow="HUNTER PROGRESSION"
      title="What you become."
      lead="Rank is earned by consistency, not by volume. You cannot buy it, cram it or catch up on it
            — you can only keep showing up."
    >
      <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {HUNTER_RANKS.map((r, i) => (
          <motion.div
            key={r.key}
            className="glass rounded-2xl p-5 text-center relative overflow-hidden"
            style={{ border: `1px solid ${r.color}44` }}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="absolute inset-x-0 top-0 h-24 opacity-40"
              style={{ background: `radial-gradient(ellipse at top, ${r.aura}, transparent 70%)` }}
              aria-hidden
            />
            <p
              className="relative font-display font-black text-3xl"
              style={{ color: r.color, textShadow: `0 0 22px ${r.color}` }}
            >
              {r.key === "NATIONAL" ? "★" : r.key}
            </p>
            <p className="relative font-display font-bold text-[11px] tracking-[0.18em] text-slate-200 mt-2">
              {r.title.replace(" HUNTER", "")}
            </p>
            <p className="relative text-[11px] text-slate-500 mt-2">
              {r.streak === 0 ? "from day one" : `${r.streak}-day streak`}
            </p>
            <p className="relative text-[11px] text-slate-400 mt-3 leading-relaxed">{r.blurb}</p>
          </motion.div>
        ))}
      </div>

      {/* the philosophy, stated where a sceptic will actually read it */}
      <motion.div
        className="glass holo-scan rounded-2xl p-6 mt-6 border border-violet-400/25"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
          <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-400/40 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-violet-300" aria-hidden />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm tracking-wide text-slate-100">
              Miss a day? You don&apos;t lose your climb.
            </h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Every {SHIELD_EVERY} consistent days forge a <strong className="text-sky-300">Streak Shield</strong>{" "}
              (up to {SHIELD_MAX}). Miss a day and a shield absorbs it. Out of shields? Your streak is
              <em className="text-violet-300 not-italic"> held for one more day</em> — clear tomorrow&apos;s quest
              and you take the whole thing back, plus a comeback bonus.
            </p>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              There is no failure screen. XP, levels and titles you have earned can never be taken away.
              This app rewards consistency, not perfection.
            </p>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ---------- 6. features ---------- */

const FEATURES = [
  { icon: Swords, color: "#06b6d4", title: "Mission board", body: "Difficulty tiers, priorities, categories, drag-and-drop order, recurring series and deadline reminders." },
  { icon: Target, color: "#7c3aed", title: "Daily quest", body: "Four required missions a day. Clear them all to extend your streak and forge Resolve." },
  { icon: Flame, color: "#f59e0b", title: "Habit tracker", body: "Cadence-aware streaks, consistency percentages and a back-fillable month calendar." },
  { icon: BarChart3, color: "#10b981", title: "Hunter analytics", body: "Completion rate, XP curves, category splits and a four-month activity heatmap." },
  { icon: CalendarDays, color: "#3b82f6", title: "Campaign calendar", body: "Month and week views, drag missions between days, multi-day spans and priority colours." },
  { icon: Trophy, color: "#a78bfa", title: "Titles & ranks", body: "Achievements swept automatically as you play, each with its own unlock cinematic." },
];

function Features() {
  return (
    <Section
      id="features"
      eyebrow="WHAT'S INSIDE"
      title="Everything a serious climb needs."
      lead="Built as a real application, not a prototype — offline-capable, installable, and synced to
            your account across devices."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <Card key={f.title} icon={f.icon} title={f.title} color={f.color} delay={i * 0.06}>
            {f.body}
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ---------- 7. screenshots ---------- */

const SHOTS = [
  { src: "/screens/dashboard.png", label: "Dashboard — rank, streak, daily quest" },
  { src: "/screens/missions.png", label: "Mission board — filters and recurrence" },
  { src: "/screens/analytics.png", label: "Analytics — XP curve and heatmap" },
  { src: "/screens/achievements.png", label: "Titles — every rank you've earned" },
];

function Screenshots({ onEnterDemo }) {
  // Captures that 404 are swapped for a label instead of a blank frame.
  const [missing, setMissing] = useState(() => new Set());

  return (
    <Section
      id="screens"
      eyebrow="SEE IT"
      title="The world you'll be climbing."
      lead="Screens speak louder than a feature list — but the demo speaks louder than screens."
    >
      <div className="grid sm:grid-cols-2 gap-5">
        {SHOTS.map((s, i) => (
          <motion.figure
            key={s.src}
            className="glass rounded-2xl overflow-hidden border border-white/10"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: i * 0.07 }}
          >
            {/* The captures are optional. Until they exist the frame states
                so plainly, rather than showing a blank box or a broken icon. */}
            <div className="aspect-[16/10] bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
              {missing.has(s.src) ? (
                <span className="font-display text-[10px] tracking-[0.3em] text-slate-600">
                  CAPTURE PENDING
                </span>
              ) : (
                <img
                  src={s.src}
                  alt={s.label}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={() => setMissing((prev) => new Set(prev).add(s.src))}
                />
              )}
            </div>
            <figcaption className="px-4 py-3 text-[11px] tracking-wider text-slate-400 font-semibold">
              {s.label}
            </figcaption>
          </motion.figure>
        ))}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={onEnterDemo}
          className="font-display font-bold text-xs tracking-[0.2em] text-cyan-300 border border-cyan-300/40
                     hover:bg-cyan-300/10 rounded-xl px-6 py-3 transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          OR JUST WALK AROUND INSIDE IT →
        </button>
      </div>
    </Section>
  );
}

/* ---------- 8. testimonials (placeholder) ---------- */

const VOICES = [
  { quote: "I stopped negotiating with myself at 6am. The streak was worth more than the extra hour.", who: "Placeholder", role: "Early hunter" },
  { quote: "First habit app where missing a day didn't make me delete the app in shame.", who: "Placeholder", role: "Early hunter" },
  { quote: "Watching the rank badge change after 21 days did more than any productivity book.", who: "Placeholder", role: "Early hunter" },
];

function Testimonials() {
  return (
    <Section
      id="voices"
      eyebrow="FROM THE GUILD"
      title="What hunters say."
      lead="Placeholder voices — real ones land here as the guild grows."
    >
      <div className="grid sm:grid-cols-3 gap-5">
        {VOICES.map((v, i) => (
          <motion.blockquote
            key={v.quote}
            className="glass rounded-2xl p-5 h-full flex flex-col"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Sparkles size={16} className="text-violet-300/70 mb-3" aria-hidden />
            <p className="text-slate-300 text-sm leading-relaxed flex-1">“{v.quote}”</p>
            <footer className="mt-4 pt-3 border-t border-white/10">
              <p className="font-display text-[11px] font-bold tracking-wider text-slate-300">{v.who}</p>
              <p className="text-[10px] tracking-wider text-slate-500 mt-0.5">{v.role}</p>
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </Section>
  );
}

/* ---------- 9. roadmap ---------- */

const ROADMAP = [
  { state: "done", label: "Shipped", items: ["Missions, daily quest, ranks & XP", "Habits, analytics, calendar", "The Resolve system", "Offline PWA + cloud sync"] },
  { state: "now", label: "In progress", items: ["Guided first-run awakening", "Weekly hunter report", "Demo mode for visitors"] },
  { state: "next", label: "On the horizon", items: ["Guild boards — climb alongside friends", "Seasonal gates & limited titles", "Native mobile shell"] },
];

const ROADMAP_COLOR = { done: "#10b981", now: "#06b6d4", next: "#a78bfa" };

function Roadmap() {
  return (
    <Section id="roadmap" eyebrow="THE ROAD AHEAD" title="Where this is going." >
      <div className="grid sm:grid-cols-3 gap-5">
        {ROADMAP.map((col, i) => {
          const color = ROADMAP_COLOR[col.state];
          return (
            <motion.div
              key={col.state}
              className="glass rounded-2xl p-5"
              style={{ border: `1px solid ${color}33` }}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <p
                className="font-display text-[10px] font-bold tracking-[0.3em]"
                style={{ color }}
              >
                {col.label.toUpperCase()}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((it) => (
                  <li key={it} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                      aria-hidden
                    />
                    {it}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------- 10. call to action ---------- */

function CallToAction({ onEnterDemo, onSignIn, reduced }) {
  return (
    <section className="relative px-5 py-24 sm:py-32 text-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(76,29,149,0.4)_0%,transparent_65%)]" aria-hidden />
      {!reduced && <EnergyOverlay intensity={0.35} />}

      <motion.div
        className="relative mx-auto max-w-3xl"
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Hourglass size={30} className="mx-auto text-violet-300 mb-6" aria-hidden />
        <h2
          className="font-display font-black text-3xl sm:text-5xl text-slate-50 leading-tight"
          style={{ textShadow: "0 0 50px rgba(124,58,237,0.5)" }}
        >
          The gate is open.
        </h2>
        <p className="text-slate-300 text-base sm:text-lg mt-5 leading-relaxed">
          Day one is the only one you have to decide about. Everything after that is just
          showing up — and the system will remember every time you did.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto font-display font-black text-sm tracking-[0.15em] text-slate-950
                       bg-gradient-to-r from-cyan-300 to-violet-300 rounded-xl px-8 py-4
                       hover:brightness-110 transition-[filter]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            BEGIN MY AWAKENING
          </button>
          <button
            onClick={onEnterDemo}
            className="w-full sm:w-auto font-display font-bold text-sm tracking-[0.15em] text-slate-200
                       border border-white/15 hover:border-cyan-300/50 bg-white/5 rounded-xl px-8 py-4
                       transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            LOOK AROUND FIRST
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-6 tracking-wider flex items-center justify-center gap-2">
          <Repeat size={12} aria-hidden /> Free · installable · your data stays yours
        </p>
      </motion.div>
    </section>
  );
}

/* ---------- page ---------- */

export default function Landing({ onEnterDemo }) {
  const reduced = useReducedMotion();
  // The login modal already lives in the AuthGate provider above this page,
  // so every "start my climb" affordance reuses it rather than routing away.
  const { openLogin } = useAuthGate();
  const onSignIn = openLogin;

  return (
    <div className="min-h-full bg-[#02030a] text-slate-200">
      <a
        href="#why"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50
                   focus:bg-cyan-300 focus:text-slate-950 focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
      >
        Skip to content
      </a>

      <Hero onEnterDemo={onEnterDemo} onSignIn={onSignIn} reduced={reduced} />
      <ProblemSolution />
      <HowItWorks />
      <Progression />
      <Features />
      <Screenshots onEnterDemo={onEnterDemo} />
      <Testimonials />
      <Roadmap />
      <CallToAction onEnterDemo={onEnterDemo} onSignIn={onSignIn} reduced={reduced} />

      <footer className="px-5 py-10 text-center border-t border-white/5">
        <p className="font-display text-[10px] tracking-[0.3em] text-slate-600">
          DISCIPLINE QUEST — ARISE
        </p>
      </footer>
    </div>
  );
}
