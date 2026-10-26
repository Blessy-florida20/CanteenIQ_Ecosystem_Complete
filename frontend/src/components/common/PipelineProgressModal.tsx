import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, Play, Sparkles, AlertCircle } from 'lucide-react';
import { cleanDataset, runForecast, mineAssociations, detectAnomalies, generateReport } from '../../services/api';

interface PipelineProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetId: string;
}

interface PipelineStep {
  id: number;
  label: string;
  desc: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
}

export const PipelineProgressModal: React.FC<PipelineProgressModalProps> = ({
  isOpen,
  onClose,
  datasetId
}) => {
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: 1, label: 'Audit & Data Cleaning', desc: 'Isolating corrupted entries to quarantine and scoring quality', status: 'pending' },
    { id: 2, label: 'Walk-Forward Demand Forecasting', desc: 'Running backtesting across Seasonal Naive, ETS, and Random Forest', status: 'pending' },
    { id: 3, label: 'Product Association Mining', desc: 'Extracting multi-item basket itemsets via Apriori algorithm', status: 'pending' },
    { id: 4, label: 'Multi-Method Anomaly Detection', desc: 'Evaluating MAD, IQR, and Isolation Forest against ground truth', status: 'pending' },
    { id: 5, label: 'Deliverable Document Compilation', desc: 'Generating Excel workbook, ReportLab PDF, Word report, and 22-slide PPT', status: 'pending' }
  ]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen) {
      executePipeline();
    }
  }, [isOpen]);

  const updateStep = (id: number, status: PipelineStep['status'], result?: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, result: result || s.result } : s))
    );
  };

  const executePipeline = async () => {
    setIsFinished(false);

    try {
      // Step 1: Clean
      updateStep(1, 'running');
      const cleanRes = await cleanDataset(datasetId);
      updateStep(1, 'completed', `Score: ${cleanRes.quality_report.overall_quality_score}/100, Quarantined: ${cleanRes.quality_report.summary.quarantined_rows} rows`);

      // Step 2: Forecast
      updateStep(2, 'running');
      const fcRes = await runForecast({
        dataset_id: datasetId,
        target: 'net_sales',
        horizon: 14,
        backtest_folds: 2
      });
      updateStep(2, 'completed', `Winner: ${fcRes.winner_model} (MAE: ₹${Math.round(fcRes.leaderboard[0].mae).toLocaleString()})`);

      // Step 3: Associations
      updateStep(3, 'running');
      const assocRes = await mineAssociations({
        dataset_id: datasetId,
        min_support: 0.015,
        min_confidence: 0.20,
        min_lift: 1.1,
        time_of_day: 'all'
      });
      updateStep(3, 'completed', `Mined ${assocRes.rules.length} rules, ${assocRes.network_nodes.length} network nodes`);

      // Step 4: Anomalies
      updateStep(4, 'running');
      const anomRes = await detectAnomalies(datasetId);
      const evalStr = anomRes.evaluation ? ` (F1-score: ${anomRes.evaluation.f1_score})` : '';
      updateStep(4, 'completed', `Detected ${anomRes.anomalies.length} observations${evalStr}`);

      // Step 5: Reports
      updateStep(5, 'running');
      await generateReport('excel', datasetId);
      await generateReport('pdf', datasetId);
      await generateReport('docx', datasetId);
      await generateReport('pptx', datasetId);
      updateStep(5, 'completed', 'Generated Excel, PDF, DOCX, and 22-slide PPTX deliverables');

      setIsFinished(true);
    } catch (err: any) {
      console.error(err);
      setIsFinished(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-teal-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              CanteenIQ Full Pipeline Execution
            </h2>
          </div>
          {isFinished && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Steps List */}
        <div className="space-y-3.5 py-1">
          {steps.map((s) => {
            return (
              <div
                key={s.id}
                className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 transition"
              >
                <div className="mt-0.5">
                  {s.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-teal-500" />}
                  {s.status === 'running' && <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />}
                  {s.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700" />}
                  {s.status === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {s.label}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {s.desc}
                  </p>
                  {s.result && (
                    <div className="mt-1 text-[11px] font-mono text-teal-700 dark:text-teal-300">
                      ✓ {s.result}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            disabled={!isFinished}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              isFinished
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isFinished ? 'Done & View Insights' : 'Executing Pipeline...'}
          </button>
        </div>
      </div>
    </div>
  );
};
