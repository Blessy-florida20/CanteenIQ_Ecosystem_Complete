import React, { useState } from 'react';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  FlaskConical,
  TrendingUp,
  Network,
  AlertTriangle,
  ChefHat,
  Sliders,
  Sparkles,
  ClipboardCheck,
  Grid,
  Users,
  Clock,
  MessageSquare,
  Activity,
  Leaf,
  FileText,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type NavigationPage =
  | 'dashboard'
  | 'studio'
  | 'eda'
  | 'stats'
  | 'forecasting'
  | 'associations'
  | 'anomalies'
  | 'planner'
  | 'whatif'
  | 'recommendations'
  | 'decisions'
  | 'menu-matrix'
  | 'customers'
  | 'digital-twin'
  | 'assistant'
  | 'drift'
  | 'waste-lab'
  | 'reports'
  | 'methodology';

interface SidebarProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
}

interface NavGroup {
  label: string;
  items: Array<{
    id: NavigationPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview & Data',
    items: [
      { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      { id: 'studio', label: 'Data Studio & Cleaner', icon: Database },
      { id: 'eda', label: 'Exploratory Analytics', icon: BarChart3 }
    ]
  },
  {
    label: 'Analytics & Models',
    items: [
      { id: 'stats', label: 'Statistical Laboratory', icon: FlaskConical },
      { id: 'forecasting', label: 'Demand Forecasting', icon: TrendingUp },
      { id: 'associations', label: 'Product Associations', icon: Network },
      { id: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle }
    ]
  },
  {
    label: 'Planning & Simulation',
    items: [
      { id: 'planner', label: 'Prep Planner (Newsvendor)', icon: ChefHat },
      { id: 'whatif', label: 'What-If Simulator', icon: Sliders },
      { id: 'menu-matrix', label: 'Menu Engineering Matrix', icon: Grid },
      { id: 'digital-twin', label: 'Queue Digital Twin', icon: Clock }
    ]
  },
  {
    label: 'Prescription & AI',
    items: [
      { id: 'recommendations', label: 'Recommendation Center', icon: Sparkles },
      { id: 'decisions', label: 'Decision Impact Tracker', icon: ClipboardCheck },
      { id: 'assistant', label: 'Ask CanteenIQ (Offline)', icon: MessageSquare, badge: 'Offline' }
    ]
  },
  {
    label: 'Customer & Health',
    items: [
      { id: 'customers', label: 'Customer Cohorts (RFM)', icon: Users },
      { id: 'drift', label: 'Data Drift Monitor', icon: Activity },
      { id: 'waste-lab', label: 'Waste Scenario Lab', icon: Leaf }
    ]
  },
  {
    label: 'Deliverables',
    items: [
      { id: 'reports', label: 'Reports & Exports', icon: FileText },
      { id: 'methodology', label: 'Methodology & Viva Q&A', icon: BookOpen }
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`relative border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 flex flex-col z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 shadow-sm transition"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.label}
              </h3>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectPage(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-teal-500 text-white font-semibold shadow-sm shadow-teal-500/20'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          Closed Decision Loop v2.0
        </div>
      )}
    </aside>
  );
};
