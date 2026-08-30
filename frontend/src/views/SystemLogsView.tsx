import React, { useState } from 'react';
import { useSwarm } from '../context/SwarmContext';
import {
  ScrollText,
  Filter,
  Search,
  Download,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Radio,
  Zap,
} from 'lucide-react';
import { DecisionCategory } from '@swarmos/shared';

export const SystemLogsView: React.FC = () => {
  const { state } = useSwarm();

  const logs = state?.decisionLogs || [];

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (categoryFilter !== 'ALL' && log.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(q) ||
        log.what.toLowerCase().includes(q) ||
        log.why.toLowerCase().includes(q) ||
        log.decision.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `swarmos-ai-decision-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="hud-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
            <ScrollText className="w-5 h-5 text-cyan-400" />
            <span>AI Cognition & Multi-Agent Decision Audit Trail</span>
          </h1>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Transparent blackbox telemetry recording: WHAT happened, WHY it occurred, and WHAT the swarm decided.
          </p>
        </div>

        <button
          onClick={exportLogs}
          className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center space-x-2 transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export JSON Audit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="hud-panel p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1">
          {[
            'ALL',
            'TASK_ALLOCATION',
            'FAILURE_RECOVERY',
            'COLLISION_AVOIDANCE',
            'NETWORK_HEALING',
            'CV_DETECTION',
            'SLAM_NAVIGATION',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                categoryFilter === cat
                  ? 'bg-cyan-500 text-slate-950 font-extrabold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search reasoning logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Logs Stream Container */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="hud-panel p-12 text-center text-slate-500">
            No decision logs match the current search or category filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isCrit = log.level === 'CRITICAL';
            const isWarn = log.level === 'WARN';
            const isSuccess = log.level === 'SUCCESS';

            return (
              <div
                key={log.id}
                className={`hud-panel p-4 space-y-2 border transition-all ${
                  isCrit
                    ? 'border-rose-900/80 bg-rose-950/20'
                    : isWarn
                    ? 'border-amber-900/80 bg-amber-950/20'
                    : isSuccess
                    ? 'border-emerald-900/80 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`p-1 rounded text-[10px] font-extrabold ${
                        isCrit
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isWarn
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : isSuccess
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {log.category}
                    </span>

                    <span className="font-extrabold text-slate-100 text-xs sm:text-sm">
                      {log.title}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    {log.droneId && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-bold border border-slate-800">
                        {log.droneId.toUpperCase()}
                      </span>
                    )}
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Structured WHAT / WHY / DECISION Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      1. What Happened
                    </span>
                    <p className="text-slate-200">{log.what}</p>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">
                      2. Why It Occurred
                    </span>
                    <p className="text-slate-300">{log.why}</p>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase block">
                      3. Swarm Decision
                    </span>
                    <p className="text-cyan-200">{log.decision}</p>
                  </div>
                </div>

                {/* Score Breakdown if attached */}
                {log.scoreBreakdown && (
                  <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80 flex items-center justify-between">
                    <span>
                      <strong className="text-slate-300">SCORING AUDIT:</strong> {log.scoreBreakdown.explanation}
                    </span>
                    <span className="text-cyan-400 font-bold">
                      TOTAL: {log.scoreBreakdown.totalScore} pts
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
