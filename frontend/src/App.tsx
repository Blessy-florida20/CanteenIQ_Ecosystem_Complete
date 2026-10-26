import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavigationPage } from './components/common/Sidebar';
import { GlobalFilterBar } from './components/common/GlobalFilterBar';
import { EvidenceDrawer, EvidenceInfo } from './components/common/EvidenceDrawer';
import { CommandPalette } from './components/common/CommandPalette';
import { GuidedTourModal } from './components/common/GuidedTourModal';
import { PipelineProgressModal } from './components/common/PipelineProgressModal';

import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { DataStudio } from './pages/DataStudio';
import { EDAPage } from './pages/EDAPage';
import { StatisticalLabPage } from './pages/StatisticalLabPage';
import { ForecastingStudioPage } from './pages/ForecastingStudioPage';
import { AssociationMiningPage } from './pages/AssociationMiningPage';
import { AnomalyDetectionPage } from './pages/AnomalyDetectionPage';
import { PreparationPlannerPage } from './pages/PreparationPlannerPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { RecommendationCenterPage } from './pages/RecommendationCenterPage';
import { DecisionTrackerPage } from './pages/DecisionTrackerPage';
import { MenuEngineeringPage } from './pages/MenuEngineeringPage';
import { CustomerInsightsPage } from './pages/CustomerInsightsPage';
import { DigitalTwinQueuePage } from './pages/DigitalTwinQueuePage';
import { AskCanteenIQPage } from './pages/AskCanteenIQPage';
import { DriftMonitorPage } from './pages/DriftMonitorPage';
import { WasteScenarioLabPage } from './pages/WasteScenarioLabPage';
import { ReportsExportsPage } from './pages/ReportsExportsPage';
import { MethodologyInfoPage } from './pages/MethodologyInfoPage';

import { GlobalFilters, DatasetInfo } from './types/api';
import { fetchDatasets } from './services/api';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('canteeniq_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Navigation state
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');

  // Datasets & Global Filters
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [filters, setFilters] = useState<GlobalFilters>({
    datasetId: 'synthetic_transactions.csv',
    category: 'all',
    productId: 'all'
  });

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isPipelineOpen, setIsPipelineOpen] = useState(false);
  const [evidenceDrawer, setEvidenceDrawer] = useState<{
    isOpen: boolean;
    info: EvidenceInfo | null;
  }>({
    isOpen: false,
    info: null
  });

  // Apply dark class to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('canteeniq_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('canteeniq_theme', 'light');
    }
  }, [isDarkMode]);

  // Load available datasets
  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const data = await fetchDatasets();
      if (data && data.length > 0) {
        setDatasets(data);
        setFilters((prev) => ({
          ...prev,
          datasetId: prev.datasetId || data[0].id
        }));
      }
    } catch (err) {
      console.error('Failed to load datasets', err);
    }
  };

  const handleOpenEvidence = (info: EvidenceInfo) => {
    setEvidenceDrawer({ isOpen: true, info });
  };

  const activeDataset = datasets.find((d) => d.id === filters.datasetId) || datasets[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        activeDataset={activeDataset}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onRunPipeline={() => setIsPipelineOpen(true)}
      />

      {/* Global Filter Bar */}
      <GlobalFilterBar
        filters={filters}
        onChangeFilters={setFilters}
        datasets={datasets}
        onOpenEvidence={handleOpenEvidence}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar currentPage={currentPage} onSelectPage={setCurrentPage} />

        {/* Center / Right Content Panel */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {currentPage === 'dashboard' && (
            <ExecutiveDashboard
              filters={filters}
              onOpenEvidence={handleOpenEvidence}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'studio' && <DataStudio filters={filters} />}

          {currentPage === 'eda' && (
            <EDAPage filters={filters} />
          )}

          {currentPage === 'stats' && <StatisticalLabPage filters={filters} />}

          {currentPage === 'forecasting' && <ForecastingStudioPage filters={filters} />}

          {currentPage === 'associations' && <AssociationMiningPage filters={filters} />}

          {currentPage === 'anomalies' && <AnomalyDetectionPage filters={filters} />}

          {currentPage === 'planner' && <PreparationPlannerPage filters={filters} />}

          {currentPage === 'whatif' && <WhatIfSimulatorPage filters={filters} />}

          {currentPage === 'menu-matrix' && <MenuEngineeringPage filters={filters} />}

          {currentPage === 'digital-twin' && <DigitalTwinQueuePage />}

          {currentPage === 'recommendations' && (
            <RecommendationCenterPage
              filters={filters}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'decisions' && <DecisionTrackerPage />}

          {currentPage === 'assistant' && <AskCanteenIQPage filters={filters} />}

          {currentPage === 'customers' && <CustomerInsightsPage filters={filters} />}

          {currentPage === 'drift' && <DriftMonitorPage filters={filters} />}

          {currentPage === 'waste-lab' && <WasteScenarioLabPage />}

          {currentPage === 'reports' && <ReportsExportsPage filters={filters} />}

          {currentPage === 'methodology' && <MethodologyInfoPage />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <EvidenceDrawer
        isOpen={evidenceDrawer.isOpen}
        onClose={() => setEvidenceDrawer({ isOpen: false, info: null })}
        evidence={evidenceDrawer.info}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectPage={(page) => {
          setCurrentPage(page);
          setIsCommandPaletteOpen(false);
        }}
        onRunPipeline={() => {
          setIsCommandPaletteOpen(false);
          setIsPipelineOpen(true);
        }}
        onOpenTour={() => {
          setIsCommandPaletteOpen(false);
          setIsTourOpen(true);
        }}
      />

      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onJumpToPage={(page) => {
          setCurrentPage(page);
          setIsTourOpen(false);
        }}
      />

      <PipelineProgressModal
        isOpen={isPipelineOpen}
        onClose={() => setIsPipelineOpen(false)}
        datasetId={filters.datasetId}
      />
    </div>
  );
};

export default App;
