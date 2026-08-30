import React from 'react';
import { useSwarm } from '../context/SwarmContext';
import { TacticalRadarMap } from '../components/map/TacticalRadarMap';
import {
  Radio,
  HeartHandshake,
  Cpu,
  Activity,
  ShieldCheck,
  Zap,
  Flame,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  ScrollText,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    state,
    setSelectedDroneId,
    setActiveTab,
    triggerChaos,
    launchDemo,
  } = useSwarm();

  const mission = state?.mission;
  const drones = state?.drones || [];
  const tasks = state?.tasks || [];
  const sectors = state?.sectors || [];
  const logs = state?.decisionLogs || [];
  const analytics = state?.analytics;
  const isDemoActive = state?.simulation.isDemoActive;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs select-none">
      {/* Top Hero KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="hud-panel p-3.5 flex flex-col justify-between border-cyan-500/30">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold">Fleet Telemetry</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-cyan-300 my-1">
            {drones.filter((d) => d.status !== 'FAILED' && d.status !== 'DISCONNECTED').length} / {drones.length}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>20Hz Real-Time C2</span>
          </div>
        </div>

        <div className="hud-panel p-3.5 flex flex-col justify-between border-emerald-500/30">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold">Survivors Found</span>
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-300 my-1">
            {mission?.survivorsFound || 0}
          </div>
          <div className="text-[10px] text-slate-400">Civilians Localized</div>
        </div>

        <div className="hud-panel p-3.5 flex flex-col justify-between border-blue-500/30">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold">Search Coverage</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-blue-300 my-1">
            {mission?.coveragePercent.toFixed(1) || '0.0'}%
          </div>
          <div className="text-[10px] text-slate-400">{sectors.length} Sectors Active</div>
        </div>

        <div className="hud-panel p-3.5 flex flex-col justify-between border-amber-500/30">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold">Active Payloads</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-300 my-1">
            {tasks.filter((t) => t.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-[10px] text-slate-400">
            {tasks.filter((t) => t.status === 'COMPLETED').length} Done | {tasks.filter((t) => t.status === 'REASSIGNED').length} Reassigned
          </div>
        </div>

        <div className="hud-panel p-3.5 flex flex-col justify-between border-purple-500/30">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold">Anti-Collision</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-extrabold text-purple-300 my-1">
            {analytics?.collisionRisksAvoidedCount || 0}
          </div>
          <div className="text-[10px] text-slate-400">0 Collisions / 100% Safe</div>
        </div>

        <div className="hud-panel p-3.5 flex flex-col justify-between border-emerald-500/30">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold">Recovery Latency</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100 my-1">
            {analytics?.failedDroneRecoveryAvgTimeSeconds || 2.4}s
          </div>
          <div className="text-[10px] text-slate-400">Auto Task Salvage</div>
        </div>
      </div>

      {/* Main Split: Left Tactical Map & Right AI Decision Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Tactical Map */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="hud-panel p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">Urban Earthquake Disaster Epicenter</span>
            </div>
            <button
              onClick={() => setActiveTab('live-map')}
              className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-[11px]"
            >
              <span>Full Screen Tactical Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-[420px] w-full">
            <TacticalRadarMap onSelectDrone={(id) => setSelectedDroneId(id)} />
          </div>

          {/* Quick Chaos Testing Strip */}
          <div className="hud-panel p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-bold uppercase text-[11px]">Chaos & Stress Testing Controls</span>
              </div>
              <span className="text-[10px] text-slate-400">Test Autonomous Failure Recovery</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => triggerChaos('FAIL_DRONE', { droneId: 'drone-02', reason: 'Motor Stator Seizure' })}
                className="p-2 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-left transition-colors"
              >
                <div className="font-bold">Fail Drone 02</div>
                <div className="text-[10px] text-slate-400">Triggers task salvage</div>
              </button>
              <button
                onClick={() => triggerChaos('DISCONNECT', { droneId: 'drone-03' })}
                className="p-2 rounded bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800 text-amber-300 text-left transition-colors"
              >
                <div className="font-bold">Jam Drone 03</div>
                <div className="text-[10px] text-slate-400">Triggers relay failover</div>
              </button>
              <button
                onClick={() => triggerChaos('COLLISION_RISK', { droneAId: 'drone-01', droneBId: 'drone-04' })}
                className="p-2 rounded bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800 text-purple-300 text-left transition-colors"
              >
                <div className="font-bold">Force Collision</div>
                <div className="text-[10px] text-slate-400">3D Altitude deconflict</div>
              </button>
              <button
                onClick={() => triggerChaos('SPAWN_SURVIVOR')}
                className="p-2 rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 text-left transition-colors"
              >
                <div className="font-bold">Spawn Survivor</div>
                <div className="text-[10px] text-slate-400">High priority dispatch</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Reasoning Engine Stream & Active Fleet status */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Swarm AI Decision Log stream */}
          <div className="hud-panel p-4 flex flex-col h-[320px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <div className="flex items-center space-x-2">
                <ScrollText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">Swarm Intelligence Decision Stream</span>
              </div>
              <button
                onClick={() => setActiveTab('logs')}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center space-x-1"
              >
                <span>All Logs</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {logs.slice(0, 6).map((log) => {
                const isCrit = log.level === 'CRITICAL';
                const isWarn = log.level === 'WARN';
                const isSuccess = log.level === 'SUCCESS';

                return (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
                      isCrit
                        ? 'bg-rose-950/30 border-rose-900/60 text-rose-200'
                        : isWarn
                        ? 'bg-amber-950/30 border-amber-900/60 text-amber-200'
                        : isSuccess
                        ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-200'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate text-slate-100">{log.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(log.timestamp).toTimeString().split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-slate-300">{log.what}</div>
                    <div className="text-[10px] text-slate-400">
                      <strong className="text-slate-300">WHY:</strong> {log.why}
                    </div>
                    <div className="text-[10px] text-cyan-300/90">
                      <strong className="text-cyan-400">DECISION:</strong> {log.decision}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Fleet Quick Cards */}
          <div className="hud-panel p-4 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="font-bold text-slate-200 uppercase text-[11px]">Active Fleet Overview</span>
              <button
                onClick={() => setActiveTab('fleet')}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center space-x-1"
              >
                <span>Fleet Hub</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {drones.map((d) => {
                const isDown = d.status === 'FAILED' || d.status === 'DISCONNECTED';
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDroneId(d.id)}
                    className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 text-left transition-colors flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="font-bold text-slate-200">{d.callsign}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          isDown
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 space-y-0.5">
                      <div>Role: <span className="text-slate-200">{d.role}</span></div>
                      <div className="flex justify-between">
                        <span>Batt: {d.battery.toFixed(0)}%</span>
                        <span>Alt: {d.altitude}m</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
