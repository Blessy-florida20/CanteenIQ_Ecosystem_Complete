import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Award,
  AlertCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { KPISummary, TrendRecord, CategoryRecord, GlobalFilters } from '../types/api';
import { fetchKPISummary, fetchTrends, fetchCategories } from '../services/api';
import { EvidenceInfo } from '../components/common/EvidenceDrawer';

interface ExecutiveDashboardProps {
  filters: GlobalFilters;
  onOpenEvidence: (info: EvidenceInfo) => void;
  onNavigate: (page: any) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  filters,
  onOpenEvidence,
  onNavigate
}) => {
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [trends, setTrends] = useState<TrendRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [kpiRes, trendRes, catRes] = await Promise.all([
        fetchKPISummary(filters),
        fetchTrends(filters, 'D'),
        fetchCategories(filters)
      ]);
      setKpis(kpiRes);
      setTrends(trendRes.records.slice(-30)); // last 30 daily points
      setCategories(catRes.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !kpis) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Computing real-time executive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Synthetic Data Disclaimer Banner */}
      <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <b>Simulated Institutional Data:</b> Analytics evaluated on benchmark campus transactions. Not actual field canteen operations.
          </span>
        </div>
        <button
          onClick={() => onNavigate('methodology')}
          className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-200"
        >
          View Methodology
        </button>
      </div>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Executive Performance Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Unified view of revenue, margins, volume stability, and operational health
          </p>
        </div>

        {/* Canteen Health Score Pill */}
        <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Canteen Health Score
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {kpis.health_score.overall_score}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
              <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 ml-1">
                {kpis.health_score.grade}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Sales */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Net Revenue</span>
            <button
              onClick={() =>
                onOpenEvidence({
                  title: 'Net Sales KPI',
                  formula: 'Net Sales = sum(quantity * unit_price - discount)',
                  rowCount: kpis.unique_transactions
                })
              }
              className="text-slate-400 hover:text-teal-600"
              title="Show Evidence"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            ₹{kpis.net_sales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <span>Gross: ₹{kpis.gross_sales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Estimated Profit & Margin */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Gross Profit & Margin</span>
            <button
              onClick={() =>
                onOpenEvidence({
                  title: 'Gross Margin %',
                  formula: 'Gross Margin % = (net_sales - cogs) / net_sales * 100',
                  rowCount: kpis.unique_transactions
                })
              }
              className="text-slate-400 hover:text-teal-600"
              title="Show Evidence"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
            ₹{kpis.estimated_gross_profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            Margin: {kpis.gross_margin_pct.toFixed(1)}% (COGS: ₹{kpis.cogs.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
          </div>
        </div>

        {/* Unique Orders & ATV */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Orders & Avg Value (ATV)</span>
            <button
              onClick={() =>
                onOpenEvidence({
                  title: 'Average Transaction Value (ATV)',
                  formula: 'ATV = net_sales / count(distinct order_id)',
                  rowCount: kpis.unique_orders
                })
              }
              className="text-slate-400 hover:text-teal-600"
              title="Show Evidence"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {kpis.unique_orders.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            ATV: <b className="text-slate-800 dark:text-slate-200">₹{kpis.average_transaction_value.toFixed(1)}</b> / order
          </div>
        </div>

        {/* Portions Sold */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Portions Sold</span>
            <button
              onClick={() =>
                onOpenEvidence({
                  title: 'Units Sold Volume',
                  formula: 'Units = sum(quantity)',
                  rowCount: kpis.units_sold
                })
              }
              className="text-slate-400 hover:text-teal-600"
              title="Show Evidence"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {kpis.units_sold.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            Across <b>{kpis.active_products} active items</b> on menu
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Daily Net Sales Velocity (Last 30 Days)
              </h3>
              <p className="text-[11px] text-slate-500">
                Displays weekday surge peaks and institutional weekend drop cycles
              </p>
            </div>
            <button
              onClick={() => onNavigate('eda')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
            >
              <span>Explore EDA</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Net Sales']}
                  labelFormatter={(l) => `Date: ${l}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="net_sales" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Bar Chart (1 col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Category Contribution
              </h3>
              <p className="text-[11px] text-slate-500">
                Revenue share across menu food groups
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis dataKey="category" type="category" width={80} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Net Sales']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Bar dataKey="net_sales" fill="#0d9488" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Health Score Breakdown Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Canteen Operational Health Score Breakdown
            </h3>
          </div>
          <span className="text-xs text-slate-500">{kpis.health_score.explanation}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <div className="text-[11px] text-slate-500 font-medium">Margin Health (30%)</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              {kpis.health_score.components.margin_health_score} / 100
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full" style={{ width: `${kpis.health_score.components.margin_health_score}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <div className="text-[11px] text-slate-500 font-medium">Data Quality (25%)</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              {kpis.health_score.components.data_quality_score} / 100
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full" style={{ width: `${kpis.health_score.components.data_quality_score}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <div className="text-[11px] text-slate-500 font-medium">Demand Stability (25%)</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              {kpis.health_score.components.demand_stability_score} / 100
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full" style={{ width: `${kpis.health_score.components.demand_stability_score}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <div className="text-[11px] text-slate-500 font-medium">Operational ATV (20%)</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              {kpis.health_score.components.operational_score} / 100
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full" style={{ width: `${kpis.health_score.components.operational_score}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
