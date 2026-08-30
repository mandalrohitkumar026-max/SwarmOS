"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationManager = void 0;
const shared_1 = require("@swarmos/shared");
const SwarmIntelligenceEngine_1 = require("../core/SwarmIntelligenceEngine");
const CollisionAvoidanceEngine_1 = require("../core/CollisionAvoidanceEngine");
const FailureRecoveryEngine_1 = require("../core/FailureRecoveryEngine");
const CVDetectionEngine_1 = require("../core/CVDetectionEngine");
const NetworkTopologyEngine_1 = require("../core/NetworkTopologyEngine");
const NavigationSLAMEngine_1 = require("../core/NavigationSLAMEngine");
const DisasterScenario_1 = require("./DisasterScenario");
const DemoScriptRunner_1 = require("./DemoScriptRunner");
class SimulationManager {
    io = null;
    intervalTimer = null;
    // Engines
    intelligenceEngine;
    collisionEngine;
    failureRecoveryEngine;
    cvEngine;
    networkEngine;
    slamEngine;
    demoRunner;
    // State
    drones = [];
    tasks = [];
    sectors = [];
    mission = { ...shared_1.INITIAL_MISSION };
    conflicts = [];
    decisionLogs = [];
    network = {
        nodes: [],
        links: [],
        activeRelayId: 'drone-03',
        meshHealthScore: 98,
        averageLatencyMs: 24,
        coveragePercent: 100,
        isolatedNodeIds: [],
    };
    emergencyAlert = null;
    simulationControls = {
        isRunning: true,
        speed: 1,
        timeElapsedSeconds: 840,
        isDemoActive: false,
        demoPhaseIndex: 0,
        demoPhaseName: 'Autonomous Standby',
    };
    timeSeriesCoverage = [];
    timeSeriesBatteryDraw = [];
    tickCount = 0;
    constructor() {
        this.intelligenceEngine = new SwarmIntelligenceEngine_1.SwarmIntelligenceEngine();
        this.collisionEngine = new CollisionAvoidanceEngine_1.CollisionAvoidanceEngine();
        this.failureRecoveryEngine = new FailureRecoveryEngine_1.FailureRecoveryEngine(this.intelligenceEngine);
        this.cvEngine = new CVDetectionEngine_1.CVDetectionEngine();
        this.networkEngine = new NetworkTopologyEngine_1.NetworkTopologyEngine();
        this.slamEngine = new NavigationSLAMEngine_1.NavigationSLAMEngine();
        this.demoRunner = new DemoScriptRunner_1.DemoScriptRunner(this);
        this.resetSimulation();
    }
    setSocketServer(io) {
        this.io = io;
    }
    resetSimulation() {
        this.drones = JSON.parse(JSON.stringify(shared_1.INITIAL_DRONES));
        this.tasks = (0, DisasterScenario_1.createInitialTasks)();
        this.sectors = (0, DisasterScenario_1.createInitialSectors)();
        this.mission = { ...shared_1.INITIAL_MISSION, startTime: Date.now() };
        this.conflicts = [];
        this.decisionLogs = [
            {
                id: 'log-init-1',
                timestamp: Date.now() - 30000,
                category: 'MISSION_UPDATE',
                level: 'INFO',
                title: 'SwarmOS Core Kernel Initialized',
                what: 'Mission OPERATION METRO RESCUE loaded. Multi-Agent Task Allocation Engine online.',
                why: 'Urban earthquake disaster response profile activated.',
                decision: 'Connected 4 autonomous aerial units in decentralized mesh.',
            },
        ];
        this.emergencyAlert = null;
        this.simulationControls.timeElapsedSeconds = 0;
        this.timeSeriesCoverage = [
            { timestamp: Date.now() - 10000, coverage: 15, activeDrones: 4 },
            { timestamp: Date.now() - 5000, coverage: 35, activeDrones: 4 },
            { timestamp: Date.now(), coverage: 57.4, activeDrones: 4 },
        ];
        this.timeSeriesBatteryDraw = [
            { timestamp: Date.now() - 10000, avgBattery: 98 },
            { timestamp: Date.now() - 5000, avgBattery: 90 },
            { timestamp: Date.now(), avgBattery: 83.5 },
        ];
    }
    startSimulation() {
        this.simulationControls.isRunning = true;
        if (this.intervalTimer)
            clearInterval(this.intervalTimer);
        // 10Hz tick loop (every 100ms)
        this.intervalTimer = setInterval(() => this.tick(), 100);
    }
    pauseSimulation() {
        this.simulationControls.isRunning = false;
    }
    stepSimulation() {
        this.tick(true);
    }
    setSpeed(speed) {
        this.simulationControls.speed = speed;
    }
    getDrone(id) {
        return this.drones.find((d) => d.id === id);
    }
    getFullState() {
        const detections = this.cvEngine.getAllDetections();
        const detectionsByType = {
            PERSON: detections.filter((d) => d.type === 'PERSON').length,
            VEHICLE: detections.filter((d) => d.type === 'VEHICLE').length,
            DAMAGED_BUILDING: detections.filter((d) => d.type === 'DAMAGED_BUILDING').length,
            FIRE_SMOKE: detections.filter((d) => d.type === 'FIRE_SMOKE').length,
            BLOCKED_ROAD: detections.filter((d) => d.type === 'BLOCKED_ROAD').length,
            HEAT_SIGNATURE: detections.filter((d) => d.type === 'HEAT_SIGNATURE').length,
            UNKNOWN_OBJECT: detections.filter((d) => d.type === 'UNKNOWN_OBJECT').length,
        };
        const analytics = {
            missionCompletionPercent: Math.min(100, Number(this.mission.coveragePercent.toFixed(1))),
            searchCoveragePercent: Math.min(100, Number(this.mission.coveragePercent.toFixed(1))),
            tasksCompleted: this.tasks.filter((t) => t.status === 'COMPLETED').length,
            tasksReassignedCount: this.tasks.filter((t) => t.status === 'REASSIGNED' || t.previousDroneId).length,
            averageResponseTimeSeconds: 1.8,
            droneUtilizationPercent: Math.round((this.drones.filter((d) => d.status !== 'IDLE' && d.status !== 'FAILED').length /
                Math.max(1, this.drones.length)) *
                100),
            batteryEfficiencyScore: 92,
            detectionAccuracyPercent: 96.5,
            communicationUptimePercent: 99.4,
            collisionRisksAvoidedCount: this.collisionEngine.getAvoidedCount(),
            failedDroneRecoveryAvgTimeSeconds: this.failureRecoveryEngine.getAverageRecoveryTimeSeconds(),
            timeSeriesCoverage: this.timeSeriesCoverage,
            timeSeriesBatteryDraw: this.timeSeriesBatteryDraw,
            detectionsByType,
        };
        const demoPhase = this.demoRunner.getCurrentPhase();
        this.simulationControls.isDemoActive = this.demoRunner.getIsRunning();
        this.simulationControls.demoPhaseIndex = demoPhase.index;
        this.simulationControls.demoPhaseName = demoPhase.name;
        return {
            mission: this.mission,
            drones: this.drones,
            tasks: this.tasks,
            detections,
            conflicts: this.conflicts,
            network: this.network,
            sectors: this.sectors,
            decisionLogs: this.decisionLogs,
            analytics,
            simulation: this.simulationControls,
            emergencyAlert: this.emergencyAlert,
        };
    }
    addSystemLog(category, level, title, what, why, decision) {
        const log = {
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: Date.now(),
            category,
            level,
            title,
            what,
            why,
            decision,
        };
        this.decisionLogs.unshift(log);
        if (this.decisionLogs.length > 80)
            this.decisionLogs.pop();
    }
    /**
     * Main Physics, Navigation, and Safety Loop
     */
    tick(force = false) {
        if (!this.simulationControls.isRunning && !force)
            return;
        this.tickCount++;
        const dtSeconds = 0.1 * this.simulationControls.speed;
        this.simulationControls.timeElapsedSeconds += dtSeconds;
        this.mission.elapsedSeconds += dtSeconds;
        // 1. Update Drone Movement and Telemetry
        for (const drone of this.drones) {
            if (drone.status === 'FAILED' || drone.status === 'DISCONNECTED')
                continue;
            // Battery drain
            drone.battery = Math.max(0, drone.battery - 0.008 * dtSeconds);
            if (drone.battery <= 20 && drone.status !== 'LOW_BATTERY' && drone.status !== 'RETURNING') {
                this.triggerDroneFailure(drone.id, 'Battery fell below safety threshold (<20%)', 'LOW_BATTERY');
            }
            drone.flightTimeSeconds += dtSeconds;
            // Move toward target position / waypoints
            if (drone.targetPosition) {
                const dLat = drone.targetPosition.lat - drone.position.lat;
                const dLng = drone.targetPosition.lng - drone.position.lng;
                const dist = Math.sqrt(dLat * dLat + dLng * dLng);
                if (dist > 0.00005) {
                    const step = (drone.speed * dtSeconds * 0.00001) / 1.11; // conversion approx
                    const angle = Math.atan2(dLng, dLat);
                    drone.position.lat += Math.cos(angle) * step;
                    drone.position.lng += Math.sin(angle) * step;
                    drone.heading = Math.round(((angle * 180) / Math.PI + 360) % 360);
                    drone.distanceCoveredMeters += drone.speed * dtSeconds;
                }
                else {
                    // Arrived at current waypoint, cycle next waypoint
                    if (drone.waypoints.length > 1) {
                        const nextWp = drone.waypoints.shift();
                        if (nextWp) {
                            drone.targetPosition = { lat: nextWp.lat, lng: nextWp.lng, alt: nextWp.alt };
                            drone.waypoints.push(nextWp); // loop search pattern
                        }
                    }
                }
                // Smoothly adjust altitude toward target altitude
                if (Math.abs(drone.position.alt - drone.targetPosition.alt) > 0.5) {
                    drone.position.alt += (drone.targetPosition.alt - drone.position.alt) * 0.1;
                    drone.altitude = Math.round(drone.position.alt);
                }
            }
            // Update SLAM navigation
            this.slamEngine.updateNavigationState(drone, dtSeconds);
            // Update task progress if drone is scanning
            if (drone.currentTaskId) {
                const task = this.tasks.find((t) => t.id === drone.currentTaskId);
                if (task && task.status === 'IN_PROGRESS') {
                    task.progress = Math.min(100, task.progress + 0.8 * dtSeconds);
                    if (task.progress >= 100) {
                        task.status = 'COMPLETED';
                        drone.tasksCompletedCount++;
                        this.addSystemLog('TASK_ALLOCATION', 'SUCCESS', `Task Completed: ${task.title}`, `${drone.name} (${drone.callsign}) successfully completed payload task [${task.title}].`, 'All target sweep coordinates scanned and validated.', 'Decommissioned active task. Unit standing by for next task allocation.');
                        drone.currentTaskId = null;
                    }
                }
            }
        }
        // 2. Evaluate Collision Safety
        const safetyResult = this.collisionEngine.evaluateSwarmSafety(this.drones);
        if (safetyResult.conflicts.length > 0) {
            this.conflicts.push(...safetyResult.conflicts);
            for (const log of safetyResult.decisionLogs) {
                this.decisionLogs.unshift(log);
            }
        }
        // 3. Compute Mesh Network Topology
        const netResult = this.networkEngine.computeTopology(this.drones);
        this.network = netResult.topology;
        for (const log of netResult.decisionLogs) {
            this.decisionLogs.unshift(log);
        }
        // 4. Update Mission Coverage & Sector Exploration
        if (this.tickCount % 10 === 0) {
            let totalExploration = 0;
            for (const sector of this.sectors) {
                if (sector.assignedDroneId) {
                    sector.explorationPercent = Math.min(100, sector.explorationPercent + 0.3 * dtSeconds * 10);
                }
                totalExploration += sector.explorationPercent;
            }
            this.mission.coveragePercent = Math.min(100, totalExploration / Math.max(1, this.sectors.length));
            this.mission.activeDronesCount = this.drones.filter((d) => d.status !== 'FAILED' && d.status !== 'DISCONNECTED').length;
            // Append time-series history
            if (this.tickCount % 30 === 0) {
                const avgBatt = this.drones.reduce((acc, d) => acc + d.battery, 0) / Math.max(1, this.drones.length);
                this.timeSeriesCoverage.push({
                    timestamp: Date.now(),
                    coverage: Number(this.mission.coveragePercent.toFixed(1)),
                    activeDrones: this.mission.activeDronesCount,
                });
                this.timeSeriesBatteryDraw.push({
                    timestamp: Date.now(),
                    avgBattery: Number(avgBatt.toFixed(1)),
                });
                if (this.timeSeriesCoverage.length > 30)
                    this.timeSeriesCoverage.shift();
                if (this.timeSeriesBatteryDraw.length > 30)
                    this.timeSeriesBatteryDraw.shift();
            }
        }
        // Broadcast full state via WebSocket
        if (this.io) {
            this.io.emit('swarm:state', this.getFullState());
        }
    }
    // --- Chaos & Failure Injection Controls ---
    triggerDroneFailure(droneId, reason, status = 'FAILED') {
        try {
            const res = this.failureRecoveryEngine.handleDroneFailure(droneId, reason, status, this.drones, this.tasks, this.sectors);
            for (const log of res.decisionLogs) {
                this.decisionLogs.unshift(log);
            }
            this.emergencyAlert = res.emergencyAlert;
            if (this.io) {
                this.io.emit('swarm:alert', this.emergencyAlert);
            }
            return res;
        }
        catch (e) {
            console.error('Failure trigger error:', e.message);
            return null;
        }
    }
    triggerDisconnect(droneId) {
        return this.triggerDroneFailure(droneId, 'RF Jamming / Severe C2 Link Drop', 'DISCONNECTED');
    }
    triggerLowBattery(droneId) {
        const drone = this.getDrone(droneId);
        if (drone)
            drone.battery = 15;
        return this.triggerDroneFailure(droneId, 'Critical Battery Depletion (<15%)', 'LOW_BATTERY');
    }
    triggerCollisionRisk(droneAId, droneBId) {
        const dA = this.getDrone(droneAId);
        const dB = this.getDrone(droneBId);
        if (dA && dB) {
            const conflict = this.collisionEngine.triggerSimulatedConflict(dA, dB);
            this.conflicts.push(conflict);
            this.addSystemLog('COLLISION_AVOIDANCE', 'CRITICAL', `EMERGENCY CONFLICT: ${dA.callsign} & ${dB.callsign}`, `Imminent trajectory intersection: ${dA.name} and ${dB.name} closing distance 14m.`, 'Predictive anti-collision system intercepted flight trajectories in Sector B-14.', conflict.resolutionDetails);
            return conflict;
        }
        return null;
    }
    injectDetection(droneId, type, confidence = 94, description) {
        const drone = this.getDrone(droneId);
        if (!drone)
            return null;
        const res = this.cvEngine.registerDetection(drone, type, confidence, description);
        for (const t of res.generatedTasks) {
            // Allocate new task automatically
            const alloc = this.intelligenceEngine.allocateTask(t, this.drones, this.tasks);
            t.assignedDroneId = alloc.assignedDroneId;
            t.scoreBreakdowns = alloc.scoreBreakdowns;
            t.status = alloc.assignedDroneId ? 'IN_PROGRESS' : 'PENDING';
            this.tasks.unshift(t);
            if (alloc.decisionLog) {
                this.decisionLogs.unshift(alloc.decisionLog);
            }
        }
        for (const log of res.decisionLogs) {
            this.decisionLogs.unshift(log);
        }
        if (type === 'PERSON') {
            this.mission.survivorsFound++;
        }
        else {
            this.mission.hazardsDetected++;
        }
        return res;
    }
    setDroneSlamMode(droneId, mode) {
        const drone = this.getDrone(droneId);
        if (drone) {
            const log = this.slamEngine.setMode(drone, mode);
            this.decisionLogs.unshift(log);
        }
    }
    launchDemo() {
        this.demoRunner.startDemo();
    }
    stopDemo() {
        this.demoRunner.stopDemo();
    }
}
exports.SimulationManager = SimulationManager;
