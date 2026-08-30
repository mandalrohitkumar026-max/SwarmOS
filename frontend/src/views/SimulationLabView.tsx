import React from 'react';
import { useSwarm } from '../context/SwarmContext';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  AlertTriangle,
  Radio,
  Flame,
  ShieldAlert,
  BatteryCharging,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const SimulationLabView: React.FC = () => {
  const {
    state,
    sendSimulationControl,
    launchDemo,
    stopDemo,
    triggerChaos,
  } = useSwarm();

  const isRunning = state?.simulation.isRunning;
  const speed = state?.simulation.speed || 1;
  const isDemoActive = state?.simulation.isDemoActive;
  const demoPhaseName = state?.simulation.demoPhaseName || 'Standby';
  const demoPhaseIndex = state?.simulation.demoPhaseIndex || 0;
  const elapsed = state?.simulation.timeElapsedSeconds || 0;

  const minutes = Math.floor(elapsed / 60);
  const seconds = Math.floor(elapsed % 60);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="hud-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span>Swarm Simulation & Chaos Engineering Laboratory</span>
          </h1>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Test autonomous resiliency, dynamic multi-agent failure recovery, collision avoidance, and scripted showcase scenarios.
          </p>
        </div>

        <button
          onClick={() => (isDemoActive ? stopDemo() : launchDemo())}
          className={`px-4 py-2.5 rounded-lg text-xs font-extrabold flex items-center space-x-2 shadow-lg transition-all shrink-0 ${
            isDemoActive
              ? 'bg-amber-500 text-slate-950 animate-pulse border border-amber-300'
              : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white border border-purple-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isDemoActive ? `STOP DEMO (${demoPhaseIndex}/10)` : '1-CLICK LAUNCH DEMO SHOWCASE'}</span>
        </button>
      </div>

      {/* 10-Phase Scripted Showcase Progress Bar */}
      <div className="hud-panel p-4 space-y-3 border-purple-500/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-purple-300 font-bold">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Autonomous Presentation Demo Sequence</span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            {isDemoActive ? `RUNNING PHASE ${demoPhaseIndex + 1} / 10` : 'STANDBY (READY TO LAUNCH)'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200">
          <div className="font-bold text-sm text-cyan-300 mb-1">{demoPhaseName}</div>
          <div className="text-[10px] text-slate-400">
            {isDemoActive
              ? 'Autonomous orchestration active: mapping -> search -> survivor spotted -> failure injected -> auto task salvage -> 3D altitude deconfliction -> completion.'
              : 'Press "1-CLICK LAUNCH DEMO SHOWCASE" to automatically demonstrate all multi-agent capabilities in sequence.'}
          </div>
        </div>

        {/* Phase Bar Steps */}
        <div className="grid grid-cols-10 gap-1 pt-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                isDemoActive && i === demoPhaseIndex
                  ? 'bg-amber-400 animate-pulse'
                  : i < demoPhaseIndex
                  ? 'bg-emerald-500'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Time & Speed Controls */}
      <div className="hud-panel p-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-200 uppercase border-b border-slate-800 pb-2 flex items-center justify-between">
          <span>Simulation Physics & Clock Controller</span>
          <span className="text-cyan-400">
            ELAPSED: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => sendSimulationControl(isRunning ? 'pause' : 'start')}
              className={`px-4 py-2 rounded-lg font-bold flex items-center space-x-2 transition-colors ${
                isRunning
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Pause Simulation' : 'Start Simulation'}</span>
            </button>

            <button
              onClick={() => sendSimulationControl('step')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center space-x-1.5"
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Step 1 Tick</span>
            </button>

            <button
              onClick={() => sendSimulationControl('reset')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset State</span>
            </button>
          </div>

          {/* Speed Multipliers */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-[11px]">Speed:</span>
            {([1, 2, 5, 10] as const).map((s) => (
              <button
                key={s}
                onClick={() => sendSimulationControl('start', s)}
                className={`px-3 py-1.5 rounded font-bold text-xs ${
                  speed === s
                    ? 'bg-cyan-500 text-slate-950 font-extrabold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Chaos Injection Matrix */}
      <div className="hud-panel p-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-200 uppercase border-b border-slate-800 pb-2 flex items-center space-x-2 text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          <span>Manual Chaos & Anomaly Injection Matrix</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-rose-900/60 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-rose-300">Fail Drone 01 (Mapper)</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Simulates catastrophic motor failure. System must salvage mapping tasks and hand over to Search unit.
              </p>
            </div>
            <button
              onClick={() => triggerChaos('FAIL_DRONE', { droneId: 'drone-01', reason: 'Rotor Stator Jam' })}
              className="w-full py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold transition-colors"
            >
              TRIGGER FAILURE
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-rose-900/60 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-rose-300">Fail Drone 02 (Search)</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Simulates search unit hardware drop. Triggers instant multi-agent redistribution of Sector B-14 search tasks.
              </p>
            </div>
            <button
              onClick={() => triggerChaos('FAIL_DRONE', { droneId: 'drone-02', reason: 'Critical Sensor Bus Fault' })}
              className="w-full py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold transition-colors"
            >
              TRIGGER FAILURE
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-amber-900/60 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-amber-300">Disconnect Drone 03 (Relay)</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Simulates communication jam. System triggers autonomous relay failover election and re-routes mesh links.
              </p>
            </div>
            <button
              onClick={() => triggerChaos('DISCONNECT', { droneId: 'drone-03' })}
              className="w-full py-1.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-200 font-bold transition-colors"
            >
              JAM C2 LINK
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-amber-900/60 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-amber-300">Low Battery Drone 04 (&lt;15%)</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Forces rapid battery depletion below emergency threshold. Swarm reallocates thermal scans and commands RTB.
              </p>
            </div>
            <button
              onClick={() => triggerChaos('LOW_BATTERY', { droneId: 'drone-04' })}
              className="w-full py-1.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-200 font-bold transition-colors"
            >
              DRAIN BATTERY
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-purple-900/60 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-purple-300">Create 3D Collision Conflict</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Forces Drone 01 & Drone 04 into converging flight paths (&lt;15m) to verify predictive anti-collision stepping.
              </p>
            </div>
            <button
              onClick={() => triggerChaos('COLLISION_RISK', { droneAId: 'drone-01', droneBId: 'drone-04' })}
              className="w-full py-1.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-purple-200 font-bold transition-colors"
            >
              FORCE CONFLICT
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-emerald-900/60 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-emerald-300">Spawn Critical Survivor</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Injects high-confidence civilian detection and automatically creates urgent verification task.
              </p>
            </div>
            <button
              onClick={() => triggerChaos('SPAWN_SURVIVOR')}
              className="w-full py-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 font-bold transition-colors"
            >
              SPAWN CASUALTY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
