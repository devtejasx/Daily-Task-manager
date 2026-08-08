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
  ShieldHeldOverlay,
  StreakPreservedOverlay,
  StreakRecoveredOverlay,
  NewClimbOverlay,
  NewDayBanner,
  ToastStack,
  useToastAutoDismiss,
} from "./components/Cinematics";
import { XPAnimation } from "./components/CinematicLayers";
import { useAuthGate } from "./components/auth/AuthGate";
import LiveAnnouncer from "./components/ui/LiveAnnouncer";
import DemoBanner from "./components/ui/DemoBanner";
import DailyBriefing from "./components/cinematic/DailyBriefing";
import WeeklyReport from "./components/cinematic/WeeklyReport";
import AppRoutes from "./AppRoutes";
import { pathForView, resolvePath, FALLBACK_PATH, KNOWN_PATHS } from "./routes";
import { useGameState } from "./hooks/useGameState";
import { useGameFx } from "./hooks/useGameFx";
import { useReminders } from "./hooks/useReminders";
import { useMissionFilters } from "./hooks/useMissionFilters";
import { applyFilters } from "./utils/filters";
import { weeklyReport } from "./utils/analytics";
import { addDaysISO } from "./game/constants";
import { useCloudSave } from "./hooks/useCloudSave";
import { useProtectedActions } from "./hooks/useProtectedActions";

const pageVariants = {
  initial: { opacity: 0, y: 26, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -18, filter: "blur(6px)", transition: { duration: 0.25, ease: "easeIn" } },
};

