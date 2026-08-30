export type DroneRole = 'MAPPER' | 'SEARCH' | 'RELAY' | 'THERMAL' | 'GENERAL';
export type DroneStatus = 'IDLE' | 'EN_ROUTE' | 'SCANNING' | 'VERIFYING' | 'RELAYING' | 'RETURNING' | 'FAILED' | 'DISCONNECTED' | 'LOW_BATTERY' | 'EMERGENCY';
export type DroneHealthStatus = 'OPTIMAL' | 'NORMAL' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
export type SLAMMode = 'GPS' | 'SLAM' | 'HYBRID';
export interface GeoPoint {
    lat: number;
    lng: number;
    alt: number;
}
export interface Waypoint extends GeoPoint {
    id: string;
    name?: string;
    action?: 'SCAN' | 'HOVER' | 'RELAY' | 'THERMAL_SWEEP' | 'DROP_BEACON' | 'PASS_THROUGH';
    dwellTimeSeconds?: number;
}
export interface DroneHealth {
    status: DroneHealthStatus;
    temperatureC: number;
    motorRpm: number;
    vibrationScore: number;
    signalStrengthDbm: number;
    packetLossPercent: number;
    lastHeartbeat: number;
}
export interface DroneSensors {
    hasOpticalCamera: boolean;
    hasThermalSensor: boolean;
    hasLidar: boolean;
    hasRelayAntenna: boolean;
    slamConfidence: number;
    slamLandmarks: number;
    slamDriftMeters: number;
    opticalFps: number;
}
export interface DroneTelemetry {
    id: string;
    callsign: string;
    name: string;
    role: DroneRole;
    status: DroneStatus;
    battery: number;
    speed: number;
    altitude: number;
    heading: number;
    position: GeoPoint;
    targetPosition: GeoPoint | null;
    homePosition: GeoPoint;
    waypoints: Waypoint[];
    currentTaskId: string | null;
    health: DroneHealth;
    sensors: DroneSensors;
    slamMode: SLAMMode;
    assignedSector: string | null;
    flightTimeSeconds: number;
    distanceCoveredMeters: number;
    tasksCompletedCount: number;
    confidenceScore: number;
    color: string;
}
export type TaskType = 'MAPPING' | 'SEARCH' | 'THERMAL_SCAN' | 'COMM_RELAY' | 'AREA_VERIFICATION' | 'OBJECT_DETECTION' | 'CASUALTY_CONFIRMATION';
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'REASSIGNED';
export interface TaskScoreBreakdown {
    priorityScore: number;
    distanceScore: number;
    batteryScore: number;
    capabilityScore: number;
    commQualityScore: number;
    workloadPenalty: number;
    totalScore: number;
    explanation: string;
}
export interface MissionTask {
    id: string;
    missionId: string;
    type: TaskType;
    title: string;
    description: string;
    sectorCode: string;
    priority: TaskPriority;
    location: GeoPoint;
    targetRadiusMeters: number;
    requiredCapability: DroneRole;
    status: TaskStatus;
    assignedDroneId: string | null;
    previousDroneId?: string | null;
    progress: number;
    deadlineSeconds: number;
    createdAt: number;
    updatedAt: number;
    reassignedAt?: number;
    reassignmentReason?: string;
    scoreBreakdowns?: Record<string, TaskScoreBreakdown>;
}
export type ObjectDetectionType = 'PERSON' | 'VEHICLE' | 'DAMAGED_BUILDING' | 'FIRE_SMOKE' | 'BLOCKED_ROAD' | 'HEAT_SIGNATURE' | 'UNKNOWN_OBJECT';
export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface CVDetection {
    id: string;
    droneId: string;
    timestamp: number;
    type: ObjectDetectionType;
    confidence: number;
    location: GeoPoint;
    sectorCode: string;
    boundingBox: BoundingBox;
    thermalTempC?: number;
    imageUrl?: string;
    status: 'UNCONFIRMED' | 'VERIFIED' | 'RESCUE_DISPATCHED' | 'FALSE_ALARM';
    description: string;
    requiresThermalVerification?: boolean;
}
export type ConflictRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ConflictResolutionStrategy = 'ALTITUDE_ADJUSTMENT' | 'ROUTE_ADJUSTMENT' | 'TEMPORARY_WAYPOINT' | 'SPEED_REDUCTION' | 'HOLD_HOVER';
export interface CollisionConflict {
    id: string;
    droneAId: string;
    droneBId: string;
    distanceMeters: number;
    altitudeDiffMeters: number;
    relativeVelocity: number;
    estimatedTimeToConflictSeconds: number;
    riskLevel: ConflictRiskLevel;
    resolutionStrategy: ConflictResolutionStrategy;
    resolutionDetails: string;
    resolved: boolean;
    timestamp: number;
    resolvedAt?: number;
    conflictLocation: GeoPoint;
}
export interface MeshNode {
    id: string;
    name: string;
    type: 'COMMAND_CENTER' | 'DRONE' | 'GROUND_RELAY';
    position: GeoPoint;
    status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    isRelay: boolean;
    battery: number;
}
export interface MeshLink {
    fromId: string;
    toId: string;
    signalStrengthDbm: number;
    latencyMs: number;
    bandwidthMbps: number;
    packetLossPercent: number;
    isRelayRoute: boolean;
    qualityScore: number;
}
export interface NetworkTopology {
    nodes: MeshNode[];
    links: MeshLink[];
    activeRelayId: string | null;
    meshHealthScore: number;
    averageLatencyMs: number;
    coveragePercent: number;
    isolatedNodeIds: string[];
}
export type DecisionCategory = 'TASK_ALLOCATION' | 'FAILURE_RECOVERY' | 'COLLISION_AVOIDANCE' | 'NETWORK_HEALING' | 'CV_DETECTION' | 'SLAM_NAVIGATION' | 'BATTERY_MANAGEMENT' | 'MISSION_UPDATE';
export interface AIDecisionLog {
    id: string;
    timestamp: number;
    category: DecisionCategory;
    level: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
    droneId?: string;
    targetDroneId?: string;
    taskId?: string;
    title: string;
    what: string;
    why: string;
    decision: string;
    scoreBreakdown?: TaskScoreBreakdown;
    metricsSnapshot?: Record<string, string | number>;
}
export interface DisasterSector {
    code: string;
    name: string;
    bounds: GeoPoint[];
    center: GeoPoint;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEARED';
    explorationPercent: number;
    hazardLevel: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE';
    detectedSurvivorsCount: number;
    lastScannedAt?: number;
    assignedDroneId?: string | null;
}
export type SearchStrategy = 'GRID_SWEEP' | 'SPIRAL_OUT' | 'SECTOR_PRIORITY' | 'ADAPTIVE_HEATMAP';
export interface Mission {
    id: string;
    name: string;
    scenarioName: string;
    description: string;
    status: 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABORTED';
    searchStrategy: SearchStrategy;
    centerLocation: GeoPoint;
    radiusMeters: number;
    totalSectors: number;
    exploredSectors: number;
    survivorsFound: number;
    hazardsDetected: number;
    activeDronesCount: number;
    coveragePercent: number;
    startTime: number;
    elapsedSeconds: number;
    estimatedRemainingSeconds: number;
}
export interface AnalyticsMetrics {
    missionCompletionPercent: number;
    searchCoveragePercent: number;
    tasksCompleted: number;
    tasksReassignedCount: number;
    averageResponseTimeSeconds: number;
    droneUtilizationPercent: number;
    batteryEfficiencyScore: number;
    detectionAccuracyPercent: number;
    communicationUptimePercent: number;
    collisionRisksAvoidedCount: number;
    failedDroneRecoveryAvgTimeSeconds: number;
    timeSeriesCoverage: {
        timestamp: number;
        coverage: number;
        activeDrones: number;
    }[];
    timeSeriesBatteryDraw: {
        timestamp: number;
        avgBattery: number;
    }[];
    detectionsByType: Record<ObjectDetectionType, number>;
}
export interface SimulationControls {
    isRunning: boolean;
    speed: 1 | 2 | 5 | 10;
    timeElapsedSeconds: number;
    isDemoActive: boolean;
    demoPhaseIndex: number;
    demoPhaseName: string;
}
export interface SwarmFullState {
    mission: Mission;
    drones: DroneTelemetry[];
    tasks: MissionTask[];
    detections: CVDetection[];
    conflicts: CollisionConflict[];
    network: NetworkTopology;
    sectors: DisasterSector[];
    decisionLogs: AIDecisionLog[];
    analytics: AnalyticsMetrics;
    simulation: SimulationControls;
    emergencyAlert: {
        active: boolean;
        title: string;
        message: string;
        level: 'WARN' | 'CRITICAL';
        timestamp: number;
    } | null;
}
