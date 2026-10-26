import React from 'react';
import {
  Sun,
  Moon,
  Play,
  HelpCircle,
  Command,
  Database,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { DatasetInfo } from '../../types/api';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeDataset?: DatasetInfo;
  onOpenCommandPalette: () => void;
  onOpenTour: () => void;
  onRunPipeline: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  onToggleTheme,
  activeDataset,
  onOpenCommandPalette,
  onOpenTour,
  onRunPipeline
}) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Brand & Dataset Indicator */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-teal-700 dark:from-white dark:to-teal-300 bg-clip-text text-transparent">
                CanteenIQ
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Intelligent Canteen Analytics & Decision Loop
            </p>
          </div>
        </div>

        {/* Active Dataset Chip */}
        {activeDataset && (
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-teal-200 dark:border-teal-800/60 bg-teal-50/50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 ml-4">
            <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold">{activeDataset.name}</span>
            <span className="text-teal-500 dark:text-teal-400">•</span>
            <span>{activeDataset.row_count.toLocaleString()} rows</span>
            {activeDataset.is_synthetic && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 ml-1">
                Simulated
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition"
          title="Search pages and actions (Ctrl+K)"
        >
          <Command className="w-3.5 h-3.5" />
          <span>Search or Jump...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[10px] font-mono shadow-sm">
            Ctrl+K
          </kbd>
        </button>

        {/* Run Full Pipeline Button */}
        <button
          onClick={onRunPipeline}
          className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
          title="Run entire generation, forecasting, and reporting pipeline"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Run Pipeline</span>
        </button>

        {/* Guided Tour */}
        <button
          onClick={onOpenTour}
          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Start 5-Minute Tour"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Toggle Light/Dark Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
