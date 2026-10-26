import React, { useState, useEffect } from 'react';
import {
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  HelpCircle,
  AlertCircle,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { GlobalFilters, WhatIfScenarioResult } from '../types/api';
import { runWhatIfScenario } from '../services/api';

interface WhatIfSimulatorPageProps {
  filters: GlobalFilters;
}

export const WhatIfSimulatorPage: React.FC<WhatIfSimulatorPageProps> = ({ filters }) => {
  const [priceChange, setPriceChange] = useState<number>(0.0);
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.0);
  const [discountRate, setDiscountRate] = useState<number>(0.0);
  const [costChange, setCostChange] = useState<number>(0.0);

  const [simResult, setSimResult] = useState<WhatIfScenarioResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSimulation();
  }, [filters.datasetId, priceChange, demandMultiplier, discountRate, costChange]);

  const loadSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await runWhatIfScenario({
        price_change_pct: priceChange,
        demand_multiplier: demandMultiplier,
        discount_rate_pct: discountRate,
        cost_change_pct: costChange
      }, filters.datasetId);
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPriceChange(0.0);
    setDemandMultiplier(1.0);
    setDiscountRate(0.0);
    setCostChange(0.0);
  };

  if (isLoading && !simResult) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Comparison bar chart data
  const comparisonData = simResult ? [
    { metric: 'Net Revenue', Baseline: simResult.baseline.net_sales, Scenario: simResult.scenario.net_sales },
    { metric: 'COGS Expense', Baseline: simResult.baseline.cogs, Scenario: simResult.scenario.cogs },
    { metric: 'Gross Profit', Baseline: simResult.baseline.profit, Scenario: simResult.scenario.profit }
  ] : [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Sliders className="w-6 h-6 text-teal-500" />
            <span>What-If Business Simulator & Elasticity Lab</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive scenario modeling with empirical price elasticity, sensitivity tornado, and break-even analytics
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Assumptions</span>
        </button>
      </div>

      {/* Main Grid: Control Sliders (1 col) + Output & Elasticity (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Panel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Scenario Drivers & Levers
          </h3>

          <div className="space-y-4 text-xs">
            {/* Price Change */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Price Adjustment (%):</span>
                <span className={`font-mono font-bold ${priceChange >= 0 ? 'text-teal-600' : 'text-rose-500'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange}%
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="25"
                step="1"
                value={priceChange}
                onChange={(e) => setPriceChange(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            {/* Demand Multiplier */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Footfall Demand Multiplier:</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{demandMultiplier}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.05"
                value={demandMultiplier}
                onChange={(e) => setDemandMultiplier(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            {/* Discount Rate */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Promotional Discount Rate (%):</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{discountRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={discountRate}
                onChange={(e) => setDiscountRate(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            {/* Cost Inflation */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Food Cost Inflation (%):</span>
                <span className={`font-mono font-bold ${costChange > 0 ? 'text-rose-500' : 'text-teal-600'}`}>
                  {costChange >= 0 ? '+' : ''}{costChange}%
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="25"
                step="1"
                value={costChange}
                onChange={(e) => setCostChange(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
          </div>

          {/* Break-Even Callout */}
          {simResult && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Break-Even Volume</span>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {simResult.break_even_units.toLocaleString()} portions
              </div>
              <p className="text-[10px] text-slate-500">Fixed kitchen overhead coverage threshold</p>
            </div>
          )}
        </div>

        {/* Results Overview (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {simResult && (
            <>
              {/* Financial Outcome Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Projected Net Sales</span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    ₹{simResult.scenario.net_sales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                  <div className={`text-xs font-semibold ${simResult.delta.net_sales >= 0 ? 'text-teal-600' : 'text-rose-500'}`}>
                    {simResult.delta.net_sales >= 0 ? '+' : ''}₹{simResult.delta.net_sales.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({simResult.delta.net_sales_pct}%)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Projected Gross Profit</span>
                  <div className="text-xl font-extrabold text-teal-600 dark:text-teal-400">
                    ₹{simResult.scenario.profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                  <div className={`text-xs font-semibold ${simResult.delta.profit >= 0 ? 'text-teal-600' : 'text-rose-500'}`}>
                    {simResult.delta.profit >= 0 ? '+' : ''}₹{simResult.delta.profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({simResult.delta.profit_pct}%)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Scenario Margin %</span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {simResult.scenario.gross_margin_pct}%
                  </div>
                  <div className="text-xs text-slate-500">
                    Baseline was {simResult.baseline.gross_margin_pct}%
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison Chart */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Baseline vs Scenario Financial Visualizer
                </h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip
                        formatter={(val: any) => [`₹${Number(val).toLocaleString()}`]}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                      />
                      <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Scenario" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section 2: Empirical Price Elasticity & Monte Carlo Bands */}
      {simResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Elasticity Regression Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Percent className="w-4 h-4 text-teal-500" />
              <span>Empirical Price Elasticity of Demand (ln Q = a + b * ln P)</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Elasticity Coefficient (epsilon):</span>
                <span className="font-extrabold font-mono text-base text-teal-600 dark:text-teal-400">
                  {simResult.elasticity_estimate.elasticity}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Statistical Significance: p = {simResult.elasticity_estimate.p_value} | R2 = {simResult.elasticity_estimate.r_squared}</span>
                <span>95% CI: [{simResult.elasticity_estimate.confidence_interval_95.join(', ')}]</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                {simResult.elasticity_estimate.interpretation}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 italic">{simResult.elasticity_estimate.caveats}</p>
          </div>

          {/* Monte Carlo Uncertainty Bands */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Monte Carlo Profit Simulation (1,000 Stochastic Iterations)
            </h3>
            <p className="text-[11px] text-slate-500">
              Accounts for demand variance and ingredient cost fluctuation distributions
            </p>

            <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-[10px] text-slate-400 uppercase font-bold">P10 (Conservative)</div>
                <div className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300 mt-1">
                  ₹{simResult.monte_carlo_bands.p10_conservative.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                <div className="text-[10px] text-teal-700 dark:text-teal-300 uppercase font-bold">P50 (Expected)</div>
                <div className="text-sm font-extrabold font-mono text-teal-600 dark:text-teal-400 mt-1">
                  ₹{simResult.monte_carlo_bands.p50_expected.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-[10px] text-slate-400 uppercase font-bold">P90 (Optimistic)</div>
                <div className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300 mt-1">
                  ₹{simResult.monte_carlo_bands.p90_optimistic.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
