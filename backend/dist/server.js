"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const SimulationManager_1 = require("./simulation/SimulationManager");
const api_1 = require("./routes/api");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'PUT'],
    },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize Swarm Simulation Manager
const simManager = new SimulationManager_1.SimulationManager();
simManager.setSocketServer(io);
// Mount API Routes
app.use('/api', (0, api_1.createApiRouter)(simManager));
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
        if (action === 'start')
            simManager.startSimulation();
        else if (action === 'pause')
            simManager.pauseSimulation();
        else if (action === 'step')
            simManager.stepSimulation();
        else if (action === 'reset')
            simManager.resetSimulation();
        if (speed)
            simManager.setSpeed(speed);
        io.emit('swarm:state', simManager.getFullState());
    });
    socket.on('command:demo', (data) => {
        if (data.action === 'start')
            simManager.launchDemo();
        else
            simManager.stopDemo();
        io.emit('swarm:state', simManager.getFullState());
    });
    socket.on('command:chaos', (data) => {
        const { eventType, droneId, droneAId, droneBId, reason } = data;
        if (eventType === 'FAIL_DRONE') {
            simManager.triggerDroneFailure(droneId, reason || 'Injected Chaos Failure', 'FAILED');
        }
        else if (eventType === 'DISCONNECT') {
            simManager.triggerDisconnect(droneId);
        }
        else if (eventType === 'LOW_BATTERY') {
            simManager.triggerLowBattery(droneId);
        }
        else if (eventType === 'COLLISION_RISK') {
            simManager.triggerCollisionRisk(droneAId || 'drone-01', droneBId || 'drone-04');
        }
        else if (eventType === 'SPAWN_SURVIVOR') {
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
