import {
  SwarmFullState,
  DroneTelemetry,
  MissionTask,
  Mission,
  CVDetection,
  CollisionConflict,
  NetworkTopology,
  AIDecisionLog,
  AnalyticsMetrics,
  SimulationControls,
  SLAMMode,
  ObjectDetectionType,
} from '@swarmos/shared';

const API_BASE = '/api';

export const api = {
  async getFullState(): Promise<SwarmFullState> {
    const res = await fetch(`${API_BASE}/state`);
    if (!res.ok) throw new Error('Failed to fetch full state');
    return res.json();
  },

  async getDrones(): Promise<DroneTelemetry[]> {
    const res = await fetch(`${API_BASE}/drones`);
    return res.json();
  },

  async setDroneSlamMode(droneId: string, mode: SLAMMode) {
    const res = await fetch(`${API_BASE}/drones/${droneId}/slam-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    return res.json();
  },

  async createTask(task: Partial<MissionTask>) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return res.json();
  },

  async sendSimulationControl(action: 'start' | 'pause' | 'step' | 'reset', speed?: 1 | 2 | 5 | 10) {
    const res = await fetch(`${API_BASE}/simulation/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, speed }),
    });
    return res.json();
  },

  async triggerChaos(
    eventType: 'FAIL_DRONE' | 'DISCONNECT' | 'LOW_BATTERY' | 'COLLISION_RISK' | 'SPAWN_SURVIVOR',
    params?: { droneId?: string; droneAId?: string; droneBId?: string; reason?: string }
  ) {
    const res = await fetch(`${API_BASE}/simulation/chaos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, ...params }),
    });
    return res.json();
  },

  async triggerDemo(action: 'start' | 'stop') {
    const res = await fetch(`${API_BASE}/simulation/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    return res.json();
  },

  async injectDetection(droneId: string, type: ObjectDetectionType, confidence = 95, description?: string) {
    const res = await fetch(`${API_BASE}/detections/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ droneId, type, confidence, description }),
    });
    return res.json();
  },
};
