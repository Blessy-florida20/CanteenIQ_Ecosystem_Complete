import React from 'react';
import { Filter, Calendar, Tag, RefreshCw, Eye } from 'lucide-react';
import { GlobalFilters, DatasetInfo } from '../../types/api';

interface GlobalFilterBarProps {
  filters: GlobalFilters;
  onChangeFilters: (newFilters: GlobalFilters) => void;
  datasets: DatasetInfo[];
  onOpenEvidence: (evidenceInfo: { title: string; formula: string; rowCount: number; dataSlice: any[] }) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'Breakfast', label: 'Breakfast' },
  { id: 'Snacks', label: 'Snacks' },
  { id: 'Meals', label: 'Meals' },
  { id: 'Beverages', label: 'Beverages' },
  { id: 'Desserts', label: 'Desserts' },
  { id: 'Healthy', label: 'Healthy Options' }
];

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  filters,
  onChangeFilters,
  datasets,
  onOpenEvidence
}) => {
  const handleReset = () => {
    onChangeFilters({
      startDate: undefined,
      endDate: undefined,
      category: 'all',
      productId: 'all',
      datasetId: datasets[0]?.id || 'synthetic_transactions.csv'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Filter Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        {/* Dataset Selector */}
        <select
          value={filters.datasetId}
          onChange={(e) => onChangeFilters({ ...filters, datasetId: e.target.value })}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          {datasets.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.row_count.toLocaleString()} rows)
            </option>
          ))}
        </select>

        {/* Category Selector */}
        <div className="flex items-center space-x-1">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.category}
            onChange={(e) => onChangeFilters({ ...filters, category: e.target.value })}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Bounds */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onChangeFilters({ ...filters, startDate: e.target.value || undefined })}
            className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none text-[11px]"
            title="Start Date"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onChangeFilters({ ...filters, endDate: e.target.value || undefined })}
            className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none text-[11px]"
            title="End Date"
          />
        </div>

        {/* Reset Button */}
        {(filters.startDate || filters.endDate || filters.category !== 'all') && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Right: Show Evidence Shortcut */}
      <button
        onClick={() =>
          onOpenEvidence({
            title: 'Global Filter Query & Aggregation Trace',
            formula: 'Filtered DataFrame = DF[date >= start && date <= end && category == chosen]',
            rowCount: datasets.find((d) => d.id === filters.datasetId)?.row_count || 24572,
            dataSlice: [
              { filter: 'Dataset ID', value: filters.datasetId },
              { filter: 'Category', value: filters.category },
              { filter: 'Date Range', value: `${filters.startDate || '2025-01-01'} to ${filters.endDate || '2025-12-31'}` }
            ]
          })
        }
        className="flex items-center space-x-1.5 text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 font-medium px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 transition"
        title="Show Evidence & Mathematical Formula Trace"
      >
        <Eye className="w-3.5 h-3.5 text-teal-500" />
        <span>Evidence Trace</span>
      </button>
    </div>
  );
};
