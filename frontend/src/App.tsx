import React from 'react';
import { SwarmProvider, useSwarm } from './context/SwarmContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { EmergencyAlertBanner } from './components/layout/EmergencyAlertBanner';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';

// Views
import { OverviewView } from './views/OverviewView';
import { LiveMapView } from './views/LiveMapView';
import { FleetView } from './views/FleetView';
import { MissionPlannerView } from './views/MissionPlannerView';
import { TaskAllocationView } from './views/TaskAllocationView';
import { AIDetectionView } from './views/AIDetectionView';
import { NetworkTopologyView } from './views/NetworkTopologyView';
import { SimulationLabView } from './views/SimulationLabView';
import { IncidentsView } from './views/IncidentsView';
import { AnalyticsView } from './views/AnalyticsView';
import { SystemLogsView } from './views/SystemLogsView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab } = useSwarm();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'live-map':
        return <LiveMapView />;
      case 'fleet':
        return <FleetView />;
      case 'mission-planner':
        return <MissionPlannerView />;
      case 'tasks':
        return <TaskAllocationView />;
      case 'ai-detection':
        return <AIDetectionView />;
      case 'network':
        return <NetworkTopologyView />;
      case 'simulation':
        return <SimulationLabView />;
      case 'incidents':
        return <IncidentsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'logs':
        return <SystemLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#060a12] text-slate-100 font-sans">
      {/* Tactical Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Telemetry Bar */}
        <TopBar />

        {/* Dynamic Emergency Failure Banner if active */}
        <EmergencyAlertBanner />

        {/* Dynamic Navigation View */}
        <main className="flex-1 flex overflow-hidden relative bg-[#080d18]">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Quick Search Modal (Cmd+K) */}
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <SwarmProvider>
      <MainLayout />
    </SwarmProvider>
  );
}
