import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Scale
} from 'lucide-react';
import { Decision } from '../types/api';
import { fetchDecisions } from '../services/api';

export const DecisionTrackerPage: React.FC = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDecisions();
  }, []);

  const loadDecisions = async () => {
    setIsLoading(true);
    try {
      const res = await fetchDecisions();
      setDecisions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
          <ClipboardCheck className="w-6 h-6 text-teal-500" />
          <span>Decision Impact Tracker (Closed Decision Loop)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Closes the operational analytics loop by tracking accepted recommendations against observed outcomes
        </p>
      </div>

      {/* Prominent Causal Honesty Warning */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold">Strict Academic Causal-Honesty Safeguard</h4>
          <p className="leading-relaxed text-amber-800 dark:text-amber-300 text-[11px]">
            Before-and-after metric comparisons do NOT prove causal impact. In an institutional environment, 
            confounding factors—such as exam schedules, seasonal weather shifts, cultural fests, and syllabus completion—frequently 
            account for observed changes. CanteenIQ reports raw empirical differences and control-window proxies without claiming causal certainty.
          </p>
        </div>
      </div>

      {/* Decisions List Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Operational Decision Log ({decisions.length} recorded)
          </h3>
          <span className="text-xs text-slate-400">Persisted in SQLite database</span>
        </div>

        {decisions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            No decisions logged yet. Visit the Recommendation Center and click "Accept & Track" on any proposal to populate this tracker.
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <th className="p-3 font-semibold">Decision Title</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Action Taken</th>
                  <th className="p-3 font-semibold">Baseline Metric</th>
                  <th className="p-3 font-semibold">Observed Post-Action</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                    <td className="p-3 font-sans font-semibold text-slate-900 dark:text-slate-100">{d.title}</td>
                    <td className="p-3 font-sans text-slate-500">{d.category}</td>
                    <td className="p-3 font-sans text-slate-700 dark:text-slate-300 max-w-xs truncate">{d.action_taken}</td>
                    <td className="p-3">₹{d.baseline_metric}</td>
                    <td className="p-3 font-bold text-teal-600 dark:text-teal-400">
                      {d.observed_metric ? `₹${d.observed_metric}` : 'Monitoring...'}
                    </td>
                    <td className="p-3 font-sans">
                      <span className="px-2 py-0.5 rounded font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
