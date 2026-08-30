import {
  DroneTelemetry,
  MissionTask,
  TaskScoreBreakdown,
  AIDecisionLog,
  DEFAULT_ALGORITHM_WEIGHTS,
  SAFETY_PARAMETERS,
  GeoPoint,
} from '@swarmos/shared';

export interface AllocationResult {
  assignedDroneId: string | null;
  scoreBreakdowns: Record<string, TaskScoreBreakdown>;
  decisionLog: AIDecisionLog | null;
  reasoning: string;
}

export class SwarmIntelligenceEngine {
  private weights = { ...DEFAULT_ALGORITHM_WEIGHTS };

  public updateWeights(newWeights: Partial<typeof DEFAULT_ALGORITHM_WEIGHTS>) {
    this.weights = { ...this.weights, ...newWeights };
  }

  public getWeights() {
    return { ...this.weights };
  }

  /**
   * Calculate distance between two GeoPoints in meters using Haversine formula
   */
  public calculateDistanceMeters(p1: GeoPoint, p2: GeoPoint): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const horizontalDist = R * c;
    const verticalDist = (p2.alt || 0) - (p1.alt || 0);
    return Math.sqrt(horizontalDist * horizontalDist + verticalDist * verticalDist);
  }

  /**
   * Evaluates a single drone's score for a specific task
   */
  public scoreDroneForTask(drone: DroneTelemetry, task: MissionTask, allTasks: MissionTask[]): TaskScoreBreakdown {
    // 1. Hard disqualification conditions
    if (
      drone.status === 'FAILED' ||
      drone.status === 'DISCONNECTED' ||
      drone.status === 'EMERGENCY' ||
      drone.battery <= SAFETY_PARAMETERS.criticalBatteryThresholdPercent
    ) {
      return {
        priorityScore: 0,
        distanceScore: 0,
        batteryScore: 0,
        capabilityScore: 0,
        commQualityScore: 0,
        workloadPenalty: 100,
        totalScore: -999,
        explanation: `Disqualified: Drone state (${drone.status}), Battery: ${drone.battery.toFixed(1)}%`,
      };
    }

    // 2. Priority Weighting (0-100 normalized)
    let priorityScore = 50;
    switch (task.priority) {
      case 'CRITICAL':
        priorityScore = 100;
        break;
      case 'HIGH':
        priorityScore = 80;
        break;
      case 'MEDIUM':
        priorityScore = 55;
        break;
      case 'LOW':
        priorityScore = 30;
        break;
    }

    // 3. Distance Efficiency (Closer is better, max range normalization 2000m)
    const distanceMeters = this.calculateDistanceMeters(drone.position, task.location);
    const distanceScore = Math.max(0, 100 - (distanceMeters / 2000) * 100);

    // 4. Battery Suitability
    let batteryScore = drone.battery;
    if (drone.battery < SAFETY_PARAMETERS.warningBatteryThresholdPercent) {
      batteryScore *= 0.5; // Heavy penalty if approaching threshold
    }

    // 5. Capability Match
    let capabilityScore = 50;
    if (task.requiredCapability === drone.role) {
      capabilityScore = 100;
    } else if (task.type === 'THERMAL_SCAN' && drone.sensors.hasThermalSensor) {
      capabilityScore = 95;
    } else if (task.type === 'MAPPING' && drone.sensors.hasOpticalCamera) {
      capabilityScore = 85;
    } else if (task.type === 'SEARCH' && (drone.role === 'GENERAL' || drone.role === 'MAPPER')) {
      capabilityScore = 75;
    } else {
      capabilityScore = 30;
    }

    // 6. Communication Quality (dBm normalization: -50dBm is 100%, -95dBm is 0%)
    const signalDbm = drone.health.signalStrengthDbm;
    const commQualityScore = Math.max(0, Math.min(100, ((signalDbm - -95) / (-45 - -95)) * 100));

    // 7. Current Workload Penalty
    const currentWorkloadCount = allTasks.filter(
      (t) => t.assignedDroneId === drone.id && t.status !== 'COMPLETED' && t.status !== 'FAILED'
    ).length;
    const workloadPenalty = currentWorkloadCount * 15;

    // Weighted Total Score Calculation
    const totalScore =
      (this.weights.priorityWeight / 100) * priorityScore +
      (this.weights.distanceWeight / 100) * distanceScore +
      (this.weights.batteryWeight / 100) * batteryScore +
      (this.weights.capabilityWeight / 100) * capabilityScore +
      (this.weights.commQualityWeight / 100) * commQualityScore -
      (this.weights.workloadPenaltyWeight / 100) * workloadPenalty;

    const explanation = `Dist: ${Math.round(distanceMeters)}m (${distanceScore.toFixed(0)}pts) | Batt: ${drone.battery.toFixed(0)}% (${batteryScore.toFixed(0)}pts) | CapMatch: ${capabilityScore}pts | Comm: ${commQualityScore.toFixed(0)}pts | Load: -${workloadPenalty}pts`;

    return {
      priorityScore: Math.round(priorityScore),
      distanceScore: Math.round(distanceScore),
      batteryScore: Math.round(batteryScore),
      capabilityScore: Math.round(capabilityScore),
      commQualityScore: Math.round(commQualityScore),
      workloadPenalty: Math.round(workloadPenalty),
      totalScore: Number(totalScore.toFixed(2)),
      explanation,
    };
  }

  /**
   * Find optimal drone for a task and generate human-readable decision logic
   */
  public allocateTask(
    task: MissionTask,
    drones: DroneTelemetry[],
    allTasks: MissionTask[],
    isReallocation = false,
    reasonContext?: string
  ): AllocationResult {
    const scoreBreakdowns: Record<string, TaskScoreBreakdown> = {};
    let bestDroneId: string | null = null;
    let highestScore = -999;

    for (const drone of drones) {
      const score = this.scoreDroneForTask(drone, task, allTasks);
      scoreBreakdowns[drone.id] = score;

      if (score.totalScore > highestScore && score.totalScore > 0) {
        highestScore = score.totalScore;
        bestDroneId = drone.id;
      }
    }

    if (!bestDroneId) {
      return {
        assignedDroneId: null,
        scoreBreakdowns,
        decisionLog: {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          category: 'TASK_ALLOCATION',
          level: 'WARN',
          taskId: task.id,
          title: `Task Allocation Queued: ${task.title}`,
          what: `No currently available drone met the operational threshold for task [${task.title}].`,
          why: `All connected drones are either occupied, disqualified by critical battery (<${SAFETY_PARAMETERS.criticalBatteryThresholdPercent}%), or unreachable.`,
          decision: 'Queued task in Mission Pending Pool. Will re-evaluate on next heartbeat tick.',
        },
        reasoning: 'No suitable candidate drone found above score threshold.',
      };
    }

    const assignedDrone = drones.find((d) => d.id === bestDroneId)!;
    const scoreInfo = scoreBreakdowns[bestDroneId];

    let what = '';
    let why = '';
    let decision = '';

    if (isReallocation) {
      const prevDroneId = task.assignedDroneId || 'Unknown Unit';
      what = `Task [${task.title}] reassigned from ${prevDroneId} → ${assignedDrone.name} (${assignedDrone.callsign}).`;
      why = reasonContext || `Previous unit degraded. ${assignedDrone.name} achieved the highest suitability score (${scoreInfo.totalScore.toFixed(1)}).`;
      decision = `Transferred coordinates (${task.location.lat.toFixed(4)}, ${task.location.lng.toFixed(4)}) to ${assignedDrone.callsign} flight queue.`;
    } else {
      what = `Task [${task.title}] assigned to ${assignedDrone.name}.`;
      why = `Evaluated multi-agent candidate matrix: Highest match score (${scoreInfo.totalScore.toFixed(1)}). ${scoreInfo.explanation}`;
      decision = `Dispatched waypoint vector to ${assignedDrone.callsign}. Altitude: ${task.location.alt}m.`;
    }

    const decisionLog: AIDecisionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      category: isReallocation ? 'FAILURE_RECOVERY' : 'TASK_ALLOCATION',
      level: isReallocation ? 'WARN' : 'INFO',
      droneId: bestDroneId,
      taskId: task.id,
      title: isReallocation ? `Dynamic Task Reallocation: ${task.title}` : `Autonomous Task Assignment: ${task.title}`,
      what,
      why,
      decision,
      scoreBreakdown: scoreInfo,
      metricsSnapshot: {
        totalScore: scoreInfo.totalScore,
        battery: assignedDrone.battery,
        distanceMeters: Math.round(this.calculateDistanceMeters(assignedDrone.position, task.location)),
      },
    };

    return {
      assignedDroneId: bestDroneId,
      scoreBreakdowns,
      decisionLog,
      reasoning: why,
    };
  }
}
