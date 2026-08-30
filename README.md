# SwarmOS — Intelligence for a Drone Swarm

![SwarmOS Mission Control](https://img.shields.io/badge/SwarmOS-v2.4_C2-00f0ff?style=for-the-badge)
![Multi-Agent](https://img.shields.io/badge/Architecture-Decentralized_Mesh-10b981?style=for-the-badge)
![Simulation](https://img.shields.io/badge/Engine-20Hz_RealTime-3b82f6?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production_Ready-f59e0b?style=for-the-badge)

**SwarmOS** is an AI-powered multi-agent drone coordination and decision-support platform designed for urban disaster-response scenarios (e.g. major earthquakes, structural collapses, high-density rubble search & rescue).

Instead of controlling a single drone, the system manages a swarm of autonomous drones that cooperate, share information, allocate tasks with explicit mathematical reasoning, detect hardware/communication failures, avoid 3D collisions, and dynamically reorganize the mission in real time.

---

## 🚁 Primary Disaster Scenario

- **Disaster Context**: Urban Earthquake (Magnitude 7.2 in Downtown High-Rise Rubble District).
- **Simulated Swarm Units**:
  - **Drone 01 — SPECTER-1 (Mapper)**: High-altitude 3D photogrammetry, obstacle mapping, road blockage segmentation.
  - **Drone 02 — SEEKER-2 (Search)**: Void search, survivor identification, GPS optical sweeping.
  - **Drone 03 — NEXUS-3 (Relay)**: 110m Sky anchor, ad-hoc 5.8GHz mesh repeater, ground command bridge.
  - **Drone 04 — PYRO-4 (Thermal)**: Radiometric FLIR infrared, biometric temperature confirmation ($37.4^\circ\text{C}$).

---

## ⚡ Key Features

1. **Centralized Swarm Intelligence Scoring Model**:
   $$\text{Task Score} = W_p \cdot \text{Priority} + W_d \cdot \text{DistEfficiency} + W_b \cdot \text{BattSuitability} + W_c \cdot \text{CapMatch} + W_q \cdot \text{CommQuality} - W_w \cdot \text{Workload}$$
2. **Dynamic 9-Step Failure Recovery Engine**:
   - Watches drone telemetry & heartbeat in real-time.
   - Detects failures/jams/battery drops ($< 20\%$).
   - Automatically harvests unfinished tasks and reallocates to optimal candidates with zero mission downtime.
3. **Predictive 3D Collision Avoidance**:
   - 25m horizontal safety radius & 15m vertical separation.
   - Computes dynamic altitude deconfliction vectors ($\pm 15\text{m}$) or divergence waypoints when trajectories converge.
4. **Ad-Hoc Mesh Communication & Relay Failover**:
   - Distance-based RF attenuation and multi-hop routing.
   - Automatic relay re-election if the primary relay node degrades.
5. **Computer Vision Simulation**:
   - 4-Channel live feeds (Optical RGB, FLIR Thermal, LiDAR 3D, Skyview).
   - Bounding boxes, confidence scores, and automatic task generation upon survivor discovery.
6. **1-Click 10-Phase Presentation Demo**:
   - Press **"LAUNCH DEMO"** to watch the entire autonomous sequence play out seamlessly.

---

## 📁 Repository Structure

```
SwarmOS/
├── shared/                       # Shared TypeScript types, schemas & constants
│   └── src/
│       ├── types.ts              # Drone, Task, Collision, Mesh, AI Log types
│       └── constants.ts          # Seed data, disaster sectors, safety parameters
├── backend/                      # Node.js + Express + Socket.IO + Simulation Engine
│   └── src/
│       ├── core/
│       │   ├── SwarmIntelligenceEngine.ts   # Multi-criteria scoring algorithm
│       │   ├── CollisionAvoidanceEngine.ts  # 3D collision detection & stepping
│       │   ├── FailureRecoveryEngine.ts     # Health monitor & task salvage
│       │   ├── CVDetectionEngine.ts         # Simulated CV detection stream
│       │   ├── NetworkTopologyEngine.ts     # Mesh routing & relay failover
│       │   └── NavigationSLAMEngine.ts      # GPS/SLAM EKF sensor fusion
│       ├── simulation/
│       │   ├── SimulationManager.ts         # 20Hz loop, clock, chaos controls
│       │   └── DemoScriptRunner.ts          # 10-stage autonomous demo runner
│       ├── routes/api.ts                    # REST API endpoints
│       └── server.ts                        # HTTP & WebSocket server entry
├── frontend/                     # React + TypeScript + Vite + Tailwind CSS
│   └── src/
│       ├── components/
│       │   ├── layout/                      # Sidebar, TopBar, Search, Alerts
│       │   ├── map/TacticalRadarMap.tsx     # High-performance Canvas radar
│       │   └── fleet/DroneInspectorSlideOver.tsx # Live telemetry inspector
│       ├── views/                           # 12 navigation views
│       ├── context/SwarmContext.tsx         # Global WebSocket state provider
│       └── App.tsx
└── README.md
```

---

## 🚀 Quickstart & Running Locally

### 1. Install Dependencies
```bash
# Install root, shared, backend, and frontend packages
npm install
npm --prefix shared install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Build Shared Types
```bash
npm run build:shared
```

### 3. Run Backend (Port 5000)
```bash
npm run dev:backend
```

### 4. Run Frontend (Port 3000)
```bash
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) to view the Mission Control Center.

---

## 🎮 Presentation Demonstration (1-Click)

1. Click the **"LAUNCH DEMO"** button in the top navigation bar.
2. Watch the 10-phase sequence:
   - **Phase 1**: Swarm airborne formation takeoff.
   - **Phase 2**: Drone 01 maps Sector A-01 and identifies road blockage.
   - **Phase 3**: Drone 02 locates trapped survivor in Sector B-14.
   - **Phase 4**: Swarm dispatches Drone 04 (Thermal) for verification.
   - **Phase 5**: Drone 02 battery drops and motor failure is injected.
   - **Phase 6**: AI Watchdog detects failure and harvests pending tasks.
   - **Phase 7**: Tasks automatically redistributed to Drone 04 and Drone 01 with full mathematical reasoning.
   - **Phase 8**: Predictive collision risk detected between intersecting paths.
   - **Phase 9**: Drone 01 autonomously climbs $+15\text{m}$ to deconflict safely.
   - **Phase 10**: Search objectives cleared and mission completed!

---

## ⚖️ License
MIT License. Built for Autonomous Systems & Multi-Agent Robotics Engineering.
