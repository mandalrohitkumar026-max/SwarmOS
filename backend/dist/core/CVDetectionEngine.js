"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CVDetectionEngine = void 0;
class CVDetectionEngine {
    detectionsList = [];
    constructor() {
        this.seedInitialDetections();
    }
    seedInitialDetections() {
        this.detectionsList = [
            {
                id: 'det-001',
                droneId: 'drone-02',
                timestamp: Date.now() - 420000,
                type: 'PERSON',
                confidence: 94,
                location: { lat: 37.7758, lng: -122.4132, alt: 0 },
                sectorCode: 'SEC-B14',
                boundingBox: { x: 0.38, y: 0.42, width: 0.18, height: 0.32 },
                thermalTempC: 37.4,
                status: 'VERIFIED',
                description: 'Trapped civilian located beneath structural concrete slab in Sector B-14.',
                requiresThermalVerification: false,
            },
            {
                id: 'det-002',
                droneId: 'drone-01',
                timestamp: Date.now() - 310000,
                type: 'BLOCKED_ROAD',
                confidence: 91,
                location: { lat: 37.7772, lng: -122.4185, alt: 0 },
                sectorCode: 'SEC-A01',
                boundingBox: { x: 0.22, y: 0.55, width: 0.52, height: 0.28 },
                status: 'VERIFIED',
                description: 'Major arterial road blocked by collapsed overhead pedestrian bridge.',
            },
            {
                id: 'det-003',
                droneId: 'drone-04',
                timestamp: Date.now() - 190000,
                type: 'HEAT_SIGNATURE',
                confidence: 88,
                location: { lat: 37.7785, lng: -122.4235, alt: 0 },
                sectorCode: 'SEC-C08',
                boundingBox: { x: 0.51, y: 0.33, width: 0.22, height: 0.24 },
                thermalTempC: 38.1,
                status: 'UNCONFIRMED',
                description: 'Elevated thermal cluster detected in rubble void space.',
                requiresThermalVerification: true,
            },
        ];
    }
    getAllDetections() {
        return [...this.detectionsList];
    }
    /**
     * Generates a new detection from a drone scan
     */
    registerDetection(drone, type, confidence, customDescription, thermalTemp) {
        const isPerson = type === 'PERSON';
        const isThermalReq = isPerson || type === 'HEAT_SIGNATURE';
        const detection = {
            id: `det-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            droneId: drone.id,
            timestamp: Date.now(),
            type,
            confidence,
            location: {
                lat: drone.position.lat + (Math.random() - 0.5) * 0.0003,
                lng: drone.position.lng + (Math.random() - 0.5) * 0.0003,
                alt: 0,
            },
            sectorCode: drone.assignedSector || 'SEC-UNASSIGNED',
            boundingBox: {
                x: Math.max(0.1, Math.min(0.7, 0.3 + (Math.random() - 0.5) * 0.3)),
                y: Math.max(0.1, Math.min(0.6, 0.35 + (Math.random() - 0.5) * 0.2)),
                width: 0.15 + Math.random() * 0.15,
                height: 0.2 + Math.random() * 0.2,
            },
            thermalTempC: thermalTemp || (isPerson ? 37.2 : type === 'FIRE_SMOKE' ? 84.5 : 22.1),
            status: isPerson ? 'UNCONFIRMED' : 'VERIFIED',
            description: customDescription ||
                `CV Model v4.2 detected ${type} with ${confidence.toFixed(1)}% confidence in ${drone.assignedSector || 'sector'}.`,
            requiresThermalVerification: isThermalReq,
        };
        this.detectionsList.unshift(detection);
        const generatedTasks = [];
        const decisionLogs = [];
        // If a survivor or critical heat signature is spotted, trigger a high-priority verification task
        if (isPerson && detection.status === 'UNCONFIRMED') {
            const verificationTask = {
                id: `task-cv-verify-${Date.now()}`,
                missionId: 'mission-alpha-7',
                type: 'CASUALTY_CONFIRMATION',
                title: `Verify Survivor Heat Signature #${detection.id.substring(4, 8)}`,
                description: `Rapid optical & thermal cross-verification required for detected survivor at (${detection.location.lat.toFixed(4)}, ${detection.location.lng.toFixed(4)}).`,
                sectorCode: detection.sectorCode,
                priority: 'CRITICAL',
                location: { ...detection.location, alt: 45 },
                targetRadiusMeters: 30,
                requiredCapability: 'THERMAL',
                status: 'PENDING',
                assignedDroneId: null,
                progress: 0,
                deadlineSeconds: 180,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            generatedTasks.push(verificationTask);
            decisionLogs.push({
                id: `log-cv-${Date.now()}`,
                timestamp: Date.now(),
                category: 'CV_DETECTION',
                level: 'CRITICAL',
                droneId: drone.id,
                taskId: verificationTask.id,
                title: `AI Vision Alert: ${type} Detected (${confidence.toFixed(0)}%)`,
                what: `${drone.name} identified possible survivor signature in sector ${detection.sectorCode}.`,
                why: `Confidence threshold exceeded (${confidence.toFixed(1)}% >= 85%). Thermal anomaly registered at ${detection.thermalTempC}°C.`,
                decision: `Generated CRITICAL task [${verificationTask.title}] and requested swarm thermal verification unit.`,
            });
        }
        return {
            newDetections: [detection],
            generatedTasks,
            decisionLogs,
        };
    }
}
exports.CVDetectionEngine = CVDetectionEngine;
