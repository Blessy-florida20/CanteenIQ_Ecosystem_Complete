import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Award
} from 'lucide-react';
import { GlobalFilters, Recommendation } from '../types/api';
import { fetchRecommendations, logDecision } from '../services/api';

interface RecommendationCenterPageProps {
  filters: GlobalFilters;
  onNavigate: (page: any) => void;
}

export const RecommendationCenterPage: React.FC<RecommendationCenterPageProps> = ({
  filters,
  onNavigate
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [filters.datasetId]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await fetchRecommendations(filters.datasetId);
      setRecommendations(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (rec: Recommendation) => {
    try {
      await logDecision({
        title: rec.title,
        recommendation_id: rec.id,
        category: rec.category,
        action_taken: rec.proposed_action,
        baseline_metric: 85.0
      });
      setAcceptedIds((prev) => [...prev, rec.id]);
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

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-teal-500" />
            <span>Prescriptive Recommendation Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deterministic, explainable business rules with mathematical evidence links and priority scoring
          </p>
        </div>

        <button
          onClick={() => onNavigate('decisions')}
          className="flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
        >
          <span>View Decision Tracker</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Priority Scoring Documentation Callout */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
        <b>Documented Priority Scoring Formula:</b> Priority Score = Impact (1-10) × Evidence Strength (1-10) / Effort (1-5). 
        Only actions supported by live statistical evidence are proposed.
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isAccepted = acceptedIds.includes(rec.id);
          return (
            <div
              key={rec.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-sm space-y-4 ${
                isAccepted ? 'border-teal-500/60 bg-teal-50/20 dark:bg-teal-950/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold flex items-center justify-center text-xs">
                    {rec.priority_score}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      {rec.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {rec.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                    {rec.confidence_level}
                  </span>
                </div>
              </div>

              {/* Observed Pattern & Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <span className="font-bold text-slate-500">Observed Pattern:</span>
                  <p className="text-slate-700 dark:text-slate-300">{rec.observed_pattern}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">Empirical Evidence:</span>
                    <button
                      onClick={() => onNavigate(rec.source_link.replace('/', ''))}
                      className="text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1 font-semibold text-[11px]"
                    >
                      <span>Inspect Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{rec.evidence_metrics}</p>
                </div>
              </div>

              {/* Proposed Action & Impact */}
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold">Proposed Action: </span>
                  <span>{rec.proposed_action}</span>
                  <div className="text-[11px] text-teal-700 dark:text-teal-300 mt-1 font-medium">
                    Expected Direction: {rec.expected_direction}
                  </div>
                </div>

                {/* Accept / Reject / Defer Buttons */}
                <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0">
                  {isAccepted ? (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Transferred to Tracker</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAccept(rec)}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition"
                      >
                        Accept & Track
                      </button>
                      <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs transition">
                        Defer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
