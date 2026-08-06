import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Plus } from "lucide-react";
import Background from "./components/Background";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import AddMissionModal from "./components/AddMissionModal";
import PomodoroTimer from "./components/PomodoroTimer";
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
import LiveAnnouncer from "./components/ui/LiveAnnouncer";
import AppRoutes from "./AppRoutes";
import { pathForView } from "./routes";
import { useGameState } from "./hooks/useGameState";
import { useGameFx } from "./hooks/useGameFx";
import { useReminders } from "./hooks/useReminders";
import { useMissionFilters } from "./hooks/useMissionFilters";
import { applyFilters } from "./utils/filters";
import { useCloudSave } from "./hooks/useCloudSave";
import { useProtectedActions } from "./hooks/useProtectedActions";

const pageVariants = {
  initial: { opacity: 0, y: 26, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -18, filter: "blur(6px)", transition: { duration: 0.25, ease: "easeIn" } },
};

export default function App({ user, initialSave, onSignOut }) {
  const { requireAuth, pendingIntent, consumeIntent } = useAuthGate();

  // Cloud save owns its own retry/backoff and reports failures as a toast.
  // The toast dispatcher lives in the reducer below, so it is reached through
  // a ref to break the circular dependency (save needs toasts, toasts live in
  // the state the save persists).
  const pushToastRef = useRef(null);
  const { persist: writeToCloud } = useCloudSave(user?.uid ?? null, (toast) =>
    pushToastRef.current?.(toast)
  );

  const persist = useCallback(
    (nextState) => {
      if (!user) return; // guests explore in-memory only; nothing is written
      writeToCloud(nextState);
    },
    [user, writeToCloud]
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

  pushToastRef.current = actions.pushToast;

  const location = useLocation();
  const navigate = useNavigate();
  /** Legacy call sites still say setView("achievements"); route them. */
  const setView = useCallback((view) => navigate(pathForView(view)), [navigate]);

  const [modalOpen, setModalOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [templateSeed, setTemplateSeed] = useState(null);
  // Dimmed ambience is a persisted preference now, so it survives a reload
  // and follows the hunter across devices. Supports the updater form the
  // top-bar toggle uses.
  const dimmed = state.settings.dimmed;
  const setDimmed = useCallback(
    (next) =>
      actions.updateSettings({
        dimmed: typeof next === "function" ? next(state.settings.dimmed) : next,
      }),
    [actions, state.settings.dimmed]
  );
  // One-shot cinematics derived from state transitions (XP bursts, level-up
  // and promotion pulses through the background scene).
  const { xpBurst, xpPulse, missionPulse, levelPulse, promotionPulse } = useGameFx(state);

  useToastAutoDismiss(state.fx.toasts, actions.dismissToast);

  // Deadline reminders. Guests get none — nothing they do is persisted, so a
  // notification would outlive the state that produced it.
  useReminders(user ? state.missions : [], state.settings, actions.updateMission);

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

  const filterProps = useMemo(
    () => ({ filters, activeCount, patch, toggle, reset }),
    [filters, activeCount, patch, toggle, reset]
  );

  // Protected actions: run for signed-in hunters, prompt login for guests.
  // "create-mission" intent lets a guest resume the New Mission form after login.
  // Every handler below is stable so the memoised mission cards and lists
  // don't re-render on unrelated state changes (a ticking countdown, a toast).
  const openAdd = useCallback(
    (seed = null) =>
      requireAuth(() => {
        setTemplateSeed(seed);
        setModalOpen(true);
      }, "create-mission"),
    [requireAuth]
  );
  const closeAdd = useCallback(() => {
    setModalOpen(false);
    setTemplateSeed(null);
  }, []);

  /** Every state-changing action, wrapped in the guest login gate. */
  const guarded = useProtectedActions(actions, requireAuth);
  const handleQuickAdd = useCallback((dueDate) => openAdd({ dueDate }), [openAdd]);

  // Resume a pending action carried across the guest -> authed remount.
  useEffect(() => {
    if (user && pendingIntent === "create-mission") {
      setModalOpen(true);
      consumeIntent();
    }
  }, [user, pendingIntent, consumeIntent]);

  const viewProps = useMemo(
    () => ({
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
      onComplete: guarded.complete,
      onDelete: guarded.remove,
      onToggleDaily: guarded.toggleDaily,
      onSkipOccurrence: guarded.skipOccurrence,
      onReorder: guarded.reorder,
      onToggleRecurrencePaused: guarded.setRecurrencePaused,
      onOpenAdd: openAdd,
      onUseTemplate: openAdd,
      setView,
    }),
    [
      searchFiltered,
      state.history,
      state.streak,
      state.longestStreak,
      state.dayComplete,
      state.dailySelected,
      state.totalXP,
      state.achievements,
      stats,
      levelInfo,
      rank,
      rankIndex,
      dailyMissions,
      dailyDone,
      weeklySeries,
      user,
      guarded,
      openAdd,
      setView,
    ]
  );

  /** Extra props only the mission board needs (its own filtered slice). */
  const boardProps = useMemo(
    () => ({
      missions: filtered,
      totalMissions: state.missions.length,
      filterProps,
    }),
    [filtered, state.missions.length, filterProps]
  );

  /** Per-route props for the pages that don't take the shared viewProps. */
  const pageProps = useMemo(
    () => ({
      calendar: {
        missions: searchFiltered,
        onMoveMission: guarded.moveMission,
        onQuickAdd: handleQuickAdd,
      },
      habits: {
        habits: state.habits,
        onAdd: guarded.addHabit,
        onDelete: guarded.deleteHabit,
        onToggleDay: guarded.toggleHabitDay,
      },
      analytics: {
        missions: state.missions,
        history: state.history,
        streak: state.streak,
        longestStreak: state.longestStreak,
        totalXP: state.totalXP,
      },
      achievements: { achievements: state.achievements },
      settings: {
        settings: state.settings,
        onUpdateSettings: guarded.updateSettings,
        state,
        onImport: guarded.importSave,
        levelXP: defaultMissionXP,
        dimmed,
        setDimmed,
        user,
        onSignOut,
        sim: guarded.sim,
      },
    }),
    [
      state,
      searchFiltered,
      defaultMissionXP,
      dimmed,
      setDimmed,
      user,
      onSignOut,
      guarded,
      handleQuickAdd,
    ]
  );

  return (
    /* "never" keeps every cinematic; "always" collapses framer-motion to
       instant transitions. The CSS side is handled by [data-animations]. */
    <MotionConfig reducedMotion={state.settings.animations ? "never" : "always"}>
    <div
      data-rank={rank.key}
      data-theme={state.settings.theme}
      data-animations={state.settings.animations ? "on" : "off"}
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
          onTogglePomodoro={() => setPomodoroOpen((v) => !v)}
          pomodoroOpen={pomodoroOpen}
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
              <AppRoutes
                location={location}
                viewProps={viewProps}
                boardProps={boardProps}
                pageProps={pageProps}
              />
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

      {/* Mounted at the root so the countdown survives route changes. */}
      <PomodoroTimer
        open={pomodoroOpen}
        onClose={() => setPomodoroOpen(false)}
        settings={state.settings}
        onUpdateDurations={(pomodoro) => actions.updateSettings({ pomodoro })}
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

      {/* Mirrors the silent cinematics for screen readers. */}
      <LiveAnnouncer
        totalXP={state.totalXP}
        level={levelInfo.level}
        rankTitle={rank.title}
        streak={state.streak}
      />

      <ToastStack toasts={state.fx.toasts} onDismiss={actions.dismissToast} />
    </div>
    </MotionConfig>
  );
}
