import React from 'react';
import { useSwarm } from '../context/SwarmContext';
import {
  AlertTriangle,
  ShieldCheck,
  Zap,
  Clock,
  Compass,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';

export const IncidentsView: React.FC = () => {
  const { state, triggerChaos } = useSwarm();

  const conflicts = state?.conflicts || [];
  const drones = state?.drones || [];
  const analytics = state?.analytics;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="hud-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Incidents & 3D Collision Deconfliction Tracker</span>
          </h1>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Real-time tracking of near-miss proximity alerts, autonomous altitude/waypoint resolutions, and safety blackbox logs.
          </p>
        </div>

        <button
          onClick={() => triggerChaos('COLLISION_RISK', { droneAId: 'drone-01', droneBId: 'drone-04' })}
          className="px-3 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 font-bold flex items-center space-x-2 transition-colors shrink-0"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Simulate Proximity Conflict</span>
        </button>
      </div>

      {/* Safety Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="hud-panel p-3.5 border-emerald-500/30">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Collision Incidents Avoided</span>
          <div className="text-2xl font-extrabold text-emerald-300 my-1">
            {analytics?.collisionRisksAvoidedCount || 0}
          </div>
          <span className="text-[10px] text-slate-400">100% Deconfliction Success</span>
        </div>

        <div className="hud-panel p-3.5 border-cyan-500/30">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Safety Envelope Radius</span>
          <div className="text-2xl font-extrabold text-cyan-300 my-1">25.0 m</div>
          <span className="text-[10px] text-slate-400">Vertical Separation: 15.0 m</span>
        </div>

        <div className="hud-panel p-3.5 border-purple-500/30">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Predictive Time Horizon</span>
          <div className="text-2xl font-extrabold text-purple-300 my-1">8.5 s</div>
          <span className="text-[10px] text-slate-400">Closing Velocity Intercept</span>
        </div>
      </div>

      {/* Conflicts & Incidents History */}
      <div className="hud-panel p-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-200 uppercase border-b border-slate-800 pb-2 flex items-center justify-between">
          <span>Safety Deconfliction Audit Log ({conflicts.length} Recorded)</span>
          <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PREDICTIVE SAFETY FILTER ACTIVE</span>
          </span>
        </h2>

        {conflicts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500/50 mx-auto" />
            <div>No active collision conflicts recorded in current flight envelope.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {conflicts.map((c) => {
              const droneA = drones.find((d) => d.id === c.droneAId);
              const droneB = drones.find((d) => d.id === c.droneBId);

              return (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                          c.riskLevel === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {c.riskLevel} CONFLICT
                      </span>
                      <span className="font-bold text-slate-200">
                        {droneA?.callsign || c.droneAId} ↔ {droneB?.callsign || c.droneBId}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {new Date(c.timestamp).toTimeString().split(' ')[0]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-900/60 p-2 rounded border border-slate-800/80">
                    <div>SEPARATION: <strong className="text-rose-400">{c.distanceMeters}m</strong></div>
                    <div>ALT DIFF: <strong className="text-slate-200">{c.altitudeDiffMeters}m</strong></div>
                    <div>CLOSING SPEED: <strong className="text-slate-200">{c.relativeVelocity} m/s</strong></div>
                    <div>TIME-TO-IMPACT: <strong className="text-amber-400">{c.estimatedTimeToConflictSeconds}s</strong></div>
                  </div>

                  <div className="p-2 rounded bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200 space-y-0.5">
                    <div className="font-bold text-cyan-300 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>AUTONOMOUS RESOLUTION: {c.resolutionStrategy}</span>
                    </div>
                    <div>{c.resolutionDetails}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
