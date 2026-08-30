import React from 'react';
import { AlertOctagon, X, Zap, RefreshCw } from 'lucide-react';
import { useSwarm } from '../../context/SwarmContext';

export const EmergencyAlertBanner: React.FC = () => {
  const { state } = useSwarm();
  const alert = state?.emergencyAlert;

  if (!alert || !alert.active) return null;

  const isCritical = alert.level === 'CRITICAL';

  return (
    <div
      className={`w-full px-4 py-2.5 flex items-center justify-between text-xs font-mono select-none z-10 transition-all border-b ${
        isCritical
          ? 'bg-gradient-to-r from-rose-950/90 via-red-900/80 to-rose-950/90 text-rose-200 border-rose-600/60 shadow-lg shadow-rose-950/50'
          : 'bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-amber-950/90 text-amber-200 border-amber-600/60'
      }`}
    >
      <div className="flex items-center space-x-3 truncate">
        <span className="flex items-center justify-center p-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
          <AlertOctagon className="w-4 h-4" />
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
          <span className="font-extrabold uppercase tracking-wider text-white">
            {alert.title}
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="text-slate-200 truncate">{alert.message}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
          <span>AUTONOMOUS RECOVERY ACTIVE</span>
        </span>
      </div>
    </div>
  );
};
