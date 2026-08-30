import React, { useState } from 'react';
import { useSwarm } from '../context/SwarmContext';
import {
  Settings,
  Sliders,
  ShieldCheck,
  Radio,
  Save,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { DEFAULT_ALGORITHM_WEIGHTS, SAFETY_PARAMETERS } from '@swarmos/shared';

export const SettingsView: React.FC = () => {
  const { isConnected } = useSwarm();

  const [weights, setWeights] = useState({ ...DEFAULT_ALGORITHM_WEIGHTS });
  const [safety, setSafety] = useState({ ...SAFETY_PARAMETERS });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setWeights({ ...DEFAULT_ALGORITHM_WEIGHTS });
    setSafety({ ...SAFETY_PARAMETERS });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="hud-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>SwarmOS Kernel Parameters & Multi-Agent Weights</span>
          </h1>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Fine-tune task allocation scoring weights, collision deconfliction radii, and sensor fusion hyperparameters.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: AI Task Scoring Weights */}
        <div className="lg:col-span-6 space-y-4">
          <div className="hud-panel p-4 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase border-b border-slate-800 pb-2 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Multi-Agent Task Allocation Weights</span>
            </h2>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Task Priority Weight (Wp)</span>
                  <span className="text-cyan-400 font-bold">{weights.priorityWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.priorityWeight}
                  onChange={(e) => setWeights({ ...weights, priorityWeight: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Distance Efficiency Weight (Wd)</span>
                  <span className="text-cyan-400 font-bold">{weights.distanceWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.distanceWeight}
                  onChange={(e) => setWeights({ ...weights, distanceWeight: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Battery Suitability Weight (Wb)</span>
                  <span className="text-cyan-400 font-bold">{weights.batteryWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.batteryWeight}
                  onChange={(e) => setWeights({ ...weights, batteryWeight: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Sensor Capability Match Weight (Wc)</span>
                  <span className="text-cyan-400 font-bold">{weights.capabilityWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.capabilityWeight}
                  onChange={(e) => setWeights({ ...weights, capabilityWeight: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Communication Quality Weight (Wq)</span>
                  <span className="text-cyan-400 font-bold">{weights.commQualityWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.commQualityWeight}
                  onChange={(e) => setWeights({ ...weights, commQualityWeight: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Workload Queue Penalty Weight (Ww)</span>
                  <span className="text-rose-400 font-bold">{weights.workloadPenaltyWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.workloadPenaltyWeight}
                  onChange={(e) => setWeights({ ...weights, workloadPenaltyWeight: Number(e.target.value) })}
                  className="w-full accent-rose-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Safety & System Connectivity Diagnostics */}
        <div className="lg:col-span-6 space-y-4">
          <div className="hud-panel p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase border-b border-slate-800 pb-2 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>3D Collision & Flight Safety Envelopes</span>
            </h2>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">HORIZONTAL SAFETY RADIUS</span>
                <input
                  type="number"
                  value={safety.horizontalSafetyRadiusMeters}
                  onChange={(e) => setSafety({ ...safety, horizontalSafetyRadiusMeters: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-100 font-bold"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">meters (standard: 25m)</span>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">VERTICAL SEPARATION</span>
                <input
                  type="number"
                  value={safety.verticalSafetySeparationMeters}
                  onChange={(e) => setSafety({ ...safety, verticalSafetySeparationMeters: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-100 font-bold"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">meters (standard: 15m)</span>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">CRITICAL BATTERY THRESHOLD</span>
                <input
                  type="number"
                  value={safety.criticalBatteryThresholdPercent}
                  onChange={(e) => setSafety({ ...safety, criticalBatteryThresholdPercent: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-rose-300 font-bold"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">% capacity (triggers RTB)</span>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">MAX SURVEY AIRSPEED</span>
                <input
                  type="number"
                  value={safety.maxDroneSpeedMps}
                  onChange={(e) => setSafety({ ...safety, maxDroneSpeedMps: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-100 font-bold"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">m/s (approx 65 km/h)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold flex items-center justify-center space-x-2 transition-colors mt-2"
            >
              <Save className="w-4 h-4" />
              <span>SAVE & COMMIT CONFIGURATION TO C2 KERNEL</span>
            </button>

            {savedSuccess && (
              <div className="p-2 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-center font-bold flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>KERNEL PARAMETERS UPDATED SUCCESSFULLY</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
