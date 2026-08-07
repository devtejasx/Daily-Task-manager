import { motion } from "framer-motion";
import { Sparkles, Volume2, BellRing, Eclipse, Timer, Palette } from "lucide-react";
import { THEMES } from "../../game/constants";
import SettingRow, { Toggle } from "./SettingRow";

/** Theme swatch picker — each option previews its own two-colour gradient. */
function ThemePicker({ value, onChange }) {
  return (
    <div className="p-5 border-b border-white/5">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2.5 rounded-xl border border-violet-400/30 bg-violet-500/10">
          <Palette size={19} className="text-violet-300" aria-hidden />
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-200">Interface Theme</p>
          <p className="text-xs text-slate-500">Re-tint the mana glow. The layout never changes.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Interface theme">
        {Object.entries(THEMES).map(([key, theme]) => {
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(key)}
              title={theme.desc}
              className={`rounded-xl border p-3 text-left transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                  selected
                    ? "border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_16px_rgba(6,182,212,0.25)]"
                    : "border-white/10 bg-white/[0.02] hover:border-violet-400/40"
                }`}
            >
              <span
                className="block h-6 rounded-lg mb-2"
                style={{
                  background: `linear-gradient(120deg, ${theme.swatch[0]}, ${theme.swatch[1]})`,
                  boxShadow: `0 0 12px ${theme.swatch[0]}66`,
                }}
                aria-hidden
              />
              <span
                className={`text-[11px] font-bold tracking-wider ${
                  selected ? "text-cyan-200" : "text-slate-400"
                }`}
              >
                {theme.label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Appearance + alerts. Every value here is persisted with the cloud save, so
 * preferences follow the hunter across devices.
 */
export default function PreferencesPanel({
  settings,
  onChange,
  dimmed,
  setDimmed,
  notificationPermission,
  onRequestNotifications,
}) {
  const notifications = settings.notifications;
  const denied = notificationPermission === "denied";
  const unsupported = notificationPermission === "unsupported";

  return (
    <motion.section
      className="glass neon-border rounded-2xl divide-y divide-white/5"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Preferences"
    >
      <ThemePicker value={settings.theme} onChange={(theme) => onChange({ theme })} />

      <SettingRow
        icon={Eclipse}
        title="Dimmed Ambience"
        desc="Lower the glow intensity for late-night raids."
        accent="#7c3aed"
      >
        <Toggle on={dimmed} onChange={setDimmed} label="Dimmed ambience" />
      </SettingRow>

      <SettingRow
        icon={Sparkles}
        title="Animations"
        desc="Cinematics, particle bursts and card transitions."
      >
        <Toggle
          on={settings.animations}
          onChange={(animations) => onChange({ animations })}
          label="Animations"
        />
      </SettingRow>

      <SettingRow icon={Volume2} title="System Sounds" desc="Audio cues on reminders and timers.">
        <Toggle on={settings.sound} onChange={(sound) => onChange({ sound })} label="System sounds" />
      </SettingRow>

      <SettingRow
        icon={BellRing}
        title="Browser Notifications"
        desc={
          unsupported
            ? "This browser doesn't support notifications."
            : denied
            ? "Blocked in your browser settings — re-enable it there first."
            : notificationPermission === "granted"
            ? "Permission granted. Gate alerts are live."
            : "Ask this browser for permission to send gate alerts."
        }
        accent={notificationPermission === "granted" ? "#10b981" : "#f59e0b"}
      >
        {notificationPermission === "granted" ? (
          <Toggle
            on={notifications.enabled}
            onChange={(enabled) => onChange({ notifications: { ...notifications, enabled } })}
            label="Browser notifications"
          />
        ) : (
          <button
            type="button"
            onClick={onRequestNotifications}
            disabled={denied || unsupported}
            className="text-[11px] font-bold tracking-wider text-amber-300 border border-amber-400/30 bg-amber-400/10 rounded-xl px-3 py-2
              disabled:opacity-40 disabled:cursor-not-allowed shrink-0
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          >
            ENABLE
          </button>
        )}
      </SettingRow>

      <SettingRow
        icon={BellRing}
        title="Deadline Reminders"
        desc="Notify before a mission's due moment."
        accent="#06b6d4"
      >
        <Toggle
          on={notifications.reminders}
          onChange={(reminders) => onChange({ notifications: { ...notifications, reminders } })}
          disabled={!notifications.enabled}
          label="Deadline reminders"
        />
      </SettingRow>

      <SettingRow
        icon={Timer}
        title="Pomodoro Alerts"
        desc="Notify when a focus block or break ends."
        accent="#a78bfa"
      >
        <Toggle
          on={notifications.pomodoro}
          onChange={(pomodoro) => onChange({ notifications: { ...notifications, pomodoro } })}
          disabled={!notifications.enabled}
          label="Pomodoro alerts"
        />
      </SettingRow>
    </motion.section>
  );
}
