import React from 'react';
import { useSwarm } from '../context/SwarmContext';
import { DroneInspectorSlideOver } from '../components/fleet/DroneInspectorSlideOver';
import {
  Plane,
  Battery,
  Zap,
  Radio,
  Activity,
  AlertTriangle,
  Cpu,
  RotateCcw,
  Navigation,
  Thermometer,
  ShieldCheck,
  Eye,
  Flame,
} from 'lucide-react';
import { SLAMMode } from '@swarmos/shared';

export const FleetView: React.FC = () => {
  const {
    state,
    selectedDroneId,
    setSelectedDroneId,
    setDroneSlamMode,
    triggerChaos,
  } = useSwarm();

  const drones = state?.drones || [];
  const tasks = state?.tasks || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs select-none">
      {/* Fleet Header */}
      <div className="hud-panel p-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
            <Plane className="w-5 h-5 text-cyan-400" />
            <span>Autonomous Swarm Fleet Diagnostics</span>
          </h1>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Decentralized multi-agent state estimation, avionics health, and sensor payload telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              ACTIVE UNITS: {drones.filter((d) => d.status !== 'FAILED' && d.status !== 'DISCONNECTED').length} / {drones.length}
            </span>
          </div>
        </div>
      </div>

      {/* Drone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {drones.map((drone) => {
          const isSelected = selectedDroneId === drone.id;
          const isFailed = drone.status === 'FAILED' || drone.status === 'DISCONNECTED';
          const currentTask = tasks.find((t) => t.id === drone.currentTaskId);

          return (
            <div
              key={drone.id}
              onClick={() => setSelectedDroneId(drone.id)}
              className={`hud-panel p-4 flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-cyan-400 bg-slate-900/90 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : isFailed
                  ? 'border-rose-900/60 bg-rose-950/20'
                  : 'hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: drone.color }}
                    />
                    <div>
                      <div className="font-extrabold text-sm text-slate-100">{drone.name}</div>
                      <div className="text-[10px] text-slate-400">{drone.callsign}</div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isFailed
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {drone.status}
                  </span>
                </div>

                {/* Role and Sector */}
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <span className="text-slate-400 block">ROLE</span>
                    <span className="font-bold text-cyan-300">{drone.role}</span>
                  </div>
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <span className="text-slate-400 block">SECTOR</span>
                    <span className="font-bold text-slate-200">{drone.assignedSector || 'UNASSIGNED'}</span>
                  </div>
                </div>
              </div>

              {/* Battery & Health Gauge */}
              <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery</span>
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
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      drone.battery > 50 ? 'bg-emerald-500' : drone.battery > 25 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, drone.battery))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>{drone.health.motorRpm} RPM</span>
                  <span>{drone.health.temperatureC.toFixed(1)}°C</span>
                  <span>{drone.health.signalStrengthDbm} dBm</span>
                </div>
              </div>

              {/* Flight Telemetry 3-col */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-400 block">ALT</span>
                  <span className="font-bold text-cyan-300">{drone.altitude}m</span>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-400 block">SPEED</span>
                  <span className="font-bold text-slate-200">{drone.speed.toFixed(1)}m/s</span>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-400 block">HEADING</span>
                  <span className="font-bold text-slate-200">{drone.heading}°</span>
                </div>
              </div>

              {/* Active Task Progress */}
              <div className="text-[10px] bg-slate-950/40 p-2 rounded border border-slate-800/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 truncate max-w-[140px]">
                    {currentTask ? currentTask.title : 'No active task'}
                  </span>
                  <span className="text-cyan-400 font-bold">
                    {currentTask ? `${currentTask.progress.toFixed(0)}%` : 'IDLE'}
                  </span>
                </div>
                {currentTask && (
                  <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500"
                      style={{ width: `${currentTask.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* SLAM Mode Buttons */}
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800">
                <span className="text-slate-400">SLAM MODE</span>
                <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                  {(['GPS', 'SLAM', 'HYBRID'] as SLAMMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDroneSlamMode(drone.id, mode)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        drone.slamMode === mode
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DroneInspectorSlideOver />
    </div>
  );
};
