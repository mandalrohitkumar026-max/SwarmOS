import { DroneTelemetry, Mission, DisasterSector, GeoPoint } from './types';
export declare const SIMULATION_CENTER: GeoPoint;
export declare const COMMAND_CENTER_LOCATION: GeoPoint;
export declare const DEFAULT_ALGORITHM_WEIGHTS: {
    priorityWeight: number;
    distanceWeight: number;
    batteryWeight: number;
    capabilityWeight: number;
    commQualityWeight: number;
    workloadPenaltyWeight: number;
};
export declare const SAFETY_PARAMETERS: {
    horizontalSafetyRadiusMeters: number;
    verticalSafetySeparationMeters: number;
    criticalCollisionDistanceMeters: number;
    criticalBatteryThresholdPercent: number;
    warningBatteryThresholdPercent: number;
    commSignalLossThresholdDbm: number;
    commWarningThresholdDbm: number;
    maxDroneSpeedMps: number;
    surveyAltitudeMeters: number;
    relayAltitudeMeters: number;
    thermalAltitudeMeters: number;
};
export declare const INITIAL_DRONES: DroneTelemetry[];
export declare const INITIAL_SECTORS: DisasterSector[];
export declare const INITIAL_MISSION: Mission;
