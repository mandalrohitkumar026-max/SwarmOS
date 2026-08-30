import React, { useState } from 'react';
import { useSwarm } from '../context/SwarmContext';
import {
  Compass,
  Play,
  Layers,
  Plus,
  Radio,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { SearchStrategy, TaskType, TaskPriority, DroneRole } from '@swarmos/shared';

export const MissionPlannerView: React.FC = () => {
  const { state, createTask, sendSimulationControl, setActiveTab } = useSwarm();

  const mission = state?.mission;
  const sectors = state?.sectors || [];
  const drones = state?.drones || [];

  const [selectedStrategy, setSelectedStrategy] = useState<SearchStrategy>(
    mission?.searchStrategy || 'ADAPTIVE_HEATMAP'
  );

  // New Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('SEARCH');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('HIGH');
  const [taskSector, setTaskSector] = useState('SEC-A01');
  const [taskCapability, setTaskCapability] = useState<DroneRole>('SEARCH');

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    await createTask({
      title: taskTitle,
      type: taskType,
      priority: taskPriority,
      sectorCode: taskSector,
      requiredCapability: taskCapability,
      location: { lat: 37.777, lng: -122.416, alt: 55 },
    });

    setTaskTitle('');
    setActiveTab('tasks');
  };

  const handleStartAutonomousMission = () => {
    sendSimulationControl('start');
    setActiveTab('live-map');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="hud-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>Autonomous Mission Planner & Strategy Designer</span>
          </h1>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Configure urban search parameters, sector priorities, and deploy multi-agent flight swarms.
          </p>
        </div>

        <button
          onClick={handleStartAutonomousMission}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold flex items-center space-x-2 shadow-lg shadow-cyan-500/25 border border-cyan-300 transition-all shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>START AUTONOMOUS MISSION</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Mission Parameters & Search Strategy Selection */}
        <div className="lg:col-span-7 space-y-4">
          {/* Mission Meta Overview Card */}
          <div className="hud-panel p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Mission Configuration</span>
            </h2>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">MISSION CODENAME</span>
                <span className="font-extrabold text-slate-100">{mission?.name}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">SCENARIO</span>
                <span className="font-bold text-cyan-300">{mission?.scenarioName}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">SEARCH RADIUS</span>
                <span className="font-bold text-slate-200">{mission?.radiusMeters}m (Rubble Center)</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">DEPLOYED UNITS</span>
                <span className="font-bold text-emerald-300">{drones.length} Coordinated Drones</span>
              </div>
            </div>
          </div>

          {/* Search Strategy Matrix */}
          <div className="hud-panel p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Multi-Agent Search Strategy</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'ADAPTIVE_HEATMAP' as SearchStrategy,
                  title: 'Adaptive Priority Heatmap',
                  desc: 'Dynamically routes drones to high-probability survivor zones & thermal cluster vectors.',
                  tag: 'AI OPTIMIZED',
                },
                {
                  id: 'GRID_SWEEP' as SearchStrategy,
                  title: 'Parallel Grid Sweep',
                  desc: 'Synchronized raster scanning pattern guaranteeing 100% orthophoto coverage.',
                  tag: 'SYSTEMATIC',
                },
                {
                  id: 'SECTOR_PRIORITY' as SearchStrategy,
                  title: 'Sector Priority Cascade',
                  desc: 'Concentrates all units on Critical collapsed structures first before perimeter.',
                  tag: 'TRIAGE FIRST',
                },
                {
                  id: 'SPIRAL_OUT' as SearchStrategy,
                  title: 'Concentric Spiral Expansion',
                  desc: 'Expands outward from epicenter, prioritizing immediate high-density collapse zone.',
                  tag: 'RAPID PERIMETER',
                },
              ].map((strat) => (
                <button
                  key={strat.id}
                  onClick={() => setSelectedStrategy(strat.id)}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    selectedStrategy === strat.id
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-100">{strat.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                        {strat.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{strat.desc}</p>
                  </div>
                  {selectedStrategy === strat.id && (
                    <div className="text-[10px] text-cyan-400 font-bold flex items-center space-x-1 mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>STRATEGY ACTIVE</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Disaster Sectors Exploration Status Table */}
          <div className="hud-panel p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase border-b border-slate-800 pb-2">
              Disaster Sectors & Exploration Status
            </h2>

            <div className="space-y-2">
              {sectors.map((sec) => (
                <div
                  key={sec.code}
                  className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        sec.priority === 'CRITICAL'
                          ? 'bg-rose-500 animate-ping'
                          : sec.priority === 'HIGH'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div>
                      <div className="font-bold text-slate-200">
                        {sec.code} — {sec.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Hazard: {sec.hazardLevel} | Survivors: {sec.detectedSurvivorsCount} | Assigned: {sec.assignedDroneId || 'NONE'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-cyan-300">{sec.explorationPercent.toFixed(0)}%</div>
                    <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                      <div
                        className="h-full bg-cyan-500"
                        style={{ width: `${sec.explorationPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Add Ad-Hoc Task Creator Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="hud-panel p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Dispatch Ad-Hoc Task</span>
            </h2>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">TASK TITLE / OBJECTIVE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Structural Void Search Sector C-08"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">TASK TYPE</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="SEARCH">Area Search</option>
                    <option value="THERMAL_SCAN">Thermal Scan</option>
                    <option value="MAPPING">3D Mapping</option>
                    <option value="CASUALTY_CONFIRMATION">Casualty Verify</option>
                    <option value="COMM_RELAY">Comm Relay</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">PRIORITY</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">TARGET SECTOR</label>
                  <select
                    value={taskSector}
                    onChange={(e) => setTaskSector(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {sectors.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} ({s.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">CAPABILITY</label>
                  <select
                    value={taskCapability}
                    onChange={(e) => setTaskCapability(e.target.value as DroneRole)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="SEARCH">Search Unit</option>
                    <option value="THERMAL">Thermal FLIR Unit</option>
                    <option value="MAPPER">3D Mapper Unit</option>
                    <option value="RELAY">Relay Node</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold flex items-center justify-center space-x-2 transition-colors mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>INJECT TASK INTO SWARM ALLOCATION ENGINE</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
