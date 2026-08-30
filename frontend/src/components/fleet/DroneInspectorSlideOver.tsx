import React from 'react';
import {
  X,
  Battery,
  Zap,
  Radio,
  Navigation,
  Activity,
  AlertTriangle,
  Cpu,
  RotateCcw,
  CheckCircle2,
  Compass,
  Thermometer,
  Eye,
  Flame,
} from 'lucide-react';
import { useSwarm } from '../../context/SwarmContext';
import { SLAMMode } from '@swarmos/shared';

export const DroneInspectorSlideOver: React.FC = () => {
  const {
    selectedDroneId,
    setSelectedDroneId,
    state,
    setDroneSlamMode,
    triggerChaos,
  } = useSwarm();

  if (!selectedDroneId) return null;

  const drone = state?.drones.find((d) => d.id === selectedDroneId);
  if (!drone) return null;

  const currentTask = state?.tasks.find((t) => t.id === drone.currentTaskId);
  const isFailed = drone.status === 'FAILED' || drone.status === 'DISCONNECTED';

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-950/95 border-l border-slate-800 shadow-2xl z-40 flex flex-col font-mono text-xs backdrop-blur-xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <span
            className="w-3.5 h-3.5 rounded-full ring-4 ring-slate-800"
            style={{ backgroundColor: drone.color }}
          />
          <div>
            <h2 className="font-extrabold text-sm text-slate-100">{drone.name}</h2>
            <p className="text-[11px] text-slate-400">CALLSIGN: {drone.callsign}</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedDroneId(null)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Details Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Badge & Role */}
        <div className="grid grid-cols-2 gap-2">
          <div className="hud-card p-2.5">
            <span className="text-[10px] text-slate-400 block mb-1">OPERATIONAL STATUS</span>
            <span
              className={`font-extrabold px-2 py-0.5 rounded text-[11px] inline-block ${
                isFailed
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {drone.status}
            </span>
          </div>

          <div className="hud-card p-2.5">
            <span className="text-[10px] text-slate-400 block mb-1">SPECIALIZED ROLE</span>
            <span className="font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40 text-[11px] inline-block">
              {drone.role}
            </span>
          </div>
        </div>

        {/* Battery & Health Gauge */}
        <div className="hud-card p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>BATTERY CAPACITY</span>
            </span>
            <span
              className={`font-bold ${
                drone.battery > 50
                  ? 'text-emerald-300'
                  : drone.battery > 25
                  ? 'text-amber-300'
                  : 'text-rose-400 animate-pulse'
              }`}
            >
              {drone.battery.toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                drone.battery > 50 ? 'bg-emerald-500' : drone.battery > 25 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, drone.battery))}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-slate-400 border-t border-slate-800/80">
            <div>MOTOR: {drone.health.motorRpm} RPM</div>
            <div>TEMP: {drone.health.temperatureC.toFixed(1)}°C</div>
            <div>SIGNAL: {drone.health.signalStrengthDbm} dBm</div>
            <div>PACKET LOSS: {drone.health.packetLossPercent}%</div>
          </div>
        </div>

        {/* Real-time 3D Telemetry */}
        <div className="hud-card p-3 space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">
            Flight Telemetry
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">ALTITUDE</span>
              <span className="font-bold text-cyan-300">{drone.altitude}m</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">AIRSPEED</span>
              <span className="font-bold text-slate-200">{drone.speed.toFixed(1)} m/s</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">HEADING</span>
              <span className="font-bold text-slate-200">{drone.heading}°</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 space-y-0.5">
            <div>LAT: {drone.position.lat.toFixed(6)}°</div>
            <div>LNG: {drone.position.lng.toFixed(6)}°</div>
            <div>SECTOR: {drone.assignedSector || 'UNASSIGNED'}</div>
            <div>DISTANCE FLOWN: {(drone.distanceCoveredMeters / 1000).toFixed(2)} km</div>
          </div>
        </div>

        {/* Assigned Task Progress */}
        <div className="hud-card p-3 space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Assigned Task Payload</span>
          </span>

          {currentTask ? (
            <div className="space-y-1.5">
              <div className="font-bold text-slate-200">{currentTask.title}</div>
              <div className="text-[10px] text-slate-400">{currentTask.description}</div>
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="text-slate-400">Progress</span>
                <span className="text-cyan-400 font-bold">{currentTask.progress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${currentTask.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-slate-500 py-2 text-center">No active task assigned (Idle Standby)</div>
          )}
        </div>

        {/* SLAM Navigation Mode Selector */}
        <div className="hud-card p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Navigation Mode</span>
            <span className="text-[10px] text-cyan-400">
              CONFIDENCE: {drone.sensors.slamConfidence}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {(['GPS', 'SLAM', 'HYBRID'] as SLAMMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setDroneSlamMode(drone.id, mode)}
                className={`py-1.5 rounded text-[10px] font-bold border transition-colors ${
                  drone.slamMode === mode
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-slate-400 pt-1">
            LANDMARKS TRACKED: {drone.sensors.slamLandmarks} | DRIFT: {drone.sensors.slamDriftMeters}m
          </div>
        </div>

        {/* Chaos / Manual Failure Injection for Testing */}
        <div className="hud-card p-3 space-y-2 border-rose-900/40">
          <span className="text-[10px] text-rose-400 font-bold uppercase flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Chaos & Failure Testing</span>
          </span>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() =>
                triggerChaos('FAIL_DRONE', {
                  droneId: drone.id,
                  reason: 'Manual Rotor Failure Triggered via Fleet Inspector',
                })
              }
              className="px-2 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] font-bold transition-colors"
            >
              FAIL DRONE
            </button>
            <button
              onClick={() => triggerChaos('DISCONNECT', { droneId: drone.id })}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-800/60 text-[10px] font-bold transition-colors"
            >
              JAM C2 LINK
            </button>
            <button
              onClick={() => triggerChaos('LOW_BATTERY', { droneId: drone.id })}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-800/60 text-[10px] font-bold transition-colors"
            >
              DRAIN BATT (&lt;20%)
            </button>
            <button
              onClick={() =>
                triggerChaos('COLLISION_RISK', {
                  droneAId: drone.id,
                  droneBId: drone.id === 'drone-01' ? 'drone-04' : 'drone-01',
                })
              }
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-800/60 text-[10px] font-bold transition-colors"
            >
              TEST COLLISION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
