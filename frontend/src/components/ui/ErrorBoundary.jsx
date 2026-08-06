import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Catches render-time crashes anywhere below it and shows a themed panel
 * with a recovery action, instead of React unmounting the tree and leaving
 * a white screen.
 *
 * Still a class component: React has no hook equivalent of
 * componentDidCatch.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep the stack in the console for debugging; the hunter sees the panel.
    console.error("Unhandled render error:", error, info?.componentStack);
    this.props.onError?.(error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-[#05070f] text-center">
        <div className="p-3 rounded-2xl border border-red-400/30 bg-red-500/10">
          <AlertTriangle size={24} className="text-red-300" aria-hidden />
        </div>
        <div>
          <h1 className="font-display font-black text-lg tracking-[0.2em] text-slate-100">
            THE SYSTEM GLITCHED
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            Something broke while rendering this screen. Your progress is saved in the cloud —
            reloading is safe.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-w-lg overflow-auto text-left text-[11px] text-red-300/80 bg-red-500/5 border border-red-400/20 rounded-xl p-3">
              {String(error?.message ?? error)}
            </pre>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-300 border border-cyan-400/30 bg-cyan-400/10 rounded-xl px-4 py-2.5
              hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-shadow
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          >
            <RotateCcw size={14} aria-hidden /> TRY AGAIN
          </button>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-bold tracking-wider text-slate-400 hover:text-slate-200 border border-white/10 rounded-xl px-4 py-2.5 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          >
            RELOAD
          </button>
        </div>
      </div>
    );
  }
}