export default function App({ user, initialSave, onSignOut, demo = false, onExitDemo }) {
  const { requireAuth, openLogin, pendingIntent, consumeIntent } = useAuthGate();

  // Demo mode hands the visitor a veteran hunter's save and lets every action
  // actually run — the point of the showcase is to feel the XP land, not to
  // hit a login wall. Nothing persists: `persist` below no-ops without a user.
  const runUngated = useCallback((action) => {
    action?.();
    return true;
  }, []);
  const gate = demo ? runUngated : requireAuth;

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

  // An unknown URL (or "/") renders the dashboard straight away, and the
  // address bar is corrected separately. Doing it this way — rather than
  // leaving it to a redirecting <Route> — keeps the page-transition key
  // stable through the redirect; otherwise AnimatePresence mode="wait" is
  // left holding an exiting child and the screen stays blank.
  const routedPath = resolvePath(location.pathname);
  const routedLocation = useMemo(
    () => (routedPath === location.pathname ? location : { ...location, pathname: routedPath }),
    [location, routedPath]
  );

  useEffect(() => {
    if (!KNOWN_PATHS.has(location.pathname)) navigate(FALLBACK_PATH, { replace: true });
  }, [location.pathname, navigate]);

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

  // The daily briefing: once per day, for a hunter who has been here before.
  // A brand-new hunter has just seen the awakening and has nothing to be
  // briefed on, and the demo isn't anyone's day — both are skipped.
  const hasHistory = state.history.length > 0 || state.streak > 0;
  const briefingKey = user ? `arise-briefed-${user.uid}` : null;
  const [briefingSeen, setBriefingSeen] = useState(() => {
    if (!briefingKey) return true;
    return localStorage.getItem(briefingKey) === state.dailyDate;
  });
  const showBriefing = Boolean(user) && !demo && hasHistory && !briefingSeen;

  // The weekly report arrives on its own, once every seven days. It waits for
  // the briefing to clear so a returning hunter is never handed two modals.
  const reportKey = user ? `arise-report-${user.uid}` : null;
  const [reportShownOn, setReportShownOn] = useState(() =>
    reportKey ? localStorage.getItem(reportKey) : null
  );
  const reportDue = useMemo(() => {
    if (!user || demo || !hasHistory) return false;
    if (!reportShownOn) return true; // first eligible week
    return state.dailyDate >= addDaysISO(reportShownOn, 7);
  }, [user, demo, hasHistory, reportShownOn, state.dailyDate]);
  const report = useMemo(
    () => (reportDue ? weeklyReport(state.history, state.dailyDate) : null),
    [reportDue, state.history, state.dailyDate]
  );
  const dismissReport = useCallback(() => {
    if (reportKey) localStorage.setItem(reportKey, state.dailyDate);
    setReportShownOn(state.dailyDate);
  }, [reportKey, state.dailyDate]);
  const dismissBriefing = useCallback(() => {
    if (briefingKey) localStorage.setItem(briefingKey, state.dailyDate);
    setBriefingSeen(true);
  }, [briefingKey, state.dailyDate]);

  // The Resolve screens, in the order a hunter needs to hear them. Only one
  // can be pending at a time, but resolving them here keeps the render tree
  // flat and makes the precedence explicit rather than emergent.
  const { shielded, preserved, recovered, reset: climbReset } = state.fx;
  const resolveFx = useMemo(() => {
    if (recovered)
      return (
        <StreakRecoveredOverlay
          key="recovered"
          streak={recovered.streak}
          onClose={() => actions.dismissFx("recovered")}
        />
      );
    if (shielded)
      return (
        <ShieldHeldOverlay
          key="shielded"
          streak={shielded.streak}
          remaining={shielded.remaining}
          onClose={() => actions.dismissFx("shielded")}
        />
      );
    if (preserved)
      return (
        <StreakPreservedOverlay
          key="preserved"
          streak={preserved.streak}
          onClose={() => actions.dismissFx("preserved")}
        />
      );
    if (climbReset)
      return (
        <NewClimbOverlay
          key="reset"
          previous={climbReset.previous}
          onClose={() => actions.dismissFx("reset")}
        />
      );
    return null;
  }, [recovered, shielded, preserved, climbReset, actions]);

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
  const guarded = useProtectedActions(actions, gate);
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
      shields: state.shields,
      recovery: state.recovery,
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
      state.shields,
      state.recovery,
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
      {demo && <DemoBanner onExit={onExitDemo} onSignUp={openLogin} />}

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
          rankIndex={rankIndex}
          streak={state.streak}
          dailyDone={dailyDone}
          recovery={state.recovery}
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
              key={routedPath}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AppRoutes
                location={routedLocation}
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

      {/* ---------- cinematics & notifications ----------
       * One screen at a time, most consequential first. A Resolve screen
       * outranks a level-up: when a hunter comes back from a missed day,
       * the thing they need to see is that their climb survived. */}
      <AnimatePresence>
        {resolveFx ? (
          resolveFx
        ) : state.fx.promotion ? (
          <PromotionOverlay
            key="promo"
            rankKey={state.fx.promotion.rankKey}
            from={state.fx.promotion.from}
            evaluation={state.fx.promotion.evaluation}
            onClose={() => actions.dismissFx("promotion")}
          />
        ) : (
          state.fx.levelUp && (
            <LevelUpOverlay
              key="lvl"
              level={state.fx.levelUp.to}
              from={state.fx.levelUp.from}
              onClose={() => actions.dismissFx("levelUp")}
            />
          )
        )}
      </AnimatePresence>

      <AnimatePresence>
        {report && !resolveFx && !showBriefing && (
          <WeeklyReport
            key="weekly"
            report={report}
            streak={state.streak}
            onClose={dismissReport}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBriefing && !resolveFx && (
          <DailyBriefing
            key="briefing"
            streak={state.streak}
            recovery={state.recovery}
            levelInfo={levelInfo}
            rankIndex={rankIndex}
            dailyDone={dailyDone}
            weeklyXP={stats.weeklyXP}
            today={state.dailyDate}
            onClose={dismissBriefing}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.fx.newDay && !resolveFx && !showBriefing && (
          <NewDayBanner key="newday" onClose={() => actions.dismissFx("newDay")} />
        )}
      </AnimatePresence>

      {/* Mirrors the silent cinematics for screen readers. */}
      <LiveAnnouncer
        totalXP={state.totalXP}
        level={levelInfo.level}
        rankTitle={rank.title}
        streak={state.streak}
        shields={state.shields}
        recovery={state.recovery}
      />

      <ToastStack toasts={state.fx.toasts} onDismiss={actions.dismissToast} />
    </div>
    </MotionConfig>
  );
}
