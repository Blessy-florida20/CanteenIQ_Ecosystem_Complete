import React, { useState, useEffect } from 'react';
import {
  Grid,
  Star,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { GlobalFilters } from '../types/api';
import { fetchMenuEngineering } from '../services/api';

interface MenuEngineeringPageProps {
  filters: GlobalFilters;
}

export const MenuEngineeringPage: React.FC<MenuEngineeringPageProps> = ({ filters }) => {
  const [matrixData, setMatrixData] = useState<any>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMatrix();
  }, [filters.datasetId]);

  const loadMatrix = async () => {
    setIsLoading(true);
    try {
      const res = await fetchMenuEngineering(filters.datasetId);
      setMatrixData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !matrixData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredItems = matrixData.items.filter(
    (item: any) => selectedQuadrant === 'all' || item.quadrant.toLowerCase() === selectedQuadrant.toLowerCase()
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Grid className="w-6 h-6 text-teal-500" />
            <span>Menu Engineering Matrix (BCG-Style)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Classifies canteen offerings into Stars, Plowhorses, Puzzles, and Dogs based on Popularity vs Contribution Margin
          </p>
        </div>

        {/* Quadrant Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {['all', 'Stars', 'Plowhorses', 'Puzzles', 'Dogs'].map((q) => (
            <button
              key={q}
              onClick={() => setSelectedQuadrant(q)}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedQuadrant === q
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {q === 'all' ? 'All Quadrants' : q}
            </button>
          ))}
        </div>
      </div>

      {/* Quadrants Explanatory Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-teal-800 dark:text-teal-200">
            <Star className="w-4 h-4 fill-current text-teal-600 dark:text-teal-400" />
            <span>Stars (High Vol, High Margin)</span>
          </div>
          <p className="text-[11px] text-teal-700 dark:text-teal-300">
            Maintain recipe standards; place prominently on menu boards.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1 text-xs">
          <div className="font-bold text-amber-800 dark:text-amber-200">
            Plowhorses (High Vol, Low Margin)
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300">
            Modestly adjust price/portion, or bundle with high-margin drinks.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1 text-xs">
          <div className="font-bold text-indigo-800 dark:text-indigo-200">
            Puzzles (Low Vol, High Margin)
          </div>
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
            Promote via daily specials or feature in meal combos to lift trial.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1 text-xs">
          <div className="font-bold text-rose-800 dark:text-rose-200">
            Dogs (Low Vol, Low Margin)
          </div>
          <p className="text-[11px] text-rose-700 dark:text-rose-300">
            Re-engineer recipe, replace with alternative, or phase out.
          </p>
        </div>
      </div>

      {/* Matrix Scatter Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Product Portfolio Quadrant Scatter Plot
          </h3>
          <p className="text-[11px] text-slate-500">
            X-Axis: Popularity Share % (Hurdle: {matrixData.benchmarks.popularity_hurdle_pct}%) | Y-Axis: Contribution Margin (Hurdle: ₹{matrixData.benchmarks.margin_hurdle_inr})
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="units_share_pct" name="Volume Share" unit="%" tick={{ fontSize: 10 }} />
              <YAxis dataKey="unit_margin" name="Unit Margin" unit="₹" tick={{ fontSize: 10 }} />
              <ZAxis dataKey="units_sold" range={[60, 400]} name="Portions Sold" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(val: any, name: any) => [name === 'Volume Share' ? `${val}%` : `₹${val}`, name]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
              />
              <Scatter data={filteredItems} fill="#0d9488">
                {filteredItems.map((entry: any, index: number) => {
                  const color =
                    entry.quadrant === 'Stars'
                      ? '#0d9488'
                      : entry.quadrant === 'Plowhorses'
                      ? '#d97706'
                      : entry.quadrant === 'Puzzles'
                      ? '#6366f1'
                      : '#f43f5e';
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Items Guidance Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Menu Engineering Classifications & Action Guidance
        </h3>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <th className="p-3 font-semibold">Product</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Quadrant</th>
                <th className="p-3 font-semibold">Unit Margin</th>
                <th className="p-3 font-semibold">Volume Share %</th>
                <th className="p-3 font-semibold">Prescriptive Guidance</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item: any) => (
                <tr key={item.product_id} className="border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                  <td className="p-3 font-sans font-semibold text-slate-900 dark:text-slate-100">{item.product_name}</td>
                  <td className="p-3 font-sans text-slate-500">{item.category}</td>
                  <td className="p-3 font-sans">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      item.quadrant === 'Stars'
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300'
                        : item.quadrant === 'Plowhorses'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        : item.quadrant === 'Puzzles'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                    }`}>
                      {item.quadrant}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">₹{item.unit_margin}</td>
                  <td className="p-3">{item.units_share_pct}%</td>
                  <td className="p-3 font-sans text-slate-600 dark:text-slate-300 max-w-sm">{item.action_guidance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
