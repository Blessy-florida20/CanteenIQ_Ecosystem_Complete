import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Calculator,
  Download,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { GlobalFilters, NewsvendorPlan } from '../types/api';
import { planPreparation, generateBatchPlan } from '../services/api';

interface PreparationPlannerPageProps {
  filters: GlobalFilters;
}

const MENU_ITEMS = [
  { id: 'PRD_SN_01', name: 'Samosa (2 pcs)', category: 'Snacks', defaultDemand: 160 },
  { id: 'PRD_BF_01', name: 'Masala Dosa', category: 'Breakfast', defaultDemand: 120 },
  { id: 'PRD_ML_01', name: 'South Indian Thali', category: 'Meals', defaultDemand: 140 },
  { id: 'PRD_BV_01', name: 'Masala Chai', category: 'Beverages', defaultDemand: 220 },
  { id: 'PRD_HL_01', name: 'Sprouted Salad', category: 'Healthy', defaultDemand: 80 }
];

export const PreparationPlannerPage: React.FC<PreparationPlannerPageProps> = ({ filters }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('PRD_SN_01');
  const [forecastDemand, setForecastDemand] = useState<number>(160);
  const [usableStock, setUsableStock] = useState<number>(10);
  const [safetyBuffer, setSafetyBuffer] = useState<number>(0.15); // 15%
  const [targetDate, setTargetDate] = useState<string>('2025-06-01');

  const [singlePlan, setSinglePlan] = useState<NewsvendorPlan | null>(null);
  const [batchSheet, setBatchSheet] = useState<any[]>([]);
  const [activeMode, setActiveMode] = useState<'single' | 'batch'>('single');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSinglePlan();
  }, [selectedProductId, forecastDemand, usableStock, safetyBuffer, targetDate]);

  useEffect(() => {
    if (activeMode === 'batch') loadBatchSheet();
  }, [activeMode, targetDate, safetyBuffer]);

  const loadSinglePlan = async () => {
    setIsLoading(true);
    try {
      const res = await planPreparation({
        product_id: selectedProductId,
        target_date: targetDate,
        forecast_demand: forecastDemand,
        usable_stock: usableStock,
        safety_buffer_pct: safetyBuffer
      });
      setSinglePlan(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBatchSheet = async () => {
    setIsLoading(true);
    try {
      const res = await generateBatchPlan(targetDate, 1.0, safetyBuffer);
      setBatchSheet(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (batchSheet.length === 0) return;
    const headers = ['Product ID', 'Product Name', 'Category', 'Recommended Quantity', 'Unit', 'Shortage Risk %', 'Expected Leftover'];
    const rows = batchSheet.map((b) => [
      b.product_id,
      `"${b.product_name}"`,
      b.category,
      b.recommended_quantity,
      b.prep_unit,
      b.shortage_risk_pct,
      b.expected_leftover_units
    ].join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Canteen_Kitchen_Prep_Sheet_${targetDate}.csv`;
    link.click();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <ChefHat className="w-6 h-6 text-teal-500" />
            <span>Smart Preparation Planner (Newsvendor-Enhanced)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Balances overage cost (perishable waste) against underage cost (lost margin) via critical ratio economics
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveMode('single')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeMode === 'single'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Single Item Optimizer
          </button>
          <button
            onClick={() => setActiveMode('batch')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeMode === 'batch'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Full Menu Batch Sheet
          </button>
        </div>
      </div>

      {/* Mode 1: Single Item Optimizer */}
      {activeMode === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel (1 col) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-teal-500" />
              <span>Planning Parameters</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Product:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const chosen = MENU_ITEMS.find((m) => m.id === e.target.value);
                    setSelectedProductId(e.target.value);
                    if (chosen) setForecastDemand(chosen.defaultDemand);
                  }}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {MENU_ITEMS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Prep Date:</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Forecast Demand:</label>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{forecastDemand} units</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="400"
                  step="10"
                  value={forecastDemand}
                  onChange={(e) => setForecastDemand(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Current Usable Stock:</label>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{usableStock} units</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={usableStock}
                  onChange={(e) => setUsableStock(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Safety Buffer %:</label>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{(safetyBuffer * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.4"
                  step="0.05"
                  value={safetyBuffer}
                  onChange={(e) => setSafetyBuffer(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Results Panel (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {singlePlan && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      Recommendation for {singlePlan.product_name}
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                      {singlePlan.recommended_quantity} portions
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-right">
                    <div className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300">Critical Ratio (CR)</div>
                    <div className="text-xl font-extrabold font-mono text-teal-600 dark:text-teal-400">
                      {singlePlan.critical_ratio}
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {singlePlan.plain_explanation}
                </div>

                {/* Risk & Economic Comparison Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Underage (Margin)</div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                      ₹{singlePlan.underage_cost_margin}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Overage (Cost)</div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                      ₹{singlePlan.overage_cost}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Stock-Out Risk %</div>
                    <div className="text-sm font-extrabold text-rose-500 mt-0.5">
                      {singlePlan.shortage_risk_pct}%
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Est. Leftovers</div>
                    <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                      ~{singlePlan.expected_leftover_units} units
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Batch Menu Sheet */}
      {activeMode === 'batch' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Full-Menu Kitchen Preparation Sheet ({targetDate})
              </h3>
              <p className="text-[11px] text-slate-500">
                Optimized daily batch portions for all 21 items across Breakfast, Snacks, Meals, Beverages, Desserts, and Healthy
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Prep Sheet (CSV)</span>
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <th className="p-3 font-semibold">Product</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Recommended Prep</th>
                  <th className="p-3 font-semibold">Unit</th>
                  <th className="p-3 font-semibold">Shortage Risk %</th>
                  <th className="p-3 font-semibold">Est. Leftover</th>
                </tr>
              </thead>
              <tbody>
                {batchSheet.map((item) => (
                  <tr key={item.product_id} className="border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                    <td className="p-3 font-sans font-medium text-slate-900 dark:text-slate-100">{item.product_name}</td>
                    <td className="p-3 font-sans text-slate-500">{item.category}</td>
                    <td className="p-3 font-extrabold text-teal-600 dark:text-teal-400 text-sm">{item.recommended_quantity}</td>
                    <td className="p-3 font-sans">{item.prep_unit}</td>
                    <td className="p-3 text-rose-500 font-semibold">{item.shortage_risk_pct}%</td>
                    <td className="p-3 text-slate-500">{item.expected_leftover_units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
