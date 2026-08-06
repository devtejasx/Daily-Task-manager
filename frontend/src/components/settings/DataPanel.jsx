import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Upload, FileJson, FileSpreadsheet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { exportCSV, exportJSON, readBackup } from "../../services/backup";

/**
 * Export / import panel.
 *
 * Import is deliberately two-step: the file is parsed and validated first and
 * a summary is shown, so nobody replaces a year of progress by mis-clicking a
 * file picker.
 */
export default function DataPanel({ state, onImport }) {
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null); // validated backup awaiting confirmation

  const pickFile = () => fileRef.current?.click();

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-picking the same file
    if (!file) return;

    const text = await file.text();
    setPending({ ...readBackup(text), filename: file.name });
  };

  const confirmImport = () => {
    if (pending?.ok && pending.save) onImport(pending.save);
    setPending(null);
  };

  return (
    <motion.section
      className="glass neon-border rounded-2xl p-5"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="data-panel-heading"
    >
      <h2
        id="data-panel-heading"
        className="font-display font-bold text-sm tracking-[0.2em] text-slate-200 mb-1"
      >
        HUNTER ARCHIVE
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Export your record, or restore it from a previous backup.
      </p>

      <div className="grid sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => exportJSON(state)}
          className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-300 border border-cyan-400/30 bg-cyan-400/10
            rounded-xl px-3.5 py-2.5 hover:shadow-[0_0_16px_rgba(6,182,212,0.35)] transition-shadow
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
        >
          <FileJson size={14} aria-hidden /> EXPORT JSON
        </button>
        <button
          type="button"
          onClick={() => exportCSV(state)}
          className="flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-300 border border-emerald-400/30 bg-emerald-400/10
            rounded-xl px-3.5 py-2.5 hover:shadow-[0_0_16px_rgba(16,185,129,0.35)] transition-shadow
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
        >
          <FileSpreadsheet size={14} aria-hidden /> EXPORT CSV
        </button>
        <button
          type="button"
          onClick={pickFile}
          className="flex items-center gap-2 text-xs font-bold tracking-wider text-violet-300 border border-violet-400/30 bg-violet-500/10
            rounded-xl px-3.5 py-2.5 hover:shadow-[0_0_16px_rgba(124,58,237,0.35)] transition-shadow
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
        >
          <Upload size={14} aria-hidden /> IMPORT BACKUP
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFile}
        className="sr-only"
        aria-label="Choose a backup file"
      />

      <p className="text-[10px] tracking-[0.2em] text-slate-600 mt-3">
        CSV IS FOR SPREADSHEETS · ONLY JSON CAN BE IMPORTED BACK
      </p>

      {/* ---- validation summary / confirmation ---- */}
      <AnimatePresence>
        {pending && (
          <motion.div
            key="pending"
            className="mt-4 rounded-xl border p-4"
            style={{
              borderColor: pending.ok ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.35)",
              background: pending.ok ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="status"
          >
            <div className="flex items-start gap-2.5">
              {pending.ok ? (
                <CheckCircle2 size={16} className="text-emerald-300 mt-0.5 shrink-0" aria-hidden />
              ) : (
                <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-200 truncate">{pending.filename}</p>

                {pending.ok ? (
                  <p className="text-xs text-slate-400 mt-1">
                    {pending.stats.missions} missions · {pending.stats.history} cleared ·{" "}
                    {pending.stats.habits} habits ·{" "}
                    {Number(pending.stats.totalXP).toLocaleString()} XP
                    {pending.stats.exportedAt && (
                      <> · exported {new Date(pending.stats.exportedAt).toLocaleDateString()}</>
                    )}
                  </p>
                ) : (
                  <ul className="text-xs text-red-300 mt-1 space-y-0.5 list-disc list-inside">
                    {pending.errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}

                {pending.warnings.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-[11px] text-amber-300/80 cursor-pointer">
                      {pending.warnings.length} row
                      {pending.warnings.length === 1 ? "" : "s"} will be skipped
                    </summary>
                    <ul className="text-[11px] text-slate-500 mt-1 space-y-0.5 list-disc list-inside max-h-32 overflow-y-auto">
                      {pending.warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </details>
                )}

                {pending.ok && (
                  <p className="text-[11px] text-amber-300/90 mt-2">
                    This replaces your current save. Export first if you want to keep it.
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  {pending.ok && (
                    <button
                      type="button"
                      onClick={confirmImport}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-white rounded-lg px-3 py-2
                        bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_16px_rgba(124,58,237,0.45)]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                    >
                      <Download size={12} aria-hidden /> RESTORE THIS BACKUP
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPending(null)}
                    className="text-[11px] font-bold tracking-wider text-slate-400 hover:text-slate-200 border border-white/10 rounded-lg px-3 py-2 transition-colors
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
