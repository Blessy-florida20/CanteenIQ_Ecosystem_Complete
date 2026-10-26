import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { NavigationPage } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: NavigationPage) => void;
  onRunPipeline: () => void;
  onOpenTour: () => void;
}

const COMMAND_ITEMS: Array<{ id: NavigationPage; title: string; category: string; description: string }> = [
  { id: 'dashboard', title: 'Executive Dashboard', category: 'Overview', description: 'Real-time KPIs, Canteen Health Score, and daily revenue' },
  { id: 'studio', title: 'Data Studio & Cleaner', category: 'Data', description: 'Upload, inspect lineage, and quarantine corrupted rows' },
  { id: 'eda', title: 'Exploratory Data Analysis', category: 'Analytics', description: 'Pareto ABC, Gini curve, footfall heatmaps, and change points' },
  { id: 'stats', title: 'Statistical Laboratory', category: 'Analytics', description: 'Hypothesis tests, normality diagnostics, and Assumption Advisor' },
  { id: 'forecasting', title: 'Demand Forecasting Studio', category: 'Models', description: 'Walk-forward backtesting, model leaderboard, and model cards' },
  { id: 'associations', title: 'Product Association Mining', category: 'Models', description: 'Apriori cross-sell rules, network graph, and bundle simulator' },
  { id: 'anomalies', title: 'Anomaly Detection Lab', category: 'Models', description: 'MAD, IQR, Isolation Forest evaluated against ground-truth' },
  { id: 'planner', title: 'Smart Preparation Planner', category: 'Operations', description: 'Newsvendor critical ratio and Monte Carlo waste optimization' },
  { id: 'whatif', title: 'What-If Business Simulator', category: 'Operations', description: 'Price elasticity log-log regression and tornado sensitivity' },
  { id: 'menu-matrix', title: 'Menu Engineering Matrix', category: 'Operations', description: 'BCG Stars, Plowhorses, Puzzles, Dogs, and ABC/XYZ demand' },
  { id: 'digital-twin', title: 'Canteen Digital Twin', category: 'Simulation', description: 'Discrete-event queue simulation and hourly staffing SLA' },
  { id: 'recommendations', title: 'Recommendation Center', category: 'Prescription', description: 'Deterministic prioritized business recommendations' },
  { id: 'decisions', title: 'Decision Impact Tracker', category: 'Prescription', description: 'Before/after tracking with causal-honesty safeguards' },
  { id: 'assistant', title: 'Ask CanteenIQ (Offline)', category: 'AI', description: 'Deterministic offline natural language analytics assistant' },
  { id: 'customers', title: 'Customer Insights & Cohorts', category: 'Customer', description: 'RFM segmentation, K-Means clustering, and retention heatmaps' },
  { id: 'drift', title: 'Data Drift Monitor', category: 'Quality', description: 'Kolmogorov-Smirnov test and category mix shift alerts' },
  { id: 'waste-lab', title: 'Waste Scenario Lab', category: 'Sustainability', description: 'Monte Carlo simulation of naive vs forecast food waste' },
  { id: 'reports', title: 'Reports & Exports Engine', category: 'Deliverables', description: 'Download Excel, ReportLab PDF, Word report, and 22-slide PPT' },
  { id: 'methodology', title: 'Methodology & Viva Guide', category: 'Deliverables', description: '60+ viva defense Q&A, comprehensive glossary, and diagrams' }
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectPage,
  onRunPipeline,
  onOpenTour
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = COMMAND_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (page: NavigationPage) => {
    onSelectPage(page);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search pages, models, reports or type an action..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Shortcuts */}
        <div className="p-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-[11px] text-slate-500">
          <span>Quick Actions:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onRunPipeline();
              }}
              className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-semibold hover:underline"
            >
              Run Pipeline
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenTour();
              }}
              className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:underline"
            >
              Start Tour
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching pages found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-100'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                  <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Use arrows to navigate, Enter to select</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
