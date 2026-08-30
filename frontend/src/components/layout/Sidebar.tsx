import React from 'react';
import {
  LayoutDashboard,
  Map as MapIcon,
  Plane,
  Compass,
  Cpu,
  Eye,
  Radio,
  Sliders,
  AlertTriangle,
  BarChart3,
  ScrollText,
  Settings,
  Flame,
  Zap,
} from 'lucide-react';
import { useSwarm } from '../../context/SwarmContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, state } = useSwarm();

  const activeDronesCount = state?.drones.filter((d) => d.status !== 'FAILED' && d.status !== 'DISCONNECTED').length || 0;
  const pendingTasksCount = state?.tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'PENDING').length || 0;
  const unconfirmedDetections = state?.detections.filter((d) => d.status === 'UNCONFIRMED').length || 0;
  const conflictsCount = state?.conflicts.filter((c) => !c.resolved).length || 0;

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-map', label: 'Live Map', icon: MapIcon, badge: 'LIVE', badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
    { id: 'fleet', label: 'Drone Fleet', icon: Plane, badge: `${activeDronesCount}/${state?.drones.length || 4}`, badgeColor: 'bg-cyan-500/20 text-cyan-400' },
    { id: 'mission-planner', label: 'Mission Planner', icon: Compass },
    { id: 'tasks', label: 'Task Allocation', icon: Cpu, badge: pendingTasksCount, badgeColor: 'bg-blue-500/20 text-blue-400' },
    { id: 'ai-detection', label: 'AI Detection', icon: Eye, badge: unconfirmedDetections > 0 ? unconfirmedDetections : undefined, badgeColor: 'bg-amber-500/20 text-amber-400' },
    { id: 'network', label: 'Comm Network', icon: Radio, badge: `${state?.network.meshHealthScore || 98}%`, badgeColor: 'bg-emerald-500/20 text-emerald-400' },
    { id: 'simulation', label: 'Simulation & Chaos', icon: Zap, badge: 'LAB', badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/40' },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle, badge: conflictsCount > 0 ? conflictsCount : undefined, badgeColor: 'bg-rose-500/20 text-rose-400 animate-pulse' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'logs', label: 'System Logs', icon: ScrollText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col h-screen shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
            <Flame className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                SWARM<span className="text-cyan-400">OS</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">AUTONOMOUS C2 MESH</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <div className="px-3 py-1 text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
          Mission Control
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-semibold ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Swarm Core Node Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>CORE NODE: LOCALHOST</span>
          </span>
          <span className="text-cyan-400">20Hz C2</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono flex justify-between">
          <span>COGNITION: EKF + A*</span>
          <span>LATENCY: {state?.network.averageLatencyMs || 18}ms</span>
        </div>
      </div>
    </aside>
  );
};
