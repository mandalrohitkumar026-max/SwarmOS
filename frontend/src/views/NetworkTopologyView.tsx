import React from 'react';
import { useSwarm } from '../context/SwarmContext';
import {
  Radio,
  Wifi,
  Activity,
  AlertTriangle,
  Zap,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export const NetworkTopologyView: React.FC = () => {
  const { state, triggerChaos } = useSwarm();

  const network = state?.network;
  const drones = state?.drones || [];
  const activeRelayId = network?.activeRelayId;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="hud-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <span>Ad-Hoc Mesh Communication & Relay Topology</span>
          </h1>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Self-healing RF wireless mesh network with automated relay node election, multi-hop routing, and packet QoS monitoring.
          </p>
        </div>

        <button
          onClick={() => triggerChaos('DISCONNECT', { droneId: 'drone-03' })}
          className="px-3.5 py-2 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-700 text-amber-300 font-extrabold flex items-center space-x-2 transition-colors shrink-0"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Simulate Relay Jamming (Trigger Auto-Failover)</span>
        </button>
      </div>

      {/* Mesh KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="hud-panel p-3.5 border-emerald-500/30">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Mesh Health Score</span>
          <div className="text-xl font-extrabold text-emerald-300 my-1">
            {network?.meshHealthScore || 98}%
          </div>
          <span className="text-[10px] text-slate-400">All Core Nodes Synchronized</span>
        </div>

        <div className="hud-panel p-3.5 border-cyan-500/30">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Relay Anchor</span>
          <div className="text-xl font-extrabold text-cyan-300 my-1 uppercase">
            {activeRelayId || 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400">Altitude: 110m (High-Bandwidth)</span>
        </div>

        <div className="hud-panel p-3.5 border-blue-500/30">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Average C2 Latency</span>
          <div className="text-xl font-extrabold text-blue-300 my-1">
            {network?.averageLatencyMs || 24} ms
          </div>
          <span className="text-[10px] text-slate-400">5.8GHz Mesh Backbone</span>
        </div>

        <div className="hud-panel p-3.5 border-purple-500/30">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Swarm RF Coverage</span>
          <div className="text-xl font-extrabold text-purple-300 my-1">
            {network?.coveragePercent || 100}%
          </div>
          <span className="text-[10px] text-slate-400">
            {network?.isolatedNodeIds.length || 0} Isolated Nodes
          </span>
        </div>
      </div>

      {/* Visual Mesh Topology Canvas Representation */}
      <div className="hud-panel p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase border-b border-slate-800 pb-2 flex items-center justify-between">
          <span>Decentralized Mesh Topology Visualizer</span>
          <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SELF-HEALING C2 ONLINE</span>
          </span>
        </h2>

        {/* Dynamic Interactive Node Diagram */}
        <div className="relative h-80 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-center p-8 overflow-hidden">
          <div className="absolute inset-0 bg-grid-tactical opacity-30" />

          {/* Central Relay / GCS Hub */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-2xl z-10 gap-8">
            {/* Ground Command Unit */}
            <div className="p-4 rounded-xl bg-slate-900 border-2 border-cyan-500 text-center shadow-lg shadow-cyan-500/20">
              <Radio className="w-8 h-8 text-cyan-400 mx-auto mb-1" />
              <div className="font-bold text-slate-100">COMMAND CENTER (GCS)</div>
              <div className="text-[10px] text-slate-400">Local C2 Base Station</div>
              <div className="text-[10px] text-cyan-400 mt-1 font-bold">TX POWER: +30 dBm</div>
            </div>

            {/* Mesh Lines Connector Graphic */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full h-0.5 bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-500 relative flex items-center justify-center">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-emerald-300 font-bold border border-emerald-500/40">
                  5.8GHz HIGH-THROUGHPUT RELAY LINK
                </span>
              </div>
            </div>

            {/* Active Relay Node */}
            <div className="p-4 rounded-xl bg-slate-900 border-2 border-emerald-500 text-center shadow-lg shadow-emerald-500/20">
              <Zap className="w-8 h-8 text-emerald-400 mx-auto mb-1 animate-pulse" />
              <div className="font-bold text-emerald-300">
                ACTIVE RELAY ({activeRelayId ? activeRelayId.toUpperCase() : 'NONE'})
              </div>
              <div className="text-[10px] text-slate-400">High Altitude Sky Anchor (110m)</div>
              <div className="text-[10px] text-emerald-400 mt-1 font-bold">REPEATER ONLINE</div>
            </div>
          </div>
        </div>

        {/* Individual Node Link Telemetry Table */}
        <div className="space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Mesh Node Link Status & Attenuation Metrics
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {drones.map((d) => {
              const isRelay = d.id === activeRelayId;
              const isDown = d.status === 'FAILED' || d.status === 'DISCONNECTED';

              return (
                <div
                  key={d.id}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    isRelay
                      ? 'bg-emerald-950/30 border-emerald-500/60'
                      : isDown
                      ? 'bg-rose-950/30 border-rose-800/60'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <div>
                      <div className="font-bold text-slate-200">
                        {d.name} ({d.callsign})
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Signal: {d.health.signalStrengthDbm} dBm | Packet Loss: {d.health.packetLossPercent}% | Latency: 18ms
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isRelay
                        ? 'bg-emerald-500 text-slate-950'
                        : isDown
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {isRelay ? 'PRIMARY RELAY' : isDown ? 'OFFLINE' : 'MESH NODE'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
