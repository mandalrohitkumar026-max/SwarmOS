import React, { useState, useEffect } from 'react';
import {
  Activity,
  Radio,
  Users,
  Search,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  HeartHandshake,
  AlertOctagon,
  Flame,
} from 'lucide-react';
import { useSwarm } from '../../context/SwarmContext';

export const TopBar: React.FC = () => {
  const {
    state,
    isConnected,
    launchDemo,
    stopDemo,
    sendSimulationControl,
    triggerChaos,
    setIsSearchOpen,
  } = useSwarm();

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0] + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mission = state?.mission;
  const isDemoActive = state?.simulation.isDemoActive;
  const isRunning = state?.simulation.isRunning;
  const speed = state?.simulation.speed || 1;
  const connectedDronesCount = state?.drones.filter((d) => d.status !== 'FAILED' && d.status !== 'DISCONNECTED').length || 0;
  const survivorsFound = mission?.survivorsFound || 0;
  const meshHealth = state?.network.meshHealthScore || 98;
  const activeAlert = state?.emergencyAlert?.active;

  return (
    <header className="h-14 bg-slate-950/80 border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-20 backdrop-blur-md">
      {/* Left: Swarm State & Mission Details */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              activeAlert
                ? 'bg-rose-500 animate-ping'
                : isConnected
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-amber-500'
            }`}
          />
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-200">
              {activeAlert ? (
                <span className="text-rose-400 flex items-center space-x-1">
                  <AlertOctagon className="w-3.5 h-3.5 inline mr-1" />
                  EMERGENCY STATE
                </span>
              ) : isConnected ? (
                'SWARM NOMINAL'
              ) : (
                'CONNECTING...'
              )}
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
              {mission?.name || 'OPERATION METRO RESCUE'}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-800" />

        {/* Real-time KPI Counters */}
        <div className="hidden lg:flex items-center space-x-5 text-xs font-mono">
          <div className="flex items-center space-x-1.5" title="Connected Autonomous Drones">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">DRONES:</span>
            <span className="font-bold text-cyan-300">
              {connectedDronesCount} / {state?.drones.length || 4}
            </span>
          </div>

          <div className="flex items-center space-x-1.5" title="Detected Survivors">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">SURVIVORS:</span>
            <span className="font-bold text-emerald-300">{survivorsFound}</span>
          </div>

          <div className="flex items-center space-x-1.5" title="Search Coverage Area">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">COVERAGE:</span>
            <span className="font-bold text-blue-300">
              {mission?.coveragePercent.toFixed(1) || '0.0'}%
            </span>
          </div>

          <div className="flex items-center space-x-1.5" title="Ad-Hoc Mesh Health">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">MESH:</span>
            <span className="font-bold text-slate-200">{meshHealth}%</span>
          </div>

          <div className="flex items-center space-x-1.5" title="System Synchronized Time">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400 font-mono text-[11px]">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Right: Simulation Controls, Launch Demo Button & Search */}
      <div className="flex items-center space-x-3">
        {/* Global Search Button (Cmd+K) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-xs font-mono transition-all"
          title="Search telemetry, drones, logs (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Search</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-slate-950 text-[10px] text-slate-400 border border-slate-800">
            ⌘K
          </kbd>
        </button>

        {/* Simulation Speed & Play/Pause */}
        <div className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => sendSimulationControl(isRunning ? 'pause' : 'start')}
            className={`p-1.5 rounded ${
              isRunning
                ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title={isRunning ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button
            onClick={() => sendSimulationControl('step')}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Step 1 Tick"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => sendSimulationControl('reset')}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Reset Swarm State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center pl-1 border-l border-slate-800 space-x-0.5 text-[10px] font-mono">
            {([1, 2, 5, 10] as const).map((s) => (
              <button
                key={s}
                onClick={() => sendSimulationControl('start', s)}
                className={`px-1.5 py-0.5 rounded ${
                  speed === s
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* 1-Click Launch Demo Button */}
        <button
          onClick={() => (isDemoActive ? stopDemo() : launchDemo())}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wide transition-all shadow-lg ${
            isDemoActive
              ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white animate-pulse shadow-amber-500/25 border border-amber-400'
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-slate-950 font-extrabold hover:opacity-95 shadow-cyan-500/25 border border-cyan-300'
          }`}
          title="Run full 10-phase autonomous demonstration"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isDemoActive ? 'animate-spin' : ''}`} />
          <span>{isDemoActive ? `DEMO (${state?.simulation.demoPhaseIndex || 0}/10)` : 'LAUNCH DEMO'}</span>
        </button>
      </div>
    </header>
  );
};
