import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  ShieldAlert,
  Play,
  FileCode,
  Layers,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { GlobalFilters, ForecastResponse } from '../types/api';
import { runForecast } from '../services/api';

interface ForecastingStudioPageProps {
  filters: GlobalFilters;
}

export const ForecastingStudioPage: React.FC<ForecastingStudioPageProps> = ({ filters }) => {
  const [target, setTarget] = useState<'net_sales' | 'units_sold'>('net_sales');
  const [horizon, setHorizon] = useState<number>(14);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [selectedModelCard, setSelectedModelCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, [filters.datasetId, target, horizon]);

  const loadForecast = async () => {
    setIsLoading(true);
    try {
      const res = await runForecast({
        dataset_id: filters.datasetId,
        target,
        horizon,
        backtest_folds: 3
      });
      setForecastData(res);
      const winner = res.leaderboard.find((m) => m.is_winner);
      if (winner) setSelectedModelCard(winner.model_card);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !forecastData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Running walk-forward backtests & evaluating models...</p>
        </div>
      </div>
    );
  }

  // Combine historical and future forecast points for seamless Recharts line
  const chartData = [
    ...(forecastData?.historical || []).map((h) => ({
      date: h.date,
      actual: h.actual,
      forecast: null,
      lower: null,
      upper: null
    })),
    ...(forecastData?.predictions || []).map((p) => ({
      date: p.date,
      actual: null,
      forecast: p.forecast,
      lower: p.lower_bound,
      upper: p.upper_bound
    }))
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-teal-500" />
            <span>Demand Forecasting Studio</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rolling-origin walk-forward backtesting with baseline comparisons and leak-free ML
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Target Toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl font-semibold">
            <button
              onClick={() => setTarget('net_sales')}
              className={`px-3 py-1.5 rounded-lg transition ${
                target === 'net_sales'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Net Sales (₹)
            </button>
            <button
              onClick={() => setTarget('units_sold')}
              className={`px-3 py-1.5 rounded-lg transition ${
                target === 'units_sold'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Portions (Units)
            </button>
          </div>

          {/* Horizon Selector */}
          <select
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value={7}>7-Day Horizon</option>
            <option value={14}>14-Day Horizon</option>
            <option value={21}>21-Day Horizon</option>
          </select>
        </div>
      </div>

      {/* Uncertainty Notice */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 shrink-0 text-teal-500 mt-0.5" />
        <div>
          <b>Chronological No-Leakage Guarantee:</b> Lag and rolling features are strictly derived from past periods (shift $\ge 1$). 
          Uncertainty intervals represent empirical 90% conformal residual quantiles.
        </div>
      </div>

      {/* Main Forecast Chart with Confidence Bands */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Demand Forecast Trajectory with 90% Empirical Confidence Interval
            </h3>
            <p className="text-[11px] text-slate-500">
              Winner Model: <b className="text-teal-600 dark:text-teal-400">{forecastData?.winner_model}</b> | Coverage Rate: {forecastData?.coverage_rate_pct}%
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
              />
              {/* Upper & Lower Confidence Interval */}
              <Area type="monotone" dataKey="upper" stroke="none" fill="#0d9488" fillOpacity={0.15} />
              <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={0.0} />

              {/* Historical Line */}
              <Line type="monotone" dataKey="actual" stroke="#64748b" strokeWidth={2} dot={{ r: 2 }} name="Historical Actual" />
              {/* Forecast Line */}
              <Line type="monotone" dataKey="forecast" stroke="#0d9488" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 3 }} name="Out-of-Sample Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 2: Model Leaderboard & Model Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Leaderboard (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Walk-Forward Backtesting Leaderboard
            </h3>
            <span className="text-xs text-slate-400">3-Fold Rolling Origins</span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <th className="p-3 font-semibold">Model</th>
                  <th className="p-3 font-semibold">MAE (₹)</th>
                  <th className="p-3 font-semibold">RMSE (₹)</th>
                  <th className="p-3 font-semibold">sMAPE %</th>
                  <th className="p-3 font-semibold">vs Baseline</th>
                  <th className="p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {forecastData?.leaderboard.map((m) => (
                  <tr
                    key={m.model_name}
                    className={`border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px] ${
                      m.is_winner ? 'bg-teal-50/60 dark:bg-teal-950/30' : ''
                    }`}
                  >
                    <td className="p-3 font-sans font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                      {m.is_winner && <Award className="w-4 h-4 text-amber-500 shrink-0" />}
                      <span>{m.model_name}</span>
                    </td>
                    <td className="p-3">₹{m.mae.toLocaleString()}</td>
                    <td className="p-3">₹{m.rmse.toLocaleString()}</td>
                    <td className="p-3">{m.smape_pct}%</td>
                    <td className="p-3">
                      <span className={`font-semibold ${m.improvement_vs_baseline_pct >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-500'}`}>
                        {m.improvement_vs_baseline_pct >= 0 ? '+' : ''}{m.improvement_vs_baseline_pct}%
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedModelCard(m.model_card)}
                        className="text-teal-600 dark:text-teal-400 hover:underline font-sans text-[11px] font-semibold"
                      >
                        Inspect Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Model Card (1 col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-teal-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Active Model Card
            </h3>
          </div>

          {selectedModelCard ? (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Model Name</span>
                <div className="font-bold text-slate-900 dark:text-slate-100">{selectedModelCard.model_name}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Leakage Policy</span>
                <div className="text-[11px] text-slate-700 dark:text-slate-300">{selectedModelCard.data_split_policy}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Hyperparameters</span>
                <div className="text-[11px] font-mono text-teal-700 dark:text-teal-300">{selectedModelCard.hyperparameters}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Limitations</span>
                <div className="text-[11px] text-slate-500 italic">{selectedModelCard.limitations}</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Select a model from leaderboard to view its card.</p>
          )}
        </div>
      </div>
    </div>
  );
};
