"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRouter = createApiRouter;
const express_1 = require("express");
function createApiRouter(sim) {
    const router = (0, express_1.Router)();
    // Drones
    router.get('/drones', (req, res) => {
        const state = sim.getFullState();
        res.json(state.drones);
    });
    router.get('/drones/:id', (req, res) => {
        const drone = sim.getDrone(req.params.id);
        if (!drone)
            return res.status(404).json({ error: 'Drone not found' });
        res.json(drone);
    });
    router.post('/drones/:id/slam-mode', (req, res) => {
        const { mode } = req.body;
        sim.setDroneSlamMode(req.params.id, mode);
        res.json({ success: true, drone: sim.getDrone(req.params.id) });
    });
    // Missions
    router.get('/missions', (req, res) => {
        const state = sim.getFullState();
        res.json(state.mission);
    });
    // Tasks
    router.get('/tasks', (req, res) => {
        const state = sim.getFullState();
        res.json(state.tasks);
    });
    router.post('/tasks', (req, res) => {
        const { title, type, priority, location, sectorCode, requiredCapability } = req.body;
        const newTask = {
            id: `task-${Date.now()}`,
            missionId: 'mission-alpha-7',
            type: type || 'SEARCH',
            title: title || 'Ad-Hoc Search Sector',
            description: 'Operator commanded ad-hoc search vector.',
            sectorCode: sectorCode || 'SEC-AD-HOC',
            priority: priority || 'HIGH',
            location: location || { lat: 37.776, lng: -122.416, alt: 50 },
            targetRadiusMeters: 80,
            requiredCapability: requiredCapability || 'SEARCH',
            status: 'PENDING',
            assignedDroneId: null,
            progress: 0,
            deadlineSeconds: 300,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        const state = sim.getFullState();
        const alloc = sim.intelligenceEngine.allocateTask(newTask, state.drones, state.tasks);
        newTask.assignedDroneId = alloc.assignedDroneId;
        newTask.scoreBreakdowns = alloc.scoreBreakdowns;
        newTask.status = alloc.assignedDroneId ? 'IN_PROGRESS' : 'PENDING';
        state.tasks.unshift(newTask);
        if (alloc.decisionLog) {
            state.decisionLogs.unshift(alloc.decisionLog);
        }
        res.json({ success: true, task: newTask });
    });
    // Detections
    router.get('/detections', (req, res) => {
        const state = sim.getFullState();
        res.json(state.detections);
    });
    router.post('/detections/inject', (req, res) => {
        const { droneId, type, confidence, description } = req.body;
        const result = sim.injectDetection(droneId || 'drone-02', type || 'PERSON', confidence || 95, description);
        res.json({ success: true, result });
    });
    // Assignments
    router.get('/assignments', (req, res) => {
        const state = sim.getFullState();
        const assignments = state.tasks.map((t) => ({
            taskId: t.id,
            taskTitle: t.title,
            assignedDroneId: t.assignedDroneId,
            scores: t.scoreBreakdowns,
        }));
        res.json(assignments);
    });
    // Simulation Controls & Chaos
    router.get('/simulation', (req, res) => {
        const state = sim.getFullState();
        res.json(state.simulation);
    });
    router.post('/simulation/control', (req, res) => {
        const { action, speed } = req.body;
        if (action === 'start')
            sim.startSimulation();
        else if (action === 'pause')
            sim.pauseSimulation();
        else if (action === 'step')
            sim.stepSimulation();
        else if (action === 'reset')
            sim.resetSimulation();
        if (speed)
            sim.setSpeed(speed);
        res.json({ success: true, simulation: sim.getFullState().simulation });
    });
    router.post('/simulation/demo', (req, res) => {
        const { action } = req.body;
        if (action === 'start')
            sim.launchDemo();
        else
            sim.stopDemo();
        res.json({ success: true, isDemoActive: sim.demoRunner.getIsRunning() });
    });
    router.post('/simulation/chaos', (req, res) => {
        const { eventType, droneId, droneAId, droneBId, reason } = req.body;
        if (eventType === 'FAIL_DRONE') {
            const result = sim.triggerDroneFailure(droneId || 'drone-01', reason || 'Rotor Motor Electrical Failure', 'FAILED');
            return res.json({ success: true, result });
        }
        if (eventType === 'DISCONNECT') {
            const result = sim.triggerDisconnect(droneId || 'drone-02');
            return res.json({ success: true, result });
        }
        if (eventType === 'LOW_BATTERY') {
            const result = sim.triggerLowBattery(droneId || 'drone-03');
            return res.json({ success: true, result });
        }
        if (eventType === 'COLLISION_RISK') {
            const result = sim.triggerCollisionRisk(droneAId || 'drone-01', droneBId || 'drone-04');
            return res.json({ success: true, result });
        }
        if (eventType === 'SPAWN_SURVIVOR') {
            const result = sim.injectDetection(droneId || 'drone-02', 'PERSON', 96, 'Trapped survivor in building collapse void');
            return res.json({ success: true, result });
        }
        res.status(400).json({ error: 'Unknown chaos event type' });
    });
    // Network
    router.get('/network', (req, res) => {
        const state = sim.getFullState();
        res.json(state.network);
    });
    // Incidents
    router.get('/incidents', (req, res) => {
        const state = sim.getFullState();
        res.json(state.conflicts);
    });
    // Analytics
    router.get('/analytics', (req, res) => {
        const state = sim.getFullState();
        res.json(state.analytics);
    });
    // Events / Decision logs
    router.get('/events', (req, res) => {
        const state = sim.getFullState();
        res.json(state.decisionLogs);
    });
    // Full Swarm State snapshot
    router.get('/state', (req, res) => {
        res.json(sim.getFullState());
    });
    return router;
}
