import React, { useState } from 'react';
import { useSwarm } from '../context/SwarmContext';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { MissionTask, TaskStatus } from '@swarmos/shared';

export const TaskAllocationView: React.FC = () => {
  const { state, selectedTaskId, setSelectedTaskId, setSelectedDroneId, setActiveTab } = useSwarm();

  const tasks = state?.tasks || [];
  const drones = state?.drones || [];

  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const activeTask = tasks.find((t) => t.id === selectedTaskId) || filteredTasks[0] || tasks[0];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="hud-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Multi-Agent Task Allocation & Decision Scoring Engine</span>
          </h1>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Transparent scoring model evaluating priority, 3D distance efficiency, battery envelope, sensor capabilities, and workload penalties.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {['ALL', 'IN_PROGRESS', 'PENDING', 'REASSIGNED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left List of Tasks */}
        <div className="lg:col-span-6 space-y-2">
          {filteredTasks.map((task) => {
            const isSelected = activeTask?.id === task.id;
            const assignedDrone = drones.find((d) => d.id === task.assignedDroneId);
            const isReassigned = task.status === 'REASSIGNED' || !!task.previousDroneId;

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`hud-panel p-3 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-slate-900 shadow-md shadow-cyan-500/10'
                    : 'hover:border-slate-700 bg-slate-950/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                          task.priority === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : task.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="font-bold text-slate-100">{task.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                      {task.description}
                    </p>
                  </div>

                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold shrink-0 ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : task.status === 'REASSIGNED'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>

                {/* Bottom meta row */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 text-[10px]">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">ASSIGNED:</span>
                    {assignedDrone ? (
                      <span className="font-bold text-cyan-300 flex items-center space-x-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: assignedDrone.color }}
                        />
                        <span>{assignedDrone.callsign}</span>
                      </span>
                    ) : (
                      <span className="text-amber-400">UNASSIGNED (IN QUEUE)</span>
                    )}
                  </div>

                  {isReassigned && task.previousDroneId && (
                    <span className="text-purple-400 text-[10px]">
                      Reassigned from {task.previousDroneId.toUpperCase()}
                    </span>
                  )}

                  <span className="text-slate-400">PROGRESS: {task.progress.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Candidate Score Breakdown Matrix */}
        <div className="lg:col-span-6 space-y-4">
          {activeTask ? (
            <div className="hud-panel p-4 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">
                    AI Decision Analysis & Score Matrix
                  </span>
                  <span className="text-[10px] text-slate-400">TASK ID: {activeTask.id}</span>
                </div>
                <h2 className="text-sm font-extrabold text-slate-100 mt-1">{activeTask.title}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{activeTask.description}</p>
              </div>

              {/* Dynamic Reassignment Notice if applicable */}
              {activeTask.reassignmentReason && (
                <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-700/60 text-purple-200 text-[11px] space-y-1">
                  <div className="font-extrabold flex items-center space-x-1.5 text-purple-300">
                    <Zap className="w-4 h-4" />
                    <span>DYNAMIC REALLOCATION LOGIC</span>
                  </div>
                  <p>{activeTask.reassignmentReason}</p>
                </div>
              )}

              {/* Mathematical Formula Preview */}
              <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400">
                <strong className="text-slate-300">Scoring Model:</strong> Task Score = 0.35·Priority + 0.25·Distance + 0.20·Battery + 0.20·Capability + 0.10·Comms - 0.15·Workload
              </div>

              {/* Per-Drone Score Breakdown Cards */}
              <div className="space-y-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Candidate Drone Evaluations
                </span>

                {drones.map((drone) => {
                  const score = activeTask.scoreBreakdowns
                    ? activeTask.scoreBreakdowns[drone.id]
                    : null;
                  const isWinner = activeTask.assignedDroneId === drone.id;
                  const isDisqualified = score ? score.totalScore <= 0 : false;

                  return (
                    <div
                      key={drone.id}
                      className={`p-3 rounded-lg border text-[11px] transition-all ${
                        isWinner
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                          : isDisqualified
                          ? 'bg-slate-950/30 border-slate-900 opacity-60'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: drone.color }}
                          />
                          <span className="font-bold text-slate-200">
                            {drone.name} ({drone.callsign})
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isWinner && (
                            <span className="px-2 py-0.2 rounded bg-cyan-500 text-slate-950 font-extrabold text-[9px]">
                              OPTIMAL SELECTION
                            </span>
                          )}
                          <span
                            className={`font-extrabold text-sm ${
                              isWinner
                                ? 'text-cyan-300'
                                : isDisqualified
                                ? 'text-rose-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {score ? `${score.totalScore.toFixed(1)} pts` : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {score && (
                        <div className="mt-2 space-y-1 text-[10px]">
                          <div className="text-slate-400">{score.explanation}</div>

                          <div className="grid grid-cols-5 gap-1 text-center pt-1.5">
                            <div className="bg-slate-900 p-1 rounded">
                              <span className="text-slate-400 block text-[8px]">PRIORITY</span>
                              <span className="font-bold text-slate-200">{score.priorityScore}</span>
                            </div>
                            <div className="bg-slate-900 p-1 rounded">
                              <span className="text-slate-400 block text-[8px]">DIST EFF</span>
                              <span className="font-bold text-slate-200">{score.distanceScore}</span>
                            </div>
                            <div className="bg-slate-900 p-1 rounded">
                              <span className="text-slate-400 block text-[8px]">BATTERY</span>
                              <span className="font-bold text-slate-200">{score.batteryScore}</span>
                            </div>
                            <div className="bg-slate-900 p-1 rounded">
                              <span className="text-slate-400 block text-[8px]">CAP MATCH</span>
                              <span className="font-bold text-slate-200">{score.capabilityScore}</span>
                            </div>
                            <div className="bg-slate-900 p-1 rounded">
                              <span className="text-slate-400 block text-[8px]">WORKLOAD</span>
                              <span className="font-bold text-rose-400">-{score.workloadPenalty}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="hud-panel p-8 text-center text-slate-500">
              Select a mission task on the left to view multi-agent candidate scoring breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
