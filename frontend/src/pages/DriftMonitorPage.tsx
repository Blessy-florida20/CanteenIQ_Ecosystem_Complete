import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { GlobalFilters } from '../types/api';
import { checkDrift } from '../services/api';

interface DriftMonitorPageProps {
  filters: GlobalFilters;
}

export const DriftMonitorPage: React.FC<DriftMonitorPageProps> = ({ filters }) => {
  const [driftData, setDriftData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDrift();
  }, [filters.datasetId]);

  const loadDrift = async () => {
    setIsLoading(true);
    try {
      const res = await checkDrift(filters.datasetId);
      setDriftData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !driftData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Activity className="w-6 h-6 text-teal-500" />
          <span>Data Health & Concept Drift Monitor</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Compares recent 30-day operating window against historical baseline using Kolmogorov-Smirnov distribution testing
        </p>
      </div>

      {/* Drift Status Banner */}
      <div
        className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
          driftData.drift_detected
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            : 'bg-teal-500/10 border-teal-500/30 text-teal-900 dark:text-teal-200'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          {driftData.drift_detected ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          )}
          <div>
            <h4 className="font-bold">{driftData.status}</h4>
            <p className="text-[11px] opacity-90">{driftData.retraining_recommendation}</p>
          </div>
        </div>

        <div className="text-right font-mono text-[11px]">
          <div>KS Statistic: <b>{driftData.ks_statistic}</b></div>
          <div>p-value: <b>{driftData.ks_p_value}</b></div>
        </div>
      </div>

      {/* Windows Comparison Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Historical Baseline Period</span>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{driftData.baseline_window}</div>
          <p className="text-[11px] text-slate-500">Benchmark training distribution</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Monitoring Window (Latest 30 Days)</span>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{driftData.recent_window}</div>
          <p className="text-[11px] text-slate-500">Live operational observation window</p>
        </div>
      </div>

      {/* Category Mix Shifts Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Category Mix & Volume Shift Detection
        </h3>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Baseline Share %</th>
                <th className="p-3 font-semibold">Recent Share %</th>
                <th className="p-3 font-semibold">Variance Delta %</th>
              </tr>
            </thead>
            <tbody>
              {driftData.category_mix_shifts.map((cat: any) => (
                <tr key={cat.category} className="border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                  <td className="p-3 font-sans font-semibold text-slate-900 dark:text-slate-100">{cat.category}</td>
                  <td className="p-3">{cat.baseline_share_pct}%</td>
                  <td className="p-3">{cat.recent_share_pct}%</td>
                  <td className="p-3 font-bold">
                    <span className={cat.delta_pct > 0 ? 'text-teal-600' : 'text-rose-500'}>
                      {cat.delta_pct > 0 ? '+' : ''}{cat.delta_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
