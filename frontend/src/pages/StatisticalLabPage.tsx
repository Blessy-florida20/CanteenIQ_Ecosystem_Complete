import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calculator,
  Compass,
  Scale
} from 'lucide-react';
import { GlobalFilters, StatisticalTestResult } from '../types/api';
import { runStatistics } from '../services/api';

interface StatisticalLabPageProps {
  filters: GlobalFilters;
}

export const StatisticalLabPage: React.FC<StatisticalLabPageProps> = ({ filters }) => {
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [filters]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const res = await runStatistics(filters);
      setStatsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !statsData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { descriptive, weekday_vs_weekend_test, category_payment_test, stationarity_adf_test } = statsData;

  const renderTestCard = (test: StatisticalTestResult) => {
    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              {test.test_name}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {test.question}
            </h3>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
              test.reject_null
                ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {test.decision}
          </span>
        </div>

        {/* Hypotheses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-500">Null Hypothesis (H0):</span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{test.null_hypothesis_H0}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-500">Alternative Hypothesis (H1):</span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{test.alt_hypothesis_H1}</p>
          </div>
        </div>

        {/* Key Numerical Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="text-[10px] uppercase font-bold text-slate-400">Test Statistic</div>
            <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              {test.statistic}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="text-[10px] uppercase font-bold text-slate-400">p-value (alpha=0.05)</div>
            <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              {test.p_value < 0.0001 ? '< 0.0001' : test.p_value.toFixed(4)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="text-[10px] uppercase font-bold text-slate-400">Effect Size ({test.effect_size.metric})</div>
            <div className="text-sm font-extrabold font-mono text-teal-600 dark:text-teal-400 mt-0.5">
              {test.effect_size.value} {test.effect_size.strength && `(${test.effect_size.strength})`}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="text-[10px] uppercase font-bold text-slate-400">Statistical Significance</div>
            <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
              {test.reject_null ? 'Significant' : 'Not Significant'}
            </div>
          </div>
        </div>

        {/* Assumption Advisor Badge */}
        {test.assumption_advisor && (
          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start space-x-2.5 text-xs text-teal-900 dark:text-teal-200">
            <Compass className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
            <div>
              <span className="font-bold">Assumption Advisor: </span>
              <span>{test.assumption_advisor.rationale}</span>
            </div>
          </div>
        )}

        {/* Plain Language Interpretation */}
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl">
          <b>Plain-Language Conclusion: </b> {test.interpretation}
        </div>

        {/* Limitations Notice */}
        <div className="text-[11px] text-slate-400 italic">
          <b>Limitations: </b> {test.limitations}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <FlaskConical className="w-6 h-6 text-teal-500" />
          <span>Statistical Analysis Laboratory</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Rigorous parametric and non-parametric hypothesis testing with automated Assumption Advisor and effect sizes
        </p>
      </div>

      {/* Descriptive Statistics Card */}
      {descriptive && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-teal-500" />
              <span>Parametric & Non-Parametric Descriptive Statistics ({descriptive.column})</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              N = {descriptive.sample_size.toLocaleString()} records
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Mean</div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">₹{descriptive.mean}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Median</div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">₹{descriptive.median}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Std Dev (s)</div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">₹{descriptive.std}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold">IQR (Q3 - Q1)</div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">₹{descriptive.iqr}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Skewness</div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">{descriptive.skewness}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[10px] text-slate-400 uppercase font-bold">95% CI (Mean)</div>
              <div className="text-xs font-bold font-mono text-teal-600 dark:text-teal-400">
                ₹{descriptive.ci_95[0]} - ₹{descriptive.ci_95[1]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hypothesis Tests Cards */}
      <div className="space-y-6">
        {weekday_vs_weekend_test && renderTestCard(weekday_vs_weekend_test)}
        {category_payment_test && renderTestCard(category_payment_test)}
        {stationarity_adf_test && renderTestCard(stationarity_adf_test)}
      </div>
    </div>
  );
};
