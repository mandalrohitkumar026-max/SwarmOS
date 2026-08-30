import React, { useState } from 'react';
import { useSwarm } from '../context/SwarmContext';
import {
  Eye,
  Camera,
  Flame,
  Radio,
  Plus,
  Crosshair,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  Layers,
  Thermometer,
} from 'lucide-react';
import { ObjectDetectionType } from '@swarmos/shared';

export const AIDetectionView: React.FC = () => {
  const { state, injectDetection } = useSwarm();

  const detections = state?.detections || [];
  const drones = state?.drones || [];

  const [selectedFeedDroneId, setSelectedFeedDroneId] = useState<string>('drone-02');
  const [thermalPalette, setThermalPalette] = useState<'IRONBOW' | 'RAINBOW' | 'GRAYSCALE'>('IRONBOW');

  const handleInject = (type: ObjectDetectionType) => {
    injectDetection(selectedFeedDroneId, type, Math.round(88 + Math.random() * 10));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="hud-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <span>AI Computer Vision & Multi-Spectrum Sensor Feeds</span>
          </h1>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Real-time optical object localization, radiometric FLIR infrared clustering, and structural hazard segmentation.
          </p>
        </div>

        {/* Quick Detection Injectors */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleInject('PERSON')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold flex items-center space-x-1.5 transition-colors"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Simulate Survivor</span>
          </button>
          <button
            onClick={() => handleInject('HEAT_SIGNATURE')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold flex items-center space-x-1.5 transition-colors"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Simulate Heat Void</span>
          </button>
          <button
            onClick={() => handleInject('BLOCKED_ROAD')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Blocked Road</span>
          </button>
        </div>
      </div>

      {/* 4-Channel Simulated Video Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Feed 1: Drone 01 (Mapper - 3D Ortho / Optical) */}
        <div className="hud-panel overflow-hidden flex flex-col border-cyan-500/40">
          <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-bold text-slate-100">CAM-01: SPECTER-1 (Drone 01 — Mapper)</span>
            </div>
            <span className="text-[10px] text-cyan-400">4K OPTICAL RGB / 60 FPS</span>
          </div>

          <div className="relative h-60 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 flex items-center justify-center overflow-hidden">
            {/* Simulated camera background graphics */}
            <div className="absolute inset-0 bg-grid-tactical opacity-30" />
            <div className="absolute inset-0 scanlines" />

            {/* Crosshair HUD */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 border border-cyan-500/30 rounded-full flex items-center justify-center">
                <Crosshair className="w-6 h-6 text-cyan-400/50" />
              </div>
            </div>

            {/* Bounding box for Blocked Road / Structural crack */}
            <div className="absolute top-12 left-16 w-36 h-28 border-2 border-amber-400 bg-amber-500/10 rounded">
              <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-extrabold">
                BLOCKED_ROAD 92%
              </span>
            </div>

            {/* Bottom HUD overlay */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-950/80 px-2 py-1 rounded backdrop-blur-sm">
              <span>LAT: 37.7772° | LNG: -122.4185°</span>
              <span className="text-emerald-400">SLAM HYBRID: 98%</span>
            </div>
          </div>
        </div>

        {/* Feed 2: Drone 02 (Search - Civilian AI Detector) */}
        <div className="hud-panel overflow-hidden flex flex-col border-blue-500/40">
          <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-bold text-slate-100">CAM-02: SEEKER-2 (Drone 02 — Search)</span>
            </div>
            <span className="text-[10px] text-blue-400">SURVIVOR NEURAL NET v4.2</span>
          </div>

          <div className="relative h-60 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-grid-tactical opacity-30" />
            <div className="absolute inset-0 scanlines" />

            {/* Prominent Survivor Bounding Box */}
            <div className="absolute top-10 right-20 w-32 h-36 border-2 border-rose-500 bg-rose-500/15 rounded animate-pulse">
              <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-extrabold flex items-center space-x-1">
                <HeartHandshake className="w-2.5 h-2.5 inline" />
                <span>PERSON 95%</span>
              </span>
              <span className="absolute bottom-1 right-1 text-[8px] text-rose-300 font-mono">
                RUBBLE VOID B-14
              </span>
            </div>

            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-950/80 px-2 py-1 rounded backdrop-blur-sm">
              <span className="text-rose-400 font-bold">CASUALTY CONFIRMATION QUEUED</span>
              <span>CONFIDENCE: 95.4%</span>
            </div>
          </div>
        </div>

        {/* Feed 3: Drone 03 (Relay - Sky Mesh & C2 Anchor) */}
        <div className="hud-panel overflow-hidden flex flex-col border-emerald-500/40">
          <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-slate-100">CAM-03: NEXUS-3 (Drone 03 — Relay)</span>
            </div>
            <span className="text-[10px] text-emerald-400">HIGH-ALTITUDE SKYVIEW (110m)</span>
          </div>

          <div className="relative h-60 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-grid-tactical opacity-25" />
            <div className="absolute inset-0 scanlines" />

            {/* Broad tactical overview with mesh links */}
            <div className="text-center text-slate-400 space-y-1">
              <Radio className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
              <div className="font-bold text-slate-200">5.8GHz HIGH-BANDWIDTH MESH BRIDGE</div>
              <div className="text-[10px] text-emerald-300">LINK: 4 NODES SYNCED | 99.8% UPTIME</div>
            </div>

            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-950/80 px-2 py-1 rounded backdrop-blur-sm">
              <span>RELAY LATENCY: 18ms</span>
              <span className="text-emerald-400">ANCHOR HEALTH: 100%</span>
            </div>
          </div>
        </div>

        {/* Feed 4: Drone 04 (Thermal - FLIR Radiometric Infrared) */}
        <div className="hud-panel overflow-hidden flex flex-col border-amber-500/40">
          <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold text-slate-100">CAM-04: PYRO-4 (Drone 04 — Thermal FLIR)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-amber-400">RADIOMETRIC LWIR</span>
              <select
                value={thermalPalette}
                onChange={(e) => setThermalPalette(e.target.value as any)}
                className="bg-slate-900 text-slate-200 text-[10px] rounded px-1.5 py-0.5 border border-slate-800"
              >
                <option value="IRONBOW">Ironbow</option>
                <option value="RAINBOW">Rainbow</option>
                <option value="GRAYSCALE">Grayscale</option>
              </select>
            </div>
          </div>

          <div
            className={`relative h-60 flex items-center justify-center overflow-hidden ${
              thermalPalette === 'IRONBOW'
                ? 'bg-gradient-to-br from-purple-950 via-rose-950 to-amber-950'
                : thermalPalette === 'RAINBOW'
                ? 'bg-gradient-to-br from-blue-950 via-green-950 to-red-950'
                : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
            }`}
          >
            <div className="absolute inset-0 scanlines" />

            {/* Thermal Hotspot Box */}
            <div className="absolute top-14 left-24 w-28 h-28 border-2 border-amber-400 bg-amber-500/30 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-[10px] font-extrabold text-white bg-slate-950/80 px-2 py-0.5 rounded border border-amber-400">
                37.4°C (SURVIVOR)
              </span>
            </div>

            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-amber-200 font-mono bg-slate-950/80 px-2 py-1 rounded backdrop-blur-sm">
              <span>THERMAL GRADIENT: 18.2°C — 84.5°C</span>
              <span className="text-amber-400 font-bold">BIOMETRIC MATCH CONFIRMED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detections Audit History Stream */}
      <div className="hud-panel p-4 space-y-3">
        <h2 className="text-sm font-bold text-slate-200 uppercase border-b border-slate-800 pb-2 flex items-center justify-between">
          <span>Real-Time AI Detections Feed ({detections.length} objects)</span>
          <span className="text-[10px] text-slate-400">AUTO LOGGED TO GEODATABASE</span>
        </h2>

        <div className="space-y-2">
          {detections.map((det) => (
            <div
              key={det.id}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`p-2 rounded-lg font-extrabold text-xs ${
                    det.type === 'PERSON'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : det.type === 'HEAT_SIGNATURE'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}
                >
                  {det.type}
                </span>

                <div>
                  <div className="font-bold text-slate-100 flex items-center space-x-2">
                    <span>{det.description}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      ({det.confidence.toFixed(1)}% Confidence)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Drone: {det.droneId.toUpperCase()} | Sector: {det.sectorCode} | Coords: ({det.location.lat.toFixed(4)}, {det.location.lng.toFixed(4)})
                    {det.thermalTempC && ` | Temp: ${det.thermalTempC}°C`}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                    det.status === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {det.status}
                </span>
                <div className="text-[9px] text-slate-500 mt-1">
                  {new Date(det.timestamp).toTimeString().split(' ')[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
