import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Info,
  Filter,
  Eye,
  Check
} from 'lucide-react';
import { GlobalFilters, AnomalyItem } from '../types/api';
import { detectAnomalies, updateAnomalyStatus } from '../services/api';

interface AnomalyDetectionPageProps {
  filters: GlobalFilters;
}

export const AnomalyDetectionPage: React.FC<AnomalyDetectionPageProps> = ({ filters }) => {
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [takeaway, setTakeaway] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnomalies();
  }, [filters.datasetId]);

  const loadAnomalies = async () => {
    setIsLoading(true);
    try {
      const res = await detectAnomalies(filters.datasetId);
      setAnomalies(res.anomalies);
      setEvaluation(res.evaluation);
      setTakeaway(res.takeaway);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (anomalyId: string, newStatus: string) => {
    try {
      await updateAnomalyStatus(anomalyId, newStatus, `Reviewed via UI on ${new Date().toISOString()}`);
      setAnomalies((prev) =>
        prev.map((a) => (a.anomaly_id === anomalyId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredAnomalies = anomalies.filter(
    (a) => filterSeverity === 'all' || a.severity.toLowerCase() === filterSeverity.toLowerCase()
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <span>Operational Anomaly Detection Lab</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-method detector (Robust MAD, IQR, Isolation Forest) benchmarked on ground-truth events
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {['all', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterSeverity === sev
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {sev === 'all' ? 'All Severities' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Ethics & Framing Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
        <div>
          <b>Ethical Operational Framing:</b> Detected observations represent statistical deviations from baseline demand (surges, unannounced power cuts, or weather closures). 
          They are operational indicators requiring review, not accusations of fraud.
        </div>
      </div>

      {/* Ground Truth Evaluation Benchmark Card */}
      {evaluation && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-teal-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Ground-Truth Objective Detection Benchmark
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Injected Events: {evaluation.ground_truth_events_total}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Precision</div>
              <div className="text-base font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                {(evaluation.precision * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Recall</div>
              <div className="text-base font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                {(evaluation.recall * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold">F1-Score</div>
              <div className="text-base font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                {evaluation.f1_score}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold">True Positives</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                {evaluation.true_positives} / {evaluation.ground_truth_events_total}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anomalies List Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Detected Unusual Observations ({filteredAnomalies.length} items)
          </h3>
          <span className="text-xs text-slate-400">{takeaway}</span>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Direction</th>
                <th className="p-3 font-semibold">Severity</th>
                <th className="p-3 font-semibold">Observed vs Baseline</th>
                <th className="p-3 font-semibold">Deviation</th>
                <th className="p-3 font-semibold">Review Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnomalies.map((a) => (
                <tr key={a.anomaly_id} className="border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                  <td className="p-3 font-sans font-medium text-slate-900 dark:text-slate-100">{a.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      a.direction === 'Surge'
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                    }`}>
                      {a.direction}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`font-semibold ${
                      a.severity === 'High' ? 'text-rose-600' : a.severity === 'Medium' ? 'text-amber-500' : 'text-slate-500'
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="p-3">
                    ₹{a.observed_value.toLocaleString()} (exp: ₹{a.expected_value.toLocaleString()})
                  </td>
                  <td className="p-3">
                    {a.deviation_pct > 0 ? '+' : ''}{a.deviation_pct}%
                  </td>
                  <td className="p-3 font-sans">
                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.anomaly_id, e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="New">New</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Explained">Explained</option>
                      <option value="Dismissed">Dismissed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
