import React from 'react';
import { useSwarm } from '../context/SwarmContext';
import { TacticalRadarMap } from '../components/map/TacticalRadarMap';
import { DroneInspectorSlideOver } from '../components/fleet/DroneInspectorSlideOver';
import {
  Compass,
  Radio,
  Layers,
  ShieldCheck,
  AlertTriangle,
  HeartHandshake,
  Activity,
  Flame,
} from 'lucide-react';

export const LiveMapView: React.FC = () => {
  const { state, selectedDroneId, setSelectedDroneId } = useSwarm();

  const drones = state?.drones || [];
  const sectors = state?.sectors || [];
  const mission = state?.mission;
  const conflicts = state?.conflicts || [];
  const activeConflicts = conflicts.filter((c) => !c.resolved);

  return (
    <div className="flex-1 relative flex flex-col h-full overflow-hidden select-none">
      {/* Top Map Action Strip */}
      <div className="p-3 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between font-mono text-xs z-10 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
            <Compass className="w-4 h-4" />
            <span>TACTICAL GEOSPATIAL RADAR</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">
            ZONE: Downtown Disaster Rubble Grid (4.2 km²)
          </span>
        </div>

        {/* Quick Drone Filter Chips */}
        <div className="flex items-center space-x-1.5">
          {drones.map((d) => {
            const isSelected = selectedDroneId === d.id;
            const isDown = d.status === 'FAILED' || d.status === 'DISCONNECTED';
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDroneId(isSelected ? null : d.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center space-x-1.5 transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-400'
                    : isDown
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span>{d.callsign}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative">
        <TacticalRadarMap
          selectedDroneId={selectedDroneId}
          onSelectDrone={(id) => setSelectedDroneId(id)}
        />

        {/* Floating Active Conflict Banner on Top of Map if any */}
        {activeConflicts.length > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 hud-panel px-4 py-2 bg-rose-950/90 border-rose-600 text-rose-200 flex items-center space-x-3 shadow-2xl animate-bounce">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="font-bold font-mono text-xs">
              ACTIVE COLLISION RISK DETECTED: AUTO-DECONFLICTION IN PROGRESS
            </span>
          </div>
        )}
      </div>

      {/* Drone Inspector Slide Over */}
      <DroneInspectorSlideOver />
    </div>
  );
};
