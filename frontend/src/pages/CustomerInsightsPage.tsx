import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Calendar,
  Layers,
  Award,
  Heart,
  HelpCircle
} from 'lucide-react';
import { GlobalFilters } from '../types/api';
import { fetchCustomerSegments, fetchRetentionCohorts } from '../services/api';

interface CustomerInsightsPageProps {
  filters: GlobalFilters;
}

export const CustomerInsightsPage: React.FC<CustomerInsightsPageProps> = ({ filters }) => {
  const [segmentsData, setSegmentsData] = useState<any>(null);
  const [cohortsData, setCohortsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
  }, [filters.datasetId]);

  const loadCustomerData = async () => {
    setIsLoading(true);
    try {
      const [segRes, cohRes] = await Promise.all([
        fetchCustomerSegments(filters.datasetId),
        fetchRetentionCohorts(filters.datasetId)
      ]);
      setSegmentsData(segRes);
      setCohortsData(cohRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !segmentsData) {
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
          <Users className="w-6 h-6 text-teal-500" />
          <span>Pseudonymous Customer Insights & Cohorts</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          RFM behavioral segmentation (K-Means) and monthly retention cohorts
        </p>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-300">
        <ShieldCheck className="w-4 h-4 shrink-0 text-teal-500 mt-0.5" />
        <div>
          <b>Privacy-Preserving Anonymization:</b> {segmentsData.privacy_note}
        </div>
      </div>

      {/* RFM K-Means Segment Profiles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            K-Means Behavioral Segments ({segmentsData.total_customers} Unique Regular Students & Staff)
          </h3>
          <span className="text-xs text-slate-400">{segmentsData.takeaway}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {segmentsData.profiles.map((p: any) => (
            <div
              key={p.cluster_id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {p.assigned_label || p.name}
                </span>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {p.customer_count} diners
                </span>
              </div>

              <div className="space-y-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Recency:</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {p.avg_recency_days} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Orders (Freq):</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {p.avg_frequency_orders} orders
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Total Spend:</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                    ₹{p.avg_monetary_inr.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retention Cohort Heatmap Table */}
      {cohortsData && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-teal-500" />
              <span>Monthly Retention Cohort Heatmap</span>
            </h3>
            <p className="text-[11px] text-slate-500">{cohortsData.takeaway}</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <th className="p-3 font-semibold">Cohort Month</th>
                  <th className="p-3 font-semibold">Size</th>
                  <th className="p-3 font-semibold">Month 0</th>
                  <th className="p-3 font-semibold">Month 1</th>
                  <th className="p-3 font-semibold">Month 2</th>
                  <th className="p-3 font-semibold">Month 3</th>
                  <th className="p-3 font-semibold">Month 4</th>
                  <th className="p-3 font-semibold">Month 5</th>
                </tr>
              </thead>
              <tbody>
                {cohortsData.cohorts.map((c: any) => (
                  <tr key={c.cohort} className="border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                    <td className="p-3 font-sans font-semibold text-slate-900 dark:text-slate-100">{c.cohort}</td>
                    <td className="p-3 font-bold text-slate-500">{c.initial_size}</td>
                    {c.retention_percentages.map((pct: any, idx: number) => {
                      const bg =
                        pct === null
                          ? 'text-slate-300'
                          : pct >= 70
                          ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold'
                          : pct >= 40
                          ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                          : 'text-slate-500';
                      return (
                        <td key={idx} className={`p-3 ${bg}`}>
                          {pct !== null ? `${pct}%` : '-'}
                        </td>
                      );
                    })}
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
