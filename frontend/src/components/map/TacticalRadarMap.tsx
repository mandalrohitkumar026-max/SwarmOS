import React, { useRef, useEffect, useState } from 'react';
import { useSwarm } from '../../context/SwarmContext';
import { DroneTelemetry, DisasterSector, CVDetection, CollisionConflict, SIMULATION_CENTER } from '@swarmos/shared';
import { Layers, ZoomIn, ZoomOut, Compass, Crosshair, AlertTriangle, ShieldCheck, Eye, Activity } from 'lucide-react';

interface TacticalRadarMapProps {
  onSelectDrone?: (droneId: string) => void;
  selectedDroneId?: string | null;
  interactive?: boolean;
}

export const TacticalRadarMap: React.FC<TacticalRadarMapProps> = ({
  onSelectDrone,
  selectedDroneId,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { state, setSelectedDroneId } = useSwarm();

  const [zoom, setZoom] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [layerToggles, setLayerToggles] = useState({
    sectors: true,
    trails: true,
    heatmap: true,
    conflicts: true,
    detections: true,
    meshLinks: true,
  });

  const drones = state?.drones || [];
  const sectors = state?.sectors || [];
  const detections = state?.detections || [];
  const conflicts = state?.conflicts || [];
  const network = state?.network;

  // Coordinate Conversion Helper: Lat/Lng -> Canvas X/Y relative to SIMULATION_CENTER
  const projectGeoToCanvas = (
    lat: number,
    lng: number,
    width: number,
    height: number
  ): { x: number; y: number } => {
    const scale = 24000 * zoom; // pixels per degree
    const cx = width / 2 + panOffset.x;
    const cy = height / 2 + panOffset.y;

    const x = cx + (lng - SIMULATION_CENTER.lng) * scale;
    const y = cy - (lat - SIMULATION_CENTER.lat) * scale; // inverted Y for screen
    return { x, y };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // 1. Clear background & Tactical Dark Grid
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // Draw Subtle Grid
    const gridSize = 40 * zoom;
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = (panOffset.x % gridSize); x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = (panOffset.y % gridSize); y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Draw Concentric Tactical Range Rings around Simulation Center
    const centerPt = projectGeoToCanvas(SIMULATION_CENTER.lat, SIMULATION_CENTER.lng, width, height);
    [200, 400, 700, 1000].forEach((radiusMeters, idx) => {
      const pxRadius = (radiusMeters / 1000) * 220 * zoom;
      ctx.strokeStyle = idx === 3 ? 'rgba(6, 182, 212, 0.25)' : 'rgba(51, 65, 85, 0.35)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(centerPt.x, centerPt.y, pxRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Range label
      ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(`${radiusMeters}m`, centerPt.x + pxRadius + 4, centerPt.y - 4);
    });

    // 2. Draw Sectors (Polygons with Search Status)
    if (layerToggles.sectors) {
      sectors.forEach((sec) => {
        if (!sec.bounds || sec.bounds.length === 0) return;
        const pts = sec.bounds.map((b) => projectGeoToCanvas(b.lat, b.lng, width, height));

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.closePath();

        // Color based on exploration and priority
        let fillColor = 'rgba(30, 41, 59, 0.2)';
        let strokeColor = 'rgba(71, 85, 105, 0.5)';
        if (sec.priority === 'CRITICAL') {
          fillColor = `rgba(244, 63, 94, ${0.08 + (sec.explorationPercent / 100) * 0.12})`;
          strokeColor = 'rgba(244, 63, 94, 0.6)';
        } else if (sec.priority === 'HIGH') {
          fillColor = `rgba(245, 158, 11, ${0.08 + (sec.explorationPercent / 100) * 0.12})`;
          strokeColor = 'rgba(245, 158, 11, 0.6)';
        } else {
          fillColor = `rgba(6, 182, 212, ${0.06 + (sec.explorationPercent / 100) * 0.12})`;
          strokeColor = 'rgba(6, 182, 212, 0.5)';
        }

        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Sector Header Label & Exploration Gauge
        const secCenter = projectGeoToCanvas(sec.center.lat, sec.center.lng, width, height);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(sec.code, secCenter.x, secCenter.y - 10);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`${sec.explorationPercent.toFixed(0)}% SCANNED`, secCenter.x, secCenter.y + 4);

        if (sec.assignedDroneId) {
          ctx.fillStyle = '#38bdf8';
          ctx.font = '8px JetBrains Mono, monospace';
          ctx.fillText(`ASSIGNED: ${sec.assignedDroneId.toUpperCase()}`, secCenter.x, secCenter.y + 16);
        }
      });
    }

    // 3. Draw Mesh Network Links (Lines between Drones & GCS)
    if (layerToggles.meshLinks && network && network.links) {
      network.links.forEach((link) => {
        const fromDrone = drones.find((d) => d.id === link.fromId);
        const toDrone = drones.find((d) => d.id === link.toId);
        const fromPt = fromDrone
          ? projectGeoToCanvas(fromDrone.position.lat, fromDrone.position.lng, width, height)
          : centerPt;
        const toPt = toDrone
          ? projectGeoToCanvas(toDrone.position.lat, toDrone.position.lng, width, height)
          : centerPt;

        ctx.strokeStyle = link.isRelayRoute
          ? 'rgba(16, 185, 129, 0.6)'
          : link.qualityScore > 60
          ? 'rgba(6, 182, 212, 0.4)'
          : 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = link.isRelayRoute ? 2 : 1;
        ctx.setLineDash(link.isRelayRoute ? [] : [3, 4]);
        ctx.beginPath();
        ctx.moveTo(fromPt.x, fromPt.y);
        ctx.lineTo(toPt.x, toPt.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // 4. Draw Collision Conflict Risk Vectors
    if (layerToggles.conflicts) {
      conflicts.forEach((c) => {
        if (c.resolved) return;
        const dA = drones.find((d) => d.id === c.droneAId);
        const dB = drones.find((d) => d.id === c.droneBId);
        if (dA && dB) {
          const ptA = projectGeoToCanvas(dA.position.lat, dA.position.lng, width, height);
          const ptB = projectGeoToCanvas(dB.position.lat, dB.position.lng, width, height);

          // Pulsing Warning Line
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(ptA.x, ptA.y);
          ctx.lineTo(ptB.x, ptB.y);
          ctx.stroke();

          // Midpoint Warning Tag
          const midX = (ptA.x + ptB.x) / 2;
          const midY = (ptA.y + ptB.y) / 2;
          ctx.fillStyle = '#f43f5e';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.fillText(`⚠ CONFLICT (${c.distanceMeters}m)`, midX, midY - 6);
        }
      });
    }

    // 5. Draw CV Detections
    if (layerToggles.detections) {
      detections.slice(0, 8).forEach((det) => {
        const pt = projectGeoToCanvas(det.location.lat, det.location.lng, width, height);
        const isSurvivor = det.type === 'PERSON';

        ctx.fillStyle = isSurvivor ? 'rgba(244, 63, 94, 0.9)' : 'rgba(245, 158, 11, 0.9)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSurvivor ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing ring for survivors
        if (isSurvivor) {
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          `${det.type} (${det.confidence.toFixed(0)}%)`,
          pt.x + 10,
          pt.y + 3
        );
      });
    }

    // 6. Draw Drones
    drones.forEach((drone) => {
      const pt = projectGeoToCanvas(drone.position.lat, drone.position.lng, width, height);
      const isSelected = selectedDroneId === drone.id;
      const isFailed = drone.status === 'FAILED' || drone.status === 'DISCONNECTED';

      // Flight Path Trail / Waypoint vector
      if (layerToggles.trails && drone.targetPosition) {
        const targetPt = projectGeoToCanvas(
          drone.targetPosition.lat,
          drone.targetPosition.lng,
          width, height
        );
        ctx.strokeStyle = `${drone.color}55`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(targetPt.x, targetPt.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Safety Radius Circle (25m)
      const safetyRadiusPx = (25 / 1000) * 220 * zoom;
      ctx.strokeStyle = isFailed
        ? 'rgba(244, 63, 94, 0.4)'
        : isSelected
        ? `${drone.color}99`
        : `${drone.color}33`;
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, safetyRadiusPx, 0, Math.PI * 2);
      ctx.stroke();

      // Drone Center Icon / Marker
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(((drone.heading || 0) * Math.PI) / 180);

      // Drone Chevron Body
      ctx.fillStyle = isFailed ? '#ef4444' : drone.color;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(8, 8);
      ctx.lineTo(0, 4);
      ctx.lineTo(-8, 8);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Hover / Selection Ring
      if (isSelected) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 16, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Telemetry Tag beside Drone Marker
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(drone.callsign, pt.x + 12, pt.y - 6);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillText(
        `ALT:${drone.altitude}m | BAT:${drone.battery.toFixed(0)}%`,
        pt.x + 12,
        pt.y + 6
      );

      if (isFailed) {
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.fillText(`STATUS: ${drone.status}`, pt.x + 12, pt.y + 16);
      }
    });
  }, [drones, sectors, detections, conflicts, network, zoom, panOffset, selectedDroneId, layerToggles]);

  // Mouse Interaction handlers for Pan & Zoom & Drone Selection
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked near any drone
    for (const drone of drones) {
      const pt = projectGeoToCanvas(
        drone.position.lat,
        drone.position.lng,
        rect.width,
        rect.height
      );
      const dist = Math.sqrt((clickX - pt.x) ** 2 + (clickY - pt.y) ** 2);
      if (dist < 22) {
        setSelectedDroneId(drone.id);
        if (onSelectDrone) onSelectDrone(drone.id);
        return;
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-[#060a12] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Tactical Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Top Left HUD Overlays */}
      <div className="absolute top-3 left-3 flex flex-col space-y-2 pointer-events-none font-mono">
        <div className="hud-panel px-3 py-2 text-xs flex items-center space-x-3 pointer-events-auto">
          <div className="flex items-center space-x-1.5 text-cyan-400">
            <Crosshair className="w-3.5 h-3.5" />
            <span className="font-bold">TACTICAL RADAR C2</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 text-[11px]">EPICENTER: 37.7749°N, 122.4194°W</span>
        </div>
      </div>

      {/* Layer Toggles & Zoom Controls */}
      <div className="absolute top-3 right-3 flex items-center space-x-2 font-mono text-xs">
        {/* Layer Filter Menu */}
        <div className="hud-panel px-2.5 py-1.5 flex items-center space-x-2 text-[11px]">
          <button
            onClick={() => setLayerToggles((p) => ({ ...p, sectors: !p.sectors }))}
            className={`px-2 py-1 rounded transition-colors ${
              layerToggles.sectors ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500'
            }`}
          >
            Sectors
          </button>
          <button
            onClick={() => setLayerToggles((p) => ({ ...p, meshLinks: !p.meshLinks }))}
            className={`px-2 py-1 rounded transition-colors ${
              layerToggles.meshLinks ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-500'
            }`}
          >
            Mesh
          </button>
          <button
            onClick={() => setLayerToggles((p) => ({ ...p, detections: !p.detections }))}
            className={`px-2 py-1 rounded transition-colors ${
              layerToggles.detections ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500'
            }`}
          >
            CV Pins
          </button>
        </div>

        {/* Zoom In / Out / Reset */}
        <div className="hud-panel p-1 flex items-center space-x-1">
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1.0);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
            title="Reset View"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 hud-panel px-3 py-2 flex items-center space-x-4 text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>D01 Mapper</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>D02 Search</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>D03 Relay</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>D04 Thermal</span>
        </div>
      </div>
    </div>
  );
};
