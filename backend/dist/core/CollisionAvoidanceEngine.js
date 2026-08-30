"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollisionAvoidanceEngine = void 0;
const shared_1 = require("@swarmos/shared");
class CollisionAvoidanceEngine {
    activeConflicts = new Map();
    avoidedConflictsCount = 0;
    getAvoidedCount() {
        return this.avoidedConflictsCount;
    }
    /**
     * Calculate 3D Euclidean distance in meters
     */
    calculate3DDistance(p1, p2) {
        const R = 6371000;
        const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
        const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((p1.lat * Math.PI) / 180) *
                Math.cos((p2.lat * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const horizontalDistance = R * c;
        const altitudeDiff = Math.abs(p2.alt - p1.alt);
        const totalDistance = Math.sqrt(horizontalDistance * horizontalDistance + altitudeDiff * altitudeDiff);
        return { totalDistance, horizontalDistance, altitudeDiff };
    }
    /**
     * Scans all active drone pairs for collision risks and applies deconfliction vectors
     */
    evaluateSwarmSafety(drones) {
        const activeFlyingDrones = drones.filter((d) => d.status !== 'FAILED' && d.status !== 'DISCONNECTED' && d.status !== 'IDLE');
        const newConflicts = [];
        const decisionLogs = [];
        const modifiedDrones = [];
        for (let i = 0; i < activeFlyingDrones.length; i++) {
            for (let j = i + 1; j < activeFlyingDrones.length; j++) {
                const droneA = activeFlyingDrones[i];
                const droneB = activeFlyingDrones[j];
                const { totalDistance, horizontalDistance, altitudeDiff } = this.calculate3DDistance(droneA.position, droneB.position);
                const pairKey = [droneA.id, droneB.id].sort().join('::');
                // Check if within safety threshold
                if (horizontalDistance < shared_1.SAFETY_PARAMETERS.horizontalSafetyRadiusMeters &&
                    altitudeDiff < shared_1.SAFETY_PARAMETERS.verticalSafetySeparationMeters) {
                    // Determine Risk Level
                    let riskLevel = 'MEDIUM';
                    if (totalDistance < shared_1.SAFETY_PARAMETERS.criticalCollisionDistanceMeters) {
                        riskLevel = 'CRITICAL';
                    }
                    else if (horizontalDistance < 18) {
                        riskLevel = 'HIGH';
                    }
                    // Calculate estimated relative closing velocity and time to conflict
                    const relativeVelocity = Math.max(2, droneA.speed + droneB.speed * 0.75);
                    const timeToConflict = Math.max(0.5, totalDistance / relativeVelocity);
                    // Compute deconfliction strategy
                    let strategy = 'ALTITUDE_ADJUSTMENT';
                    let resolutionDetails = '';
                    // Deconfliction logic:
                    // If altitude diff is small, step Drone A up and Drone B down (or hold)
                    if (altitudeDiff < 10) {
                        strategy = 'ALTITUDE_ADJUSTMENT';
                        const altitudeStep = 15;
                        droneA.position.alt += altitudeStep;
                        if (droneA.targetPosition)
                            droneA.targetPosition.alt += altitudeStep;
                        resolutionDetails = `Assigned vertical step: ${droneA.callsign} climbed +${altitudeStep}m (now ${droneA.position.alt.toFixed(0)}m), vertical separation restored.`;
                        modifiedDrones.push(droneA);
                    }
                    else {
                        strategy = 'TEMPORARY_WAYPOINT';
                        // Divert Drone B slightly laterally (offset lat/lng)
                        const offsetLat = (Math.random() - 0.5) * 0.0004;
                        const offsetLng = (Math.random() - 0.5) * 0.0004;
                        if (droneB.targetPosition) {
                            droneB.targetPosition.lat += offsetLat;
                            droneB.targetPosition.lng += offsetLng;
                        }
                        droneB.speed = Math.max(4, droneB.speed * 0.7); // speed reduction
                        resolutionDetails = `Assigned lateral divergence waypoint to ${droneB.callsign} and reduced airspeed to ${droneB.speed.toFixed(1)} m/s.`;
                        modifiedDrones.push(droneB);
                    }
                    const conflict = {
                        id: `conflict-${Date.now()}-${pairKey}`,
                        droneAId: droneA.id,
                        droneBId: droneB.id,
                        distanceMeters: Number(totalDistance.toFixed(1)),
                        altitudeDiffMeters: Number(altitudeDiff.toFixed(1)),
                        relativeVelocity: Number(relativeVelocity.toFixed(1)),
                        estimatedTimeToConflictSeconds: Number(timeToConflict.toFixed(1)),
                        riskLevel,
                        resolutionStrategy: strategy,
                        resolutionDetails,
                        resolved: true,
                        timestamp: Date.now(),
                        resolvedAt: Date.now(),
                        conflictLocation: {
                            lat: (droneA.position.lat + droneB.position.lat) / 2,
                            lng: (droneA.position.lng + droneB.position.lng) / 2,
                            alt: (droneA.position.alt + droneB.position.alt) / 2,
                        },
                    };
                    // Only log if not previously logged in the last 6 seconds
                    const existing = this.activeConflicts.get(pairKey);
                    if (!existing || Date.now() - existing.timestamp > 6000) {
                        this.activeConflicts.set(pairKey, conflict);
                        newConflicts.push(conflict);
                        this.avoidedConflictsCount++;
                        decisionLogs.push({
                            id: `log-col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                            timestamp: Date.now(),
                            category: 'COLLISION_AVOIDANCE',
                            level: riskLevel === 'CRITICAL' ? 'CRITICAL' : 'WARN',
                            droneId: droneA.id,
                            targetDroneId: droneB.id,
                            title: `Proximity Conflict: ${droneA.callsign} & ${droneB.callsign}`,
                            what: `Convergence detected between ${droneA.name} and ${droneB.name}. Separation: ${totalDistance.toFixed(1)}m (Risk: ${riskLevel}).`,
                            why: `Estimated time-to-conflict: ${timeToConflict.toFixed(1)}s along intersecting search corridors.`,
                            decision: resolutionDetails,
                            metricsSnapshot: {
                                separationMeters: Number(totalDistance.toFixed(1)),
                                altitudeDiff: Number(altitudeDiff.toFixed(1)),
                                strategy,
                            },
                        });
                    }
                }
            }
        }
        return {
            conflicts: newConflicts,
            decisionLogs,
            modifiedDrones,
        };
    }
    /**
     * Manually force a collision risk scenario for chaos/simulation testing
     */
    triggerSimulatedConflict(droneA, droneB) {
        // Bring Drone B close to Drone A
        droneB.position.lat = droneA.position.lat + 0.0001;
        droneB.position.lng = droneA.position.lng + 0.0001;
        droneB.position.alt = droneA.position.alt + 2;
        const conflict = {
            id: `conflict-chaos-${Date.now()}`,
            droneAId: droneA.id,
            droneBId: droneB.id,
            distanceMeters: 14.2,
            altitudeDiffMeters: 2.0,
            relativeVelocity: 16.5,
            estimatedTimeToConflictSeconds: 0.85,
            riskLevel: 'CRITICAL',
            resolutionStrategy: 'ALTITUDE_ADJUSTMENT',
            resolutionDetails: `Autonomous emergency climb vector commanded to ${droneA.callsign} (+20m). Speed hold applied to ${droneB.callsign}.`,
            resolved: false,
            timestamp: Date.now(),
            conflictLocation: { ...droneA.position },
        };
        return conflict;
    }
}
exports.CollisionAvoidanceEngine = CollisionAvoidanceEngine;
