import React, { useState, useEffect } from 'react';
import {
  Leaf,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ClipboardList,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { simulateWasteLab } from '../services/api';

export const WasteScenarioLabPage: React.FC = () => {
  const [wasteData, setWasteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWasteSim();
  }, []);

  const loadWasteSim = async () => {
    setIsLoading(true);
    try {
      const res = await simulateWasteLab();
      setWasteData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !wasteData) {
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
          <Leaf className="w-6 h-6 text-teal-500" />
          <span>Sustainability & Waste Scenario Lab (Simulation Only)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Evaluates hypothetical food waste reduction comparing naive preparation policies against forecast-guided planning
        </p>
      </div>

      {/* Mandatory Simulation Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold">Honesty & Scientific Integrity Disclosure</h4>
          <p className="leading-relaxed text-amber-800 dark:text-amber-300 text-[11px]">
            {wasteData.simulation_banner} In point-of-sale datasets, sales records alone never imply waste or inventory levels. 
            These figures represent a theoretical scenario model. No canteen can claim actual food waste reduction without field-measured kitchen discard logs.
          </p>
        </div>
      </div>

      {/* Comparison Cards: Naive vs Forecast Guided */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Naive Policy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400">Baseline Naive Policy</span>
          <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-300">
            {wasteData.naive_policy.waste_units.toLocaleString()} portions
          </div>
          <div className="text-xs text-rose-500 font-semibold">
            ₹{wasteData.naive_policy.waste_cost_inr.toLocaleString()} estimated overage cost
          </div>
          <p className="text-[11px] text-slate-500">Heuristic fixed preparation buffer without dynamic demand forecasts.</p>
        </div>

        {/* Forecast-Guided Policy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-teal-500/40 shadow-sm space-y-3 bg-teal-50/10 dark:bg-teal-950/10">
          <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">Forecast-Guided Policy</span>
          <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
            {wasteData.forecast_policy.waste_units.toLocaleString()} portions
          </div>
          <div className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
            ₹{wasteData.forecast_policy.waste_cost_inr.toLocaleString()} residual overage cost
          </div>
          <p className="text-[11px] text-slate-500">Newsvendor batch quantities aligned with 7-day walk-forward predictions.</p>
        </div>

        {/* Hypothetical Savings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400">Hypothetical Savings</span>
          <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
            ₹{wasteData.hypothetical_savings.cost_saved_inr.toLocaleString()} saved
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            ~{wasteData.hypothetical_savings.units_prevented.toLocaleString()} portions preserved
          </div>
          <p className="text-[11px] text-slate-500">
            Equivalent to ~<b>{wasteData.hypothetical_savings.equivalent_meals_preserved.toLocaleString()} campus meals</b>.
          </p>
        </div>
      </div>

      {/* Checklist for Real-World Measurement */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <ClipboardList className="w-4 h-4 text-teal-500" />
          <span>Real-World Field Validation Checklist (Required for Empirical Claims)</span>
        </h3>
        <p className="text-[11px] text-slate-500">
          To certify real-world ESG waste reduction in an actual institutional canteen, the following data collection protocols must be deployed:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {wasteData.real_world_measurement_checklist.map((c: any, idx: number) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start space-x-2.5 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-500 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{c.item}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">{c.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
