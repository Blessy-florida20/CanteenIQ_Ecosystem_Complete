import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  PieChart as PieIcon,
  HelpCircle,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { GlobalFilters, ParetoData, HeatmapData, TrendRecord } from '../types/api';
import { fetchPareto, fetchHeatmap, fetchTrends, fetchChangepoints } from '../services/api';

interface EDAPageProps {
  filters: GlobalFilters;
}

export const EDAPage: React.FC<EDAPageProps> = ({ filters }) => {
  const [pareto, setPareto] = useState<ParetoData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [trends, setTrends] = useState<{ records: TrendRecord[]; takeaway: string } | null>(null);
  const [changepoints, setChangepoints] = useState<any>(null);
  const [freq, setFreq] = useState<'D' | 'W' | 'M'>('D');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEDA();
  }, [filters, freq]);

  const loadEDA = async () => {
    setIsLoading(true);
    try {
      const [pRes, hRes, tRes, cRes] = await Promise.all([
        fetchPareto(filters),
        fetchHeatmap(filters),
        fetchTrends(filters, freq),
        fetchChangepoints(filters.datasetId)
      ]);
      setPareto(pRes);
      setHeatmap(hRes);
      setTrends(tRes);
      setChangepoints(cRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !pareto) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Exploratory Data Analysis (EDA)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Deep diagnostic insights: Pareto concentration, Lorenz curve, footfall heatmaps, and change points
        </p>
      </div>

      {/* Section 1: Multi-Frequency Trend Analysis */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Aggregated Sales & Volume Dynamics
            </h3>
            <p className="text-[11px] text-slate-500">{trends?.takeaway}</p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(['D', 'W', 'M'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                className={`px-3 py-1 rounded-lg transition ${
                  freq === f
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {f === 'D' ? 'Daily' : f === 'W' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends?.records}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Net Sales']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
              />
              <Bar dataKey="net_sales" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 2: Pareto ABC Analysis & Lorenz Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lorenz Curve Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Lorenz Curve & Gini Coefficient
              </h3>
              <p className="text-[11px] text-slate-500">
                Gini: <b className="text-teal-600 dark:text-teal-400 font-mono">{pareto.gini_coefficient}</b> | {pareto.takeaway}
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pareto.lorenz_curve}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="item_pct" tick={{ fontSize: 10 }} label={{ value: '% of Menu Items', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                <YAxis dataKey="revenue_pct" tick={{ fontSize: 10 }} label={{ value: '% Cumulative Sales', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip
                  formatter={(v: any) => [`${v}%`, 'Cumulative Share']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="revenue_pct" stroke="#0d9488" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
              <div className="font-extrabold text-teal-700 dark:text-teal-300">Class A (Top 70%)</div>
              <div className="text-xs text-slate-500">{pareto.class_summary.A_items} items</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <div className="font-extrabold text-amber-700 dark:text-amber-300">Class B (Next 20%)</div>
              <div className="text-xs text-slate-500">{pareto.class_summary.B_items} items</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="font-extrabold text-slate-700 dark:text-slate-300">Class C (Last 10%)</div>
              <div className="text-xs text-slate-500">{pareto.class_summary.C_items} items</div>
            </div>
          </div>
        </div>

        {/* Pareto ABC Items Table */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            ABC Revenue Classification Table
          </h3>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-72">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <th className="p-2.5 font-semibold">Class</th>
                  <th className="p-2.5 font-semibold">Product</th>
                  <th className="p-2.5 font-semibold">Revenue</th>
                  <th className="p-2.5 font-semibold">Share %</th>
                </tr>
              </thead>
              <tbody>
                {pareto.items.slice(0, 10).map((item) => (
                  <tr key={item.product_id} className="border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        item.abc_class === 'A'
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300'
                          : item.abc_class === 'B'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {item.abc_class}
                      </span>
                    </td>
                    <td className="p-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">{item.product_name}</td>
                    <td className="p-2.5">₹{item.revenue.toLocaleString()}</td>
                    <td className="p-2.5">{(item.revenue_share * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 3: Hour x Weekday Heatmap */}
      {heatmap && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-teal-500" />
                <span>Hour × Weekday Footfall Heatmap</span>
              </h3>
              <p className="text-[11px] text-slate-500">{heatmap.takeaway}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px] space-y-1.5">
              <div className="flex items-center text-[10px] text-slate-400 font-mono pl-24 space-x-1">
                {heatmap.hours.map((h) => (
                  <div key={h} className="w-10 text-center">
                    {h}:00
                  </div>
                ))}
              </div>

              {heatmap.matrix.map((row) => (
                <div key={row.day} className="flex items-center space-x-1">
                  <div className="w-24 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {row.day}
                  </div>
                  {row.hours.map((cnt, idx) => {
                    // Color intensity based on order volume
                    const intensity = cnt > 120 ? 'bg-teal-600 text-white' : cnt > 70 ? 'bg-teal-400 text-slate-900' : cnt > 20 ? 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400';
                    return (
                      <div
                        key={idx}
                        className={`w-10 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold ${intensity}`}
                        title={`${row.day} ${heatmap.hours[idx]}:00 - ${cnt} orders`}
                      >
                        {cnt}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Structural Change-Points */}
      {changepoints && changepoints.change_points?.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Structural Shifts & Change-Points Detected
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">{changepoints.takeaway}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {changepoints.change_points.slice(0, 4).map((cp: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-400">{cp.date}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    cp.type === 'Surge'
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                  }`}>
                    {cp.type}
                  </span>
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  ₹{cp.observed_sales.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">
                  Dev: {cp.deviation > 0 ? '+' : ''}₹{cp.deviation.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
