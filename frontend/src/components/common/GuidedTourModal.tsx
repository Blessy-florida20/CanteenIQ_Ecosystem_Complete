import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Layers, TrendingUp, ShieldCheck } from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToPage: (page: any) => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: 'Welcome to CanteenIQ',
    badge: 'Closed Decision Loop',
    content:
      'CanteenIQ is not just static charts. It is an intelligent institutional canteen decision support ecosystem spanning descriptive, predictive, prescriptive, and simulation analytics.',
    highlight: 'Data -> Quality -> Insight -> Forecast -> Plan -> Simulate -> Recommend -> Decide -> Track -> Learn',
    page: 'dashboard'
  },
  {
    step: 2,
    title: 'Data Studio & Audit-Trailed Cleaning',
    badge: 'Data Integrity',
    content:
      'Inspect dataset schemas and data lineage. Unlike naive systems that silently drop corrupt records, CanteenIQ quarantines invalid entries into a reviewable table and scores data across 5 dimensions.',
    highlight: '5 Quality Dimensions: Completeness, Validity, Uniqueness, Consistency, and Timeliness.',
    page: 'studio'
  },
  {
    step: 3,
    title: 'Demand Forecasting & Model Leaderboard',
    badge: 'Predictive Rigor',
    content:
      'Forecast institutional demand without lookahead leakage. Compare Seasonal Naive baselines against Holt-Winters and Random Forest models using rolling-origin walk-forward backtesting.',
    highlight: 'Each model run exports an auditable Model Card stored in SQLite.',
    page: 'forecasting'
  },
  {
    step: 4,
    title: 'Smart Prep Planner & Digital Twin',
    badge: 'Prescriptive Economics',
    content:
      'Balance food waste against stock-outs using the Newsvendor critical ratio model. Simulate lunch queue wait times and determine optimal counter staffing with the Discrete-Event Digital Twin.',
    highlight: 'Newsvendor critical ratio CR = (Price - Cost) / Price, simulated with Monte Carlo uncertainty.',
    page: 'planner'
  },
  {
    step: 5,
    title: 'Decision Tracker & Academic Deliverables',
    badge: 'Viva Defense Ready',
    content:
      'Close the loop by accepting recommendations into the Decision Impact Tracker with causal-honesty safeguards. Download verified Excel workbooks, ReportLab PDFs, editable DOCX, and 22-slide PPTX.',
    highlight: '60+ viva defense questions, comprehensive glossary, and live execution tests included.',
    page: 'reports'
  }
];

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onJumpToPage
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const stepData = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
      onJumpToPage(TOUR_STEPS[currentStep + 1].page);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      onJumpToPage(TOUR_STEPS[currentStep - 1].page);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
              {stepData.badge}
            </span>
            <span className="text-xs text-slate-400">
              Step {stepData.step} of {TOUR_STEPS.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Body */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {stepData.title}
          </h2>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {stepData.content}
          </p>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-teal-800 dark:text-teal-300">
            {stepData.highlight}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center space-x-1.5 py-2">
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep
                  ? 'w-6 bg-teal-500'
                  : 'w-1.5 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center space-x-1 text-xs font-semibold px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
          >
            <span>{isLast ? 'Complete Tour' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
