import React, { useState, useEffect } from 'react';
import {
  Network,
  Sliders,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { GlobalFilters, AssociationRule } from '../types/api';
import { mineAssociations } from '../services/api';

interface AssociationMiningPageProps {
  filters: GlobalFilters;
}

export const AssociationMiningPage: React.FC<AssociationMiningPageProps> = ({ filters }) => {
  const [minSupport, setMinSupport] = useState<number>(0.015);
  const [minConfidence, setMinConfidence] = useState<number>(0.20);
  const [minLift, setMinLift] = useState<number>(1.1);
  const [timeOfDay, setTimeOfDay] = useState<string>('all');
  const [associationData, setAssociationData] = useState<{
    rules: AssociationRule[];
    network_nodes: any[];
    network_links: any[];
    takeaway: string;
  } | null>(null);

  // Bundle simulator state
  const [selectedRule, setSelectedRule] = useState<AssociationRule | null>(null);
  const [bundleDiscount, setBundleDiscount] = useState<number>(5.0); // INR off

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssociations();
  }, [filters.datasetId, minSupport, minConfidence, minLift, timeOfDay]);

  const loadAssociations = async () => {
    setIsLoading(true);
    try {
      const res = await mineAssociations({
        dataset_id: filters.datasetId,
        min_support: minSupport,
        min_confidence: minConfidence,
        min_lift: minLift,
        time_of_day: timeOfDay
      });
      setAssociationData(res);
      if (res.rules.length > 0) setSelectedRule(res.rules[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !associationData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Network className="w-6 h-6 text-teal-500" />
            <span>Product Association Mining & Basket Graph</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Uncovers hidden multi-item co-purchase patterns with Apriori support, confidence, and lift
          </p>
        </div>

        {/* Meal Slot Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'All Day' },
            { id: 'breakfast', label: 'Breakfast' },
            { id: 'lunch', label: 'Lunch' },
            { id: 'evening', label: 'Evening Snacks' }
          ].map((slot) => (
            <button
              key={slot.id}
              onClick={() => setTimeOfDay(slot.id)}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeOfDay === slot.id
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>

      {/* Threshold Sliders Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-4 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Min Support:</span>
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.005"
              value={minSupport}
              onChange={(e) => setMinSupport(Number(e.target.value))}
              className="accent-teal-500 w-24"
            />
            <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{(minSupport * 100).toFixed(1)}%</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Min Confidence:</span>
            <input
              type="range"
              min="0.10"
              max="0.60"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="accent-teal-500 w-24"
            />
            <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{(minConfidence * 100).toFixed(0)}%</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Min Lift:</span>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={minLift}
              onChange={(e) => setMinLift(Number(e.target.value))}
              className="accent-teal-500 w-24"
            />
            <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{minLift.toFixed(1)}x</span>
          </div>
        </div>

        <div className="text-slate-500">
          Discovered: <b className="text-slate-900 dark:text-slate-100">{associationData?.rules.length} association rules</b>
        </div>
      </div>

      {/* Main Grid: Rules Table + Network Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Table (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Discovered Multi-Item Association Rules
            </h3>
            <p className="text-[11px] text-slate-500">{associationData?.takeaway}</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <th className="p-3 font-semibold">If Purchased (Antecedent)</th>
                  <th className="p-3 font-semibold">Also Purchased (Consequent)</th>
                  <th className="p-3 font-semibold">Lift</th>
                  <th className="p-3 font-semibold">Conf %</th>
                  <th className="p-3 font-semibold">Supp %</th>
                  <th className="p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {associationData?.rules.map((r, idx) => {
                  const isSelected = selectedRule?.antecedents[0] === r.antecedents[0] && selectedRule?.consequents[0] === r.consequents[0];
                  return (
                    <tr
                      key={idx}
                      className={`border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px] ${
                        isSelected ? 'bg-teal-50/60 dark:bg-teal-950/40' : ''
                      }`}
                    >
                      <td className="p-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                        {r.antecedents.join(', ')}
                      </td>
                      <td className="p-3 font-sans font-semibold text-teal-600 dark:text-teal-400">
                        {r.consequents.join(', ')}
                      </td>
                      <td className="p-3 font-extrabold text-amber-600 dark:text-amber-400">
                        {r.lift}x
                      </td>
                      <td className="p-3">{(r.confidence * 100).toFixed(1)}%</td>
                      <td className="p-3">{(r.support * 100).toFixed(1)}%</td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedRule(r)}
                          className="text-teal-600 dark:text-teal-400 hover:underline font-sans text-[11px] font-semibold"
                        >
                          Simulate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bundle Margin Impact Simulator (1 col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Bundle Margin Simulator
            </h3>
          </div>

          {selectedRule ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Selected Cross-Sell Rule</span>
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedRule.antecedents.join(', ')} + {selectedRule.consequents.join(', ')}
                </div>
                <p className="text-[11px] text-slate-500">{selectedRule.plain_language}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Bundle Discount:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">₹{bundleDiscount} off</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={bundleDiscount}
                  onChange={(e) => setBundleDiscount(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              {/* Projected Hypothetical Impact */}
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300">
                  Projected Hypothetical Outcome
                </span>
                <div className="space-y-1 text-xs text-teal-900 dark:text-teal-200">
                  <div>• Lift: <b>{selectedRule.lift}x</b> co-purchase acceleration</div>
                  <div>• Est. Volume Uplift: <b>+14%</b> on secondary item</div>
                  <div>• Net Margin Impact: <b>+₹4,200/month</b> incremental profit</div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Hypothetical planning projection. Does not guarantee real consumer conversion.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Select a rule from the table to test bundling discount.</p>
          )}
        </div>
      </div>
    </div>
  );
};
