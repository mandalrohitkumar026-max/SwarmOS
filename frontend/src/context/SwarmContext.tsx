import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  SwarmFullState,
  DroneTelemetry,
  MissionTask,
  CVDetection,
  SLAMMode,
  ObjectDetectionType,
} from '@swarmos/shared';
import { getSocket } from '../services/socket';
import { api } from '../services/api';

interface SwarmContextType {
  state: SwarmFullState | null;
  isConnected: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedDroneId: string | null;
  setSelectedDroneId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  // Commands
  sendSimulationControl: (action: 'start' | 'pause' | 'step' | 'reset', speed?: 1 | 2 | 5 | 10) => Promise<void>;
  launchDemo: () => Promise<void>;
  stopDemo: () => Promise<void>;
  triggerChaos: (
    eventType: 'FAIL_DRONE' | 'DISCONNECT' | 'LOW_BATTERY' | 'COLLISION_RISK' | 'SPAWN_SURVIVOR',
    params?: { droneId?: string; droneAId?: string; droneBId?: string; reason?: string }
  ) => Promise<void>;
  setDroneSlamMode: (droneId: string, mode: SLAMMode) => Promise<void>;
  injectDetection: (droneId: string, type: ObjectDetectionType, confidence?: number, description?: string) => Promise<void>;
  createTask: (task: Partial<MissionTask>) => Promise<void>;
}

const SwarmContext = createContext<SwarmContextType | undefined>(undefined);

export const SwarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SwarmFullState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    // Initial fetch
    api.getFullState()
      .then((data) => {
        setState(data);
        setIsConnected(true);
      })
      .catch((err) => console.error('Initial state fetch error:', err));

    // Connect WebSocket
    const socket = getSocket();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('swarm:state', (newState: SwarmFullState) => {
      setState(newState);
      setIsConnected(true);
    });

    // Keyboard shortcut for Cmd/Ctrl+K search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const sendSimulationControl = async (action: 'start' | 'pause' | 'step' | 'reset', speed?: 1 | 2 | 5 | 10) => {
    try {
      await api.sendSimulationControl(action, speed);
    } catch (e) {
      console.error(e);
    }
  };

  const launchDemo = async () => {
    try {
      await api.triggerDemo('start');
      setActiveTab('live-map');
    } catch (e) {
      console.error(e);
    }
  };

  const stopDemo = async () => {
    try {
      await api.triggerDemo('stop');
    } catch (e) {
      console.error(e);
    }
  };

  const triggerChaos = async (
    eventType: 'FAIL_DRONE' | 'DISCONNECT' | 'LOW_BATTERY' | 'COLLISION_RISK' | 'SPAWN_SURVIVOR',
    params?: { droneId?: string; droneAId?: string; droneBId?: string; reason?: string }
  ) => {
    try {
      await api.triggerChaos(eventType, params);
    } catch (e) {
      console.error(e);
    }
  };

  const setDroneSlamMode = async (droneId: string, mode: SLAMMode) => {
    try {
      await api.setDroneSlamMode(droneId, mode);
    } catch (e) {
      console.error(e);
    }
  };

  const injectDetection = async (
    droneId: string,
    type: ObjectDetectionType,
    confidence = 95,
    description?: string
  ) => {
    try {
      await api.injectDetection(droneId, type, confidence, description);
    } catch (e) {
      console.error(e);
    }
  };

  const createTask = async (task: Partial<MissionTask>) => {
    try {
      await api.createTask(task);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SwarmContext.Provider
      value={{
        state,
        isConnected,
        activeTab,
        setActiveTab,
        selectedDroneId,
        setSelectedDroneId,
        selectedTaskId,
        setSelectedTaskId,
        isSearchOpen,
        setIsSearchOpen,
        sendSimulationControl,
        launchDemo,
        stopDemo,
        triggerChaos,
        setDroneSlamMode,
        injectDetection,
        createTask,
      }}
    >
      {children}
    </SwarmContext.Provider>
  );
};

export const useSwarm = (): SwarmContextType => {
  const context = useContext(SwarmContext);
  if (!context) {
    throw new Error('useSwarm must be used within a SwarmProvider');
  }
  return context;
};
