"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationSLAMEngine = void 0;
class NavigationSLAMEngine {
    /**
     * Updates SLAM/GPS simulated navigation telemetry for a drone
     */
    updateNavigationState(drone, dtSeconds) {
        if (drone.status === 'FAILED' || drone.status === 'DISCONNECTED') {
            return null;
        }
        let decisionLog = null;
        if (drone.slamMode === 'GPS') {
            // In urban canyon, GPS error fluctuates slightly
            drone.sensors.slamDriftMeters = Math.max(0.1, Number((0.2 + (Math.random() - 0.5) * 0.15).toFixed(2)));
            drone.sensors.slamConfidence = 88;
            drone.sensors.slamLandmarks = 0;
        }
        else if (drone.slamMode === 'SLAM') {
            // Visual/LiDAR SLAM tracks feature landmarks
            const baseLandmarks = drone.sensors.hasLidar ? 520 : 340;
            drone.sensors.slamLandmarks = Math.round(baseLandmarks + (Math.random() - 0.5) * 30);
            drone.sensors.slamDriftMeters = Math.max(0.04, Number((drone.sensors.slamDriftMeters + (Math.random() - 0.48) * 0.01).toFixed(3)));
            drone.sensors.slamConfidence = Math.min(99, Math.round(95 - drone.sensors.slamDriftMeters * 10));
        }
        else {
            // HYBRID EKF Fusion Mode (Best performance)
            drone.sensors.slamLandmarks = drone.sensors.hasLidar ? 560 : 380;
            drone.sensors.slamDriftMeters = Math.max(0.02, Number((0.06 + (Math.random() - 0.5) * 0.02).toFixed(3)));
            drone.sensors.slamConfidence = 98;
        }
        return decisionLog;
    }
    /**
     * Switch SLAM Mode (GPS, SLAM, HYBRID) and log decision
     */
    setMode(drone, newMode) {
        const prevMode = drone.slamMode;
        drone.slamMode = newMode;
        let why = '';
        if (newMode === 'SLAM') {
            why = 'Urban canyon environment detected with high multipath GPS reflection. Switched to Visual-LiDAR SLAM.';
        }
        else if (newMode === 'HYBRID') {
            why = 'Enabled Extended Kalman Filter (EKF) sensor fusion between multi-constellation GNSS and onboard SLAM features.';
        }
        else {
            why = 'Cleared dense obstruction zone. Reverted to standard satellite GNSS positioning.';
        }
        return {
            id: `log-nav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: Date.now(),
            category: 'SLAM_NAVIGATION',
            level: 'INFO',
            droneId: drone.id,
            title: `Navigation Mode Switch: ${drone.callsign} → ${newMode}`,
            what: `Transferred flight controller state estimator from [${prevMode}] to [${newMode}].`,
            why,
            decision: `Configured sensor pipeline: Visual Odometry (${drone.sensors.opticalFps} FPS) + LiDAR scan matcher.`,
            metricsSnapshot: {
                newMode,
                confidence: drone.sensors.slamConfidence,
                landmarks: drone.sensors.slamLandmarks,
            },
        };
    }
}
exports.NavigationSLAMEngine = NavigationSLAMEngine;
