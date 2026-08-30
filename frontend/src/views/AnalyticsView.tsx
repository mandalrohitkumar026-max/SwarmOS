import React from 'react';
import { useSwarm } from '../context/SwarmContext';
import {
  BarChart3,
  TrendingUp,
  Battery,
  Activity,
  Zap,
  ShieldCheck,
  Radio,
  HeartHandshake,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const { state } = useSwarm();

  const analytics = state?.analytics;
  const mission = state?.mission;

  // Chart data formatting
  const coverageData = (analytics?.timeSeriesCoverage || []).map((d, i) => ({
    time: `T+${i * 10}s`,
    coverage: d.coverage,
    activeDrones: d.activeDrones,
  }));

  const batteryData = (analytics?.timeSeriesBatteryDraw || []).map((d, i) => ({
    time: `T+${i * 10}s`,
    avgBattery: d.avgBattery,
  }));

  const detectionCategoriesData = analytics?.detectionsByType
    ? [
        { type: 'Survivors', count: analytics.detectionsByType.PERSON, fill: '#f43f5e' },
        { type: 'Heat Void', count: analytics.detectionsByType.HEAT_SIGNATURE, fill: '#f59e0b' },
        { type: 'Blocked Rd', count: analytics.detectionsByType.BLOCKED_ROAD, fill: '#3b82f6' },
        { type: 'Damaged Bldg', count: analytics.detectionsByType.DAMAGED_BUILDING, fill: '#a855f7' },
        { type: 'Fire/Smoke', count: analytics.detectionsByType.FIRE_SMOKE, fill: '#ef4444' },
      ]
    : [];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="hud-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Mission Analytics & Swarm Performance Intelligence</span>
          </h1>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Post-mission telemetry analysis, area search velocity curves, MTTR recovery benchmarks, and AI detection accuracy.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 font-bold flex items-center space-x-1.5">
          <Activity className="w-4 h-4" />
          <span>DATA LOGGED: 20Hz PRECISION</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="hud-panel p-3.5 border-blue-500/30">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Search Coverage</span>
          <div className="text-2xl font-extrabold text-blue-300 my-1">
            {mission?.coveragePercent.toFixed(1) || '57.4'}%
          </div>
          <span className="text-[10px] text-slate-400">Urban Epicenter</span>
        </div>

        <div className="hud-panel p-3.5 border-emerald-500/30">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Recovery MTTR (Mean Time)</span>
          <div className="text-2xl font-extrabold text-emerald-300 my-1">
            {analytics?.failedDroneRecoveryAvgTimeSeconds || 2.4}s
          </div>
          <span className="text-[10px] text-slate-400">Autonomous Reallocation</span>
        </div>

        <div className="hud-panel p-3.5 border-purple-500/30">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Avoided Collision Risks</span>
          <div className="text-2xl font-extrabold text-purple-300 my-1">
            {analytics?.collisionRisksAvoidedCount || 0}
          </div>
          <span className="text-[10px] text-slate-400">Zero In-Flight Accidents</span>
        </div>

        <div className="hud-panel p-3.5 border-cyan-500/30">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Mesh Link Uptime</span>
          <div className="text-2xl font-extrabold text-cyan-300 my-1">
            {analytics?.communicationUptimePercent || 99.4}%
          </div>
          <span className="text-[10px] text-slate-400">Continuous C2 Connectivity</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coverage Progress Over Time Chart */}
        <div className="hud-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 uppercase">Search Area Coverage Velocity</span>
            <span className="text-[10px] text-cyan-400">TARGET: 100%</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={coverageData.length > 0 ? coverageData : [{ time: '0s', coverage: 20 }]}>
                <defs>
                  <linearGradient id="coverageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="coverage" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#coverageGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Battery Drain Rate Chart */}
        <div className="hud-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 uppercase">Fleet Average Battery Draw</span>
            <span className="text-[10px] text-emerald-400">ENERGY EFFICIENCY: 92%</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={batteryData.length > 0 ? batteryData : [{ time: '0s', avgBattery: 95 }]}>
                <defs>
                  <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="avgBattery" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#batteryGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Detection Category Distribution Bar Chart */}
        <div className="hud-panel p-4 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 uppercase">Computer Vision Detections by Category</span>
            <span className="text-[10px] text-amber-400">ACCURACY: 96.5%</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detectionCategoriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="type" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
