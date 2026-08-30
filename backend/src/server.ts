import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { SimulationManager } from './simulation/SimulationManager';
import { createApiRouter } from './routes/api';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT'],
  },
});

app.use(cors());
app.use(express.json());

// Initialize Swarm Simulation Manager
const simManager = new SimulationManager();
simManager.setSocketServer(io);

// Mount API Routes
app.use('/api', createApiRouter(simManager));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'SwarmOS Backend & Autonomous Simulation Engine',
    uptime: process.uptime(),
    activeDrones: simManager.getFullState().drones.length,
  });
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);

  // Send initial state snapshot immediately
  socket.emit('swarm:state', simManager.getFullState());

  socket.on('command:simulation', (data) => {
    const { action, speed } = data;
    if (action === 'start') simManager.startSimulation();
    else if (action === 'pause') simManager.pauseSimulation();
    else if (action === 'step') simManager.stepSimulation();
    else if (action === 'reset') simManager.resetSimulation();
    if (speed) simManager.setSpeed(speed);
    io.emit('swarm:state', simManager.getFullState());
  });

  socket.on('command:demo', (data) => {
    if (data.action === 'start') simManager.launchDemo();
    else simManager.stopDemo();
    io.emit('swarm:state', simManager.getFullState());
  });

  socket.on('command:chaos', (data) => {
    const { eventType, droneId, droneAId, droneBId, reason } = data;
    if (eventType === 'FAIL_DRONE') {
      simManager.triggerDroneFailure(droneId, reason || 'Injected Chaos Failure', 'FAILED');
    } else if (eventType === 'DISCONNECT') {
      simManager.triggerDisconnect(droneId);
    } else if (eventType === 'LOW_BATTERY') {
      simManager.triggerLowBattery(droneId);
    } else if (eventType === 'COLLISION_RISK') {
      simManager.triggerCollisionRisk(droneAId || 'drone-01', droneBId || 'drone-04');
    } else if (eventType === 'SPAWN_SURVIVOR') {
      simManager.injectDetection(droneId || 'drone-02', 'PERSON', 96, 'Trapped survivor in building collapse void');
    }
    io.emit('swarm:state', simManager.getFullState());
  });

  socket.on('command:slam_mode', (data) => {
    const { droneId, mode } = data;
    simManager.setDroneSlamMode(droneId, mode);
    io.emit('swarm:state', simManager.getFullState());
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

// Start simulation loop
simManager.startSimulation();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 SwarmOS Engine listening on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready for real-time mission telemetry`);
});
