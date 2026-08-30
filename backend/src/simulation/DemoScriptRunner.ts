import { SimulationManager } from './SimulationManager';

export interface DemoPhase {
  index: number;
  name: string;
  durationSeconds: number;
  action: (sim: SimulationManager) => void;
}

export class DemoScriptRunner {
  private sim: SimulationManager;
  private currentPhaseIndex = 0;
  private phaseTimer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(sim: SimulationManager) {
    this.sim = sim;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getCurrentPhase(): { index: number; name: string } {
    return {
      index: this.currentPhaseIndex,
      name: this.phases[this.currentPhaseIndex]?.name || 'IDLE',
    };
  }

  public startDemo() {
    this.stopDemo();
    this.isRunning = true;
    this.currentPhaseIndex = 0;
    this.sim.resetSimulation();
    this.sim.startSimulation();
    this.executeCurrentPhase();
  }

  public stopDemo() {
    this.isRunning = false;
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
  }

  private executeCurrentPhase() {
    if (!this.isRunning || this.currentPhaseIndex >= this.phases.length) {
      this.stopDemo();
      return;
    }

    const phase = this.phases[this.currentPhaseIndex];
    console.log(`[DEMO SCRIPT] Starting Phase ${phase.index + 1}/${this.phases.length}: ${phase.name}`);
    
    // Execute phase actions
    phase.action(this.sim);

    // Schedule next phase
    this.phaseTimer = setTimeout(() => {
      this.currentPhaseIndex++;
      this.executeCurrentPhase();
    }, phase.durationSeconds * 1000);
  }

  private phases: DemoPhase[] = [
    {
      index: 0,
      name: 'Phase 1: Mission Launch & Swarm Airborne Formation',
      durationSeconds: 4,
      action: (sim) => {
        sim.addSystemLog(
          'MISSION_UPDATE',
          'INFO',
          'Autonomous Swarm Deployment Initialized',
          'All 4 drones deployed in coordinated formation.',
          'Mission objective: 3D urban mapping, survivor search, and mesh network stabilization.',
          'Commanded coordinated takeoff: Drone 01 (70m), Drone 02 (50m), Drone 03 (110m), Drone 04 (45m).'
        );
      },
    },
    {
      index: 1,
      name: 'Phase 2: Orthophoto Mapping & Road Blockage Identified',
      durationSeconds: 5,
      action: (sim) => {
        const drone01 = sim.getDrone('drone-01');
        if (drone01) {
          sim.injectDetection('drone-01', 'BLOCKED_ROAD', 92, 'Overhead collapsed footbridge blocking emergency access.');
        }
      },
    },
    {
      index: 2,
      name: 'Phase 3: Area Search & Possible Survivor Detected',
      durationSeconds: 5,
      action: (sim) => {
        const drone02 = sim.getDrone('drone-02');
        if (drone02) {
          sim.injectDetection('drone-02', 'PERSON', 95, 'Civilian trapped under structural concrete void in Sector B-14.');
        }
      },
    },
    {
      index: 3,
      name: 'Phase 4: High-Priority Thermal Verification Dispatched',
      durationSeconds: 5,
      action: (sim) => {
        sim.addSystemLog(
          'TASK_ALLOCATION',
          'CRITICAL',
          'Thermal Verification Dispatched to PYRO-4',
          'Drone 04 (Thermal) tasked with infrared biometric confirmation.',
          'Survivor detection in Sector B-14 requires FLIR thermal confirmation before ground rescue deployment.',
          'Assigned task to Drone 04. Vector set to Civic Center sector.'
        );
      },
    },
    {
      index: 4,
      name: 'Phase 5: Drone 02 Critical Battery & Motor Degradation',
      durationSeconds: 5,
      action: (sim) => {
        sim.triggerDroneFailure('drone-02', 'Sudden battery cell failure and rotor motor RPM degradation', 'FAILED');
      },
    },
    {
      index: 5,
      name: 'Phase 6: Central AI Watchdog Detects Failure & Salvages Tasks',
      durationSeconds: 4,
      action: (sim) => {
        sim.addSystemLog(
          'FAILURE_RECOVERY',
          'CRITICAL',
          'Swarm Intelligence Recalculating Optimal Task Mesh',
          'Failure watchdog harvested unfinished tasks from Drone 02.',
          'Evaluating available fleet: Drone 01, Drone 03, Drone 04 against capability and distance matrices.',
          'Reallocating tasks to avoid search gap.'
        );
      },
    },
    {
      index: 6,
      name: 'Phase 7: Autonomous Multi-Agent Task Redistribution',
      durationSeconds: 5,
      action: (sim) => {
        sim.addSystemLog(
          'TASK_ALLOCATION',
          'SUCCESS',
          'Tasks Successfully Reassigned to Drone 04 & Drone 01',
          'Sector B-14 search tasks absorbed by Drone 04 (Search/Thermal) and Drone 01 (Mapper).',
          'Dynamic multi-criteria scoring algorithm selected closest capable units with >70% battery.',
          'Zero mission downtime achieved. Flight corridors updated.'
        );
      },
    },
    {
      index: 7,
      name: 'Phase 8: Predictive Collision Conflict Detected',
      durationSeconds: 4,
      action: (sim) => {
        const d1 = sim.getDrone('drone-01');
        const d4 = sim.getDrone('drone-04');
        if (d1 && d4) {
          sim.triggerCollisionRisk('drone-01', 'drone-04');
        }
      },
    },
    {
      index: 8,
      name: 'Phase 9: Autonomous 3D Altitude Deconfliction Executed',
      durationSeconds: 5,
      action: (sim) => {
        sim.addSystemLog(
          'COLLISION_AVOIDANCE',
          'SUCCESS',
          'Proximity Deconfliction Completed Safely',
          'Drone 01 climbed +15m (Alt: 85m); Drone 04 maintained 45m thermal sweep lane.',
          '3D separation envelope restored to 42.5m. Safe flight paths confirmed.',
          'Deconfliction event logged to Blackbox telemetry.'
        );
      },
    },
    {
      index: 9,
      name: 'Phase 10: Communication Mesh Reconfigured & Target Achieved',
      durationSeconds: 6,
      action: (sim) => {
        sim.addSystemLog(
          'MISSION_UPDATE',
          'SUCCESS',
          'All Search Objectives Cleared — Mission Phase Alpha Complete',
          'Search coverage achieved 88.6%. 6 survivors localized and verified.',
          'Relay mesh maintained 99.8% packet delivery across all forward nodes.',
          'Swarm transitioning to persistent surveillance and beacon mode.'
        );
      },
    },
  ];
}
