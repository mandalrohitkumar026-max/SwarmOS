import React, { useState, useEffect } from 'react';
import { Search, X, Plane, Cpu, MapPin, Eye, ScrollText, ArrowRight } from 'lucide-react';
import { useSwarm } from '../../context/SwarmContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    state,
    setSelectedDroneId,
    setSelectedTaskId,
    setActiveTab,
  } = useSwarm();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const drones = state?.drones || [];
  const tasks = state?.tasks || [];
  const detections = state?.detections || [];
  const sectors = state?.sectors || [];
  const logs = state?.decisionLogs || [];

  const q = query.toLowerCase().trim();

  const matchedDrones = drones.filter(
    (d) => d.name.toLowerCase().includes(q) || d.callsign.toLowerCase().includes(q) || d.role.toLowerCase().includes(q)
  );

  const matchedTasks = tasks.filter(
    (t) => t.title.toLowerCase().includes(q) || t.sectorCode.toLowerCase().includes(q) || t.type.toLowerCase().includes(q)
  );

  const matchedDetections = detections.filter(
    (det) => det.type.toLowerCase().includes(q) || det.description.toLowerCase().includes(q) || det.sectorCode.toLowerCase().includes(q)
  );

  const matchedLogs = logs.filter(
    (l) => l.title.toLowerCase().includes(q) || l.what.toLowerCase().includes(q) || l.why.toLowerCase().includes(q)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search drones, tasks, vision detections, sectors, decision logs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4 font-mono text-xs flex-1">
          {/* Drones Section */}
          {matchedDrones.length > 0 && (
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase px-2 mb-1.5 flex items-center space-x-1.5">
                <Plane className="w-3 h-3 text-cyan-400" />
                <span>Drones ({matchedDrones.length})</span>
              </div>
              <div className="space-y-1">
                {matchedDrones.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDroneId(d.id);
                      setActiveTab('fleet');
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800/60 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <div>
                        <div className="font-bold text-slate-200 group-hover:text-cyan-300">
                          {d.name} ({d.callsign})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Role: {d.role} | Batt: {d.battery.toFixed(0)}% | Alt: {d.altitude}m | Status: {d.status}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {matchedTasks.length > 0 && (
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase px-2 mb-1.5 flex items-center space-x-1.5">
                <Cpu className="w-3 h-3 text-blue-400" />
                <span>Mission Tasks ({matchedTasks.length})</span>
              </div>
              <div className="space-y-1">
                {matchedTasks.slice(0, 4).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTaskId(t.id);
                      setActiveTab('tasks');
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800/60 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-blue-300">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Sector: {t.sectorCode} | Priority: {t.priority} | Status: {t.status} | Progress: {t.progress.toFixed(0)}%
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Detections Section */}
          {matchedDetections.length > 0 && (
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase px-2 mb-1.5 flex items-center space-x-1.5">
                <Eye className="w-3 h-3 text-amber-400" />
                <span>AI Detections ({matchedDetections.length})</span>
              </div>
              <div className="space-y-1">
                {matchedDetections.slice(0, 3).map((det) => (
                  <button
                    key={det.id}
                    onClick={() => {
                      setActiveTab('ai-detection');
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800/60 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-bold text-amber-300">
                        {det.type} ({det.confidence.toFixed(0)}% Confidence)
                      </div>
                      <div className="text-[11px] text-slate-400">{det.description}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Decision Logs Section */}
          {matchedLogs.length > 0 && (
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase px-2 mb-1.5 flex items-center space-x-1.5">
                <ScrollText className="w-3 h-3 text-emerald-400" />
                <span>Decision Logs ({matchedLogs.length})</span>
              </div>
              <div className="space-y-1">
                {matchedLogs.slice(0, 3).map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setActiveTab('logs');
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800/60 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-300 group-hover:text-emerald-300">
                        {l.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-lg">{l.what}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedDrones.length === 0 &&
            matchedTasks.length === 0 &&
            matchedDetections.length === 0 &&
            matchedLogs.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                No matching telemetry records found for "{query}"
              </div>
            )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Navigate with mouse or arrow keys</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
