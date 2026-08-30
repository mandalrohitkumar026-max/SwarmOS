"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailureRecoveryEngine = void 0;
class FailureRecoveryEngine {
    intelligenceEngine;
    recoveryTimes = [];
    constructor(intelligenceEngine) {
        this.intelligenceEngine = intelligenceEngine;
    }
    getAverageRecoveryTimeSeconds() {
        if (this.recoveryTimes.length === 0)
            return 2.4;
        const sum = this.recoveryTimes.reduce((a, b) => a + b, 0);
        return Number((sum / this.recoveryTimes.length).toFixed(1));
    }
    /**
     * Triggers the full autonomous failure recovery pipeline for a degraded or failed drone
     */
    handleDroneFailure(failedDroneId, reason, newStatus, drones, tasks, sectors) {
        const startTime = Date.now();
        const targetDrone = drones.find((d) => d.id === failedDroneId);
        if (!targetDrone) {
            throw new Error(`Drone with ID ${failedDroneId} not found in active fleet`);
        }
        // Step 1 & 2: Mark drone state
        targetDrone.status = newStatus;
        targetDrone.speed = 0;
        if (newStatus === 'FAILED') {
            targetDrone.health.status = 'CRITICAL';
            targetDrone.health.motorRpm = 0;
            targetDrone.health.packetLossPercent = 100;
            targetDrone.confidenceScore = 0;
        }
        else if (newStatus === 'DISCONNECTED') {
            targetDrone.health.status = 'OFFLINE';
            targetDrone.health.signalStrengthDbm = -99;
            targetDrone.health.packetLossPercent = 98;
        }
        else if (newStatus === 'LOW_BATTERY') {
            targetDrone.health.status = 'DEGRADED';
            targetDrone.battery = Math.min(18, targetDrone.battery);
        }
        // Step 3: Identify unfinished tasks assigned to this drone
        const unfinishedTasks = tasks.filter((t) => t.assignedDroneId === failedDroneId && t.status !== 'COMPLETED');
        const availableDrones = drones.filter((d) => d.id !== failedDroneId && d.status !== 'FAILED' && d.status !== 'DISCONNECTED' && d.battery > 20);
        const reassignedTasks = [];
        const decisionLogs = [];
        // Step 4-7: Recalculate, match, and reassign
        for (const task of unfinishedTasks) {
            task.status = 'REASSIGNED';
            task.previousDroneId = failedDroneId;
            task.priority = 'CRITICAL'; // Escalate priority due to failure
            task.reassignedAt = Date.now();
            const alloc = this.intelligenceEngine.allocateTask(task, availableDrones, tasks, true, `Unit ${targetDrone.name} (${targetDrone.callsign}) entered ${newStatus}: ${reason}. Reallocating high-priority payload.`);
            task.assignedDroneId = alloc.assignedDroneId;
            task.reassignmentReason = alloc.reasoning;
            task.scoreBreakdowns = alloc.scoreBreakdowns;
            task.updatedAt = Date.now();
            task.status = alloc.assignedDroneId ? 'IN_PROGRESS' : 'PENDING';
            if (alloc.assignedDroneId) {
                const assignedDrone = drones.find((d) => d.id === alloc.assignedDroneId);
                if (assignedDrone) {
                    assignedDrone.currentTaskId = task.id;
                    assignedDrone.assignedSector = task.sectorCode;
                    // Set target position to the rescued task location
                    assignedDrone.targetPosition = { ...task.location };
                    // Append waypoint
                    assignedDrone.waypoints.push({
                        id: `wp-reassigned-${Date.now()}`,
                        lat: task.location.lat,
                        lng: task.location.lng,
                        alt: task.location.alt || 60,
                        action: task.type === 'THERMAL_SCAN' ? 'THERMAL_SWEEP' : 'SCAN',
                    });
                }
            }
            if (alloc.decisionLog) {
                decisionLogs.push(alloc.decisionLog);
            }
            reassignedTasks.push(task);
        }
        // Step 8: Log the overall failure detection event
        const failureLog = {
            id: `log-fail-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: Date.now(),
            category: 'FAILURE_RECOVERY',
            level: 'CRITICAL',
            droneId: failedDroneId,
            title: `Emergency: ${targetDrone.callsign} Status changed to ${newStatus}`,
            what: `Centralized Health Watchdog identified anomaly on ${targetDrone.name}: ${reason}.`,
            why: `Telemetry threshold breached (Battery: ${targetDrone.battery.toFixed(1)}%, Health: ${targetDrone.health.status}, Signal: ${targetDrone.health.signalStrengthDbm}dBm).`,
            decision: `Harvested ${unfinishedTasks.length} pending mission tasks. Autonomous swarm redistribution executed in ${((Date.now() - startTime) / 1000).toFixed(2)}s.`,
            metricsSnapshot: {
                tasksHarvested: unfinishedTasks.length,
                availableFleetSize: availableDrones.length,
                status: newStatus,
            },
        };
        decisionLogs.unshift(failureLog);
        // Update sector assignment
        const updatedSectors = sectors.map((s) => {
            if (s.assignedDroneId === failedDroneId) {
                const matchingTask = reassignedTasks.find((t) => t.sectorCode === s.code);
                return {
                    ...s,
                    assignedDroneId: matchingTask ? matchingTask.assignedDroneId : null,
                };
            }
            return s;
        });
        const elapsedSeconds = Number(((Date.now() - startTime) / 1000).toFixed(2));
        this.recoveryTimes.push(elapsedSeconds);
        return {
            affectedDrone: targetDrone,
            reassignedTasks,
            updatedTasks: tasks,
            updatedSectors,
            decisionLogs,
            emergencyAlert: {
                active: true,
                title: `SWARM RECONFIGURATION: ${targetDrone.callsign} ${newStatus}`,
                message: `${reason}. ${unfinishedTasks.length} tasks autonomously redistributed to available fleet.`,
                level: 'CRITICAL',
                timestamp: Date.now(),
            },
        };
    }
}
exports.FailureRecoveryEngine = FailureRecoveryEngine;
