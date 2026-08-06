import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import Background from "./components/Background";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import AddMissionModal from "./components/AddMissionModal";
import {
  LevelUpOverlay,
  PromotionOverlay,
  MissionFailedOverlay,
  NewDayBanner,
  ToastStack,
  useToastAutoDismiss,
} from "./components/Cinematics";
import { XPAnimation } from "./components/CinematicLayers";
import { useAuthGate } from "./components/auth/AuthGate";
import Dashboard from "./pages/Dashboard";
import Missions from "./pages/Missions";
import Calendar from "./pages/Calendar";
import Achievements from "./pages/Achievements";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import { pathForView } from "./routes";
import { useGameState } from "./hooks/useGameState";
import { useReminders } from "./hooks/useReminders";
import { useMissionFilters } from "./hooks/useMissionFilters";
import { applyFilters } from "./utils/filters";
import { writeSave } from "./services/saveService";

const pageVariants = {
  initial: { opacity: 0, y: 26, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -18, filter: "blur(6px)", transition: { duration: 0.25, ease: "easeIn" } },
};

export default function App({ user, initialSave, onSignOut }) {
  const { requireAuth, pendingIntent, consumeIntent } = useAuthGate();

  const persist = useCallback(
    (state) => {
      if (!user) return; // guests explore in-memory only; nothing is written
      writeSave(user.uid, state).catch((err) =>
        console.error("Cloud save failed:", err)
      );
    },
    [user]
  );

  const {
    state,
    actions,
    levelInfo,
    rank,
    rankIndex,
    dailyMissions,
    dailyDone,
    stats,
    weeklySeries,
    defaultMissionXP,
  } = useGameState(initialSave, persist);

  const location = useLocation();
  const navigate = useNavigate();
  /** Legacy call sites still say setView("achievements"); route them. */
  const setView = useCallback((view) => navigate(pathForView(view)), [navigate]);

  const [modalOpen, setModalOpen] = useState(false);
  const [templateSeed, setTemplateSeed] = useState(null);
  const [dimmed, setDimmed] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [xpBurst, setXpBurst] = useState(null);
  const [xpPulse, setXpPulse] = useState(0);
  const [missionPulse, setMissionPulse] = useState(0);
  const [levelPulse, setLevelPulse] = useState(0);
  const [promotionPulse, setPromotionPulse] = useState(0);
  const previousXP = useRef(state.totalXP);
  const previousHistoryId = useRef(state.history[0]?.id ?? null);
  const previousLevelUp = useRef(state.fx.levelUp);
  const previousPromotion = useRef(state.fx.promotion);

  useToastAutoDismiss(state.fx.toasts, actions.dismissToast);

  // Deadline reminders. Guests get none — nothing they do is persisted, so a
  // notification would outlive the state that produced it.
  useReminders(user ? state.missions : [], state.settings, actions.updateMission);

  // The cinematic intro now lives at the app root (WelcomeIntro, once per
  // session). Settle FX baselines shortly after mount so loading a save
  // doesn't fire an XP burst / level-up on the first render.
  useEffect(() => {
    const t = window.setTimeout(() => setIntroDone(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!introDone) {
      previousXP.current = state.totalXP;
      return undefined;
    }
    const before = previousXP.current;
    if (state.totalXP > before) {
      setXpBurst({ id: `${before}-${state.totalXP}-${Date.now()}`, amount: state.totalXP - before });
      setXpPulse((value) => value + 1);
    }
    previousXP.current = state.totalXP;
    return undefined;
  }, [introDone, state.totalXP]);

  useEffect(() => {
    if (!xpBurst) return undefined;
    const timer = window.setTimeout(() => setXpBurst(null), 1600);
    return () => window.clearTimeout(timer);
  }, [xpBurst]);

  useEffect(() => {
    if (!introDone) {
      previousHistoryId.current = state.history[0]?.id ?? null;
      return undefined;
    }

    const latestHistoryId = state.history[0]?.id ?? null;
    if (latestHistoryId && latestHistoryId !== previousHistoryId.current) {
      setMissionPulse((value) => value + 1);
    }
    previousHistoryId.current = latestHistoryId;
    return undefined;
  }, [introDone, state.history]);

  useEffect(() => {
    if (!introDone) {
      previousLevelUp.current = state.fx.levelUp;
      return undefined;
    }
    if (state.fx.levelUp && state.fx.levelUp !== previousLevelUp.current) {
      setLevelPulse((value) => value + 1);
    }
    if (!state.fx.levelUp) previousLevelUp.current = null;
    else previousLevelUp.current = state.fx.levelUp;
    return undefined;
  }, [introDone, state.fx.levelUp]);

  useEffect(() => {
    if (!introDone) {
      previousPromotion.current = state.fx.promotion;
      return undefined;
    }
    if (state.fx.promotion && state.fx.promotion !== previousPromotion.current) {
      setPromotionPulse((value) => value + 1);
    }
    if (!state.fx.promotion) previousPromotion.current = null;
    else previousPromotion.current = state.fx.promotion;
    return undefined;
  }, [introDone, state.fx.promotion]);

  // The board is always presented in the hunter's manual order; search only
  // narrows it, never re-sorts it.
  const ordered = useMemo(
    () => [...state.missions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [state.missions]
  );

  // One filter store, two consumers: the mission board applies every facet,
  // while the dashboard and calendar only honour the shared search term so a
  // "completed only" filter can't hollow out today's gates.
  const { filters, filtered, activeCount, patch, toggle, reset } = useMissionFilters(ordered, {
    dailySelected: state.dailySelected,
  });

  const searchFiltered = useMemo(
    () => applyFilters(ordered, { search: filters.search }),
    [ordered, filters.search]
  );

  const filterProps = { filters, activeCount, patch, toggle, reset };

  // Protected actions: run for signed-in hunters, prompt login for guests.
  // "create-mission" intent lets a guest resume the New Mission form after login.
  const openAdd = (seed = null) =>
    requireAuth(() => {
      setTemplateSeed(seed);
      setModalOpen(true);
    }, "create-mission");
  const closeAdd = () => {
    setModalOpen(false);
    setTemplateSeed(null);
  };

  // Resume a pending action carried across the guest -> authed remount.
  useEffect(() => {
    if (user && pendingIntent === "create-mission") {
      setModalOpen(true);
      consumeIntent();
    }
  }, [user, pendingIntent, consumeIntent]);

  const viewProps = {
    missions: searchFiltered,
    history: state.history,
    stats,
    levelInfo,
    rank,
    rankIdx: rankIndex,
    streak: state.streak,
    longestStreak: state.longestStreak,
    dailyMissions,
    dailyDone,
    dayComplete: state.dayComplete,
    dailySelected: state.dailySelected,
    totalXP: state.totalXP,
    weeklySeries,
    achievements: state.achievements,
    isGuest: !user,
    onComplete: (id) => requireAuth(() => actions.completeMission(id)),
    onDelete: (id) => requireAuth(() => actions.deleteMission(id)),
    onToggleDaily: (id) => requireAuth(() => actions.toggleDaily(id)),
    onSkipOccurrence: (id) => requireAuth(() => actions.skipOccurrence(id)),
    onReorder: (orderedIds) => requireAuth(() => actions.reorderMissions(orderedIds)),
    onToggleRecurrencePaused: (id, paused) =>
      requireAuth(() => actions.setRecurrencePaused(id, paused)),
    onOpenAdd: () => openAdd(),
    onUseTemplate: (preset) => openAdd(preset),
    setView,
  };

  return (
    <div
      data-rank={rank.key}
      className="min-h-full transition-[filter] duration-700"
      style={{ filter: dimmed ? "brightness(0.72) saturate(0.85)" : "none" }}
    >
      <Background
        rank={rank}
        missionPulse={missionPulse}
        xpPulse={xpPulse}
        levelPulse={levelPulse}
        promotionPulse={promotionPulse}
      />
      <div className="rank-aura" aria-hidden />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2
          focus:rounded-xl focus:bg-violet-600 focus:text-white focus:text-xs focus:font-bold focus:tracking-widest"
      >
        SKIP TO CONTENT
      </a>
      <Sidebar />

      <div className="lg:pl-[92px] xl:pl-60 pb-24 lg:pb-8 min-h-screen flex flex-col">
        <TopBar
          user={user}
          levelInfo={levelInfo}
          rank={rank}
          streak={state.streak}
          search={filters.search}
          setSearch={(value) => patch({ search: value })}
          dimmed={dimmed}
          setDimmed={setDimmed}
        />
        <main id="main-content" className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl w-full mx-auto">
          {/* Keyed on pathname so the page transition still plays on navigation,
              including browser back/forward. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Routes location={location}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard {...viewProps} />} />
                <Route
                  path="/tasks"
                  element={
                    <Missions
                      {...viewProps}
                      missions={filtered}
                      totalMissions={state.missions.length}
                      filterProps={filterProps}
                    />
                  }
                />
                <Route path="/calendar" element={<Calendar missions={searchFiltered} />} />
                <Route
                  path="/analytics"
                  element={
                    <Analytics
                      missions={state.missions}
                      history={state.history}
                      streak={state.streak}
                      longestStreak={state.longestStreak}
                      totalXP={state.totalXP}
                    />
                  }
                />
                <Route
                  path="/achievements"
                  element={<Achievements achievements={state.achievements} />}
                />
                <Route
                  path="/settings"
                  element={
                    <Settings
                      dimmed={dimmed}
                      setDimmed={setDimmed}
                      user={user}
                      onSignOut={onSignOut}
                      sim={{
                        nextDay: () => requireAuth(actions.simNextDay),
                        addStreak: (days) => requireAuth(() => actions.simAddStreak(days)),
                        addXP: (xp) => requireAuth(() => actions.simAddXP(xp)),
                        reset: () => requireAuth(actions.resetSave),
                      }}
                    />
                  }
                />
                {/* Unknown URL -> the command center, never a blank screen. */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* floating add button */}
      <motion.button
        onClick={() => openAdd()}
        aria-label="Add mission"
        className="fixed bottom-20 lg:bottom-8 right-5 z-40 p-4 rounded-2xl text-white
          bg-gradient-to-br from-violet-600 to-cyan-500
          shadow-[0_0_28px_rgba(124,58,237,0.6)] hover:shadow-[0_0_44px_rgba(6,182,212,0.7)] transition-shadow"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.08, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus size={22} />
      </motion.button>

      <AddMissionModal
        open={modalOpen}
        onClose={closeAdd}
        initial={templateSeed}
        onAdd={actions.addMission}
        defaultXP={defaultMissionXP}
        defaults={state.settings.defaults}
      />

      <XPAnimation amount={xpBurst?.amount ?? 0} active={Boolean(xpBurst)} />

      {/* ---------- cinematics & notifications ---------- */}
      <AnimatePresence>
        {state.fx.failed && <MissionFailedOverlay key="failed" onClose={() => actions.dismissFx("failed")} />}
        {!state.fx.failed && state.fx.promotion && (
          <PromotionOverlay
            key="promo"
            rankKey={state.fx.promotion}
            onClose={() => actions.dismissFx("promotion")}
          />
        )}
        {!state.fx.failed && !state.fx.promotion && state.fx.levelUp && (
          <LevelUpOverlay key="lvl" level={state.fx.levelUp} onClose={() => actions.dismissFx("levelUp")} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.fx.newDay && !state.fx.failed && (
          <NewDayBanner key="newday" onClose={() => actions.dismissFx("newDay")} />
        )}
      </AnimatePresence>

      <ToastStack toasts={state.fx.toasts} onDismiss={actions.dismissToast} />
    </div>
  );
}
