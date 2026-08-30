import {
  DroneTelemetry,
  MeshNode,
  MeshLink,
  NetworkTopology,
  AIDecisionLog,
  COMMAND_CENTER_LOCATION,
  SAFETY_PARAMETERS,
  GeoPoint,
} from '@swarmos/shared';

export class NetworkTopologyEngine {
  private activeRelayDroneId: string = 'drone-03';

  private calculateDistanceMeters(p1: GeoPoint, p2: GeoPoint): number {
    const R = 6371000;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public getActiveRelayId(): string | null {
    return this.activeRelayDroneId;
  }

  public setActiveRelayId(droneId: string | null) {
    this.activeRelayDroneId = droneId || '';
  }

  /**
   * Recomputes mesh network topology, links, latency, and checks for relay failover
   */
  public computeTopology(drones: DroneTelemetry[]): {
    topology: NetworkTopology;
    decisionLogs: AIDecisionLog[];
  } {
    const decisionLogs: AIDecisionLog[] = [];

    // Check if current relay is healthy
    const currentRelay = drones.find((d) => d.id === this.activeRelayDroneId);
    const relayIsHealthy =
      currentRelay &&
      currentRelay.status !== 'FAILED' &&
      currentRelay.status !== 'DISCONNECTED' &&
      currentRelay.battery > 20;

    if (!relayIsHealthy && drones.length > 0) {
      // Automatic Relay Failover Election
      const bestCandidate = drones
        .filter(
          (d) =>
            d.id !== this.activeRelayDroneId &&
            d.status !== 'FAILED' &&
            d.status !== 'DISCONNECTED' &&
            d.battery > 30
        )
        .sort((a, b) => b.battery - a.battery)[0];

      if (bestCandidate) {
        const prevRelayId = this.activeRelayDroneId;
        this.activeRelayDroneId = bestCandidate.id;
        bestCandidate.sensors.hasRelayAntenna = true;
        bestCandidate.altitude = SAFETY_PARAMETERS.relayAltitudeMeters; // Climb to relay altitude
        if (bestCandidate.targetPosition) {
          bestCandidate.targetPosition.alt = SAFETY_PARAMETERS.relayAltitudeMeters;
        }

        decisionLogs.push({
          id: `log-net-${Date.now()}`,
          timestamp: Date.now(),
          category: 'NETWORK_HEALING',
          level: 'CRITICAL',
          droneId: bestCandidate.id,
          targetDroneId: prevRelayId,
          title: `Autonomous Relay Failover: ${bestCandidate.callsign} Elected`,
          what: `Primary communication relay [${prevRelayId}] degraded/offline. Handed over mesh coordination to ${bestCandidate.name}.`,
          why: `Signal degradation predicted. ${bestCandidate.name} selected due to optimal battery (${bestCandidate.battery.toFixed(0)}%) and central positioning.`,
          decision: `Commanded ${bestCandidate.callsign} to climb to ${SAFETY_PARAMETERS.relayAltitudeMeters}m and activate High-Bandwidth Mesh Repeater.`,
        });
      }
    }

    // Build Nodes
    const gcsNode: MeshNode = {
      id: 'gcs-base',
      name: 'Command Center (GCS)',
      type: 'COMMAND_CENTER',
      position: COMMAND_CENTER_LOCATION,
      status: 'ONLINE',
      isRelay: false,
      battery: 100,
    };

    const nodes: MeshNode[] = [
      gcsNode,
      ...drones.map((d) => ({
        id: d.id,
        name: d.callsign,
        type: 'DRONE' as const,
        position: d.position,
        status:
          d.status === 'FAILED'
            ? ('OFFLINE' as const)
            : d.status === 'DISCONNECTED' || d.battery < 20
            ? ('DEGRADED' as const)
            : ('ONLINE' as const),
        isRelay: d.id === this.activeRelayDroneId,
        battery: d.battery,
      })),
    ];

    // Build Links
    const links: MeshLink[] = [];
    const isolatedNodeIds: string[] = [];

    for (const drone of drones) {
      if (drone.status === 'FAILED' || drone.status === 'DISCONNECTED') {
        isolatedNodeIds.push(drone.id);
        continue;
      }

      // Distance to GCS
      const distToGcs = this.calculateDistanceMeters(drone.position, COMMAND_CENTER_LOCATION);
      // Distance to Relay Drone
      let distToRelay = 99999;
      if (currentRelay && drone.id !== currentRelay.id) {
        distToRelay = this.calculateDistanceMeters(drone.position, currentRelay.position);
      }

      // Link to GCS (Direct if close, or via Relay)
      const directSignalDbm = Math.max(-95, -45 - (distToGcs / 1000) * 35);
      const isDirectFeasible = directSignalDbm > SAFETY_PARAMETERS.commSignalLossThresholdDbm;

      if (isDirectFeasible || drone.id === this.activeRelayDroneId) {
        const quality = Math.max(0, Math.min(100, ((directSignalDbm - -95) / (-45 - -95)) * 100));
        links.push({
          fromId: drone.id,
          toId: 'gcs-base',
          signalStrengthDbm: Math.round(directSignalDbm),
          latencyMs: Math.round(12 + (distToGcs / 1000) * 8),
          bandwidthMbps: Number((45 * (quality / 100)).toFixed(1)),
          packetLossPercent: Number((Math.max(0, (100 - quality) * 0.05)).toFixed(2)),
          isRelayRoute: false,
          qualityScore: Math.round(quality),
        });
      } else if (currentRelay && currentRelay.status !== 'FAILED') {
        // Route through Relay
        const relaySignalDbm = Math.max(-95, -40 - (distToRelay / 1000) * 30);
        const quality = Math.max(0, Math.min(100, ((relaySignalDbm - -95) / (-45 - -95)) * 100));
        links.push({
          fromId: drone.id,
          toId: currentRelay.id,
          signalStrengthDbm: Math.round(relaySignalDbm),
          latencyMs: Math.round(28 + (distToRelay / 1000) * 12),
          bandwidthMbps: Number((30 * (quality / 100)).toFixed(1)),
          packetLossPercent: Number((Math.max(0, (100 - quality) * 0.08)).toFixed(2)),
          isRelayRoute: true,
          qualityScore: Math.round(quality),
        });
      } else {
        isolatedNodeIds.push(drone.id);
      }
    }

    // Drone-to-Drone neighbor crosslinks (mesh backbone)
    const activeDrones = drones.filter((d) => d.status !== 'FAILED' && d.status !== 'DISCONNECTED');
    for (let i = 0; i < activeDrones.length; i++) {
      for (let j = i + 1; j < activeDrones.length; j++) {
        const d1 = activeDrones[i];
        const d2 = activeDrones[j];
        const dist = this.calculateDistanceMeters(d1.position, d2.position);
        if (dist < 800) {
          const d2dSignal = Math.max(-95, -42 - (dist / 1000) * 32);
          const quality = Math.max(0, Math.min(100, ((d2dSignal - -95) / (-45 - -95)) * 100));
          links.push({
            fromId: d1.id,
            toId: d2.id,
            signalStrengthDbm: Math.round(d2dSignal),
            latencyMs: Math.round(8 + (dist / 1000) * 6),
            bandwidthMbps: Number((54 * (quality / 100)).toFixed(1)),
            packetLossPercent: Number((Math.max(0, (100 - quality) * 0.03)).toFixed(2)),
            isRelayRoute: false,
            qualityScore: Math.round(quality),
          });
        }
      }
    }

    const avgLatency =
      links.length > 0 ? Math.round(links.reduce((sum, l) => sum + l.latencyMs, 0) / links.length) : 35;
    const meshHealth = Math.round(
      Math.max(0, 100 - isolatedNodeIds.length * 25 - (avgLatency > 40 ? 15 : 0))
    );
    const coverage = Math.round(
      ((drones.length - isolatedNodeIds.length) / Math.max(1, drones.length)) * 100
    );

    return {
      topology: {
        nodes,
        links,
        activeRelayId: this.activeRelayDroneId,
        meshHealthScore: meshHealth,
        averageLatencyMs: avgLatency,
        coveragePercent: coverage,
        isolatedNodeIds,
      },
      decisionLogs,
    };
  }
}
