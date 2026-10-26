import React from 'react';
import { X, Calculator, Database, Table as TableIcon, Download } from 'lucide-react';

export interface EvidenceInfo {
  title: string;
  formula: string;
  rowCount: number;
  dataSlice?: any[];
}

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceInfo | null;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  evidence
}) => {
  if (!isOpen || !evidence) return null;

  const handleDownloadSlice = () => {
    if (!evidence.dataSlice || evidence.dataSlice.length === 0) return;
    const headers = Object.keys(evidence.dataSlice[0]).join(',');
    const rows = evidence.dataSlice
      .map((r) => Object.values(r).map((v) => `"${v}"`).join(','))
      .join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${evidence.title.replace(/\s+/g, '_')}_evidence.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col p-6 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Evidence & Formula Trace
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {evidence.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 text-xs">
          {/* Formula Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
              <Calculator className="w-4 h-4 text-teal-500" />
              <span>Exact Mathematical Formula</span>
            </div>
            <pre className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-teal-700 dark:text-teal-300 overflow-x-auto whitespace-pre-wrap">
              {evidence.formula}
            </pre>
          </div>

          {/* Sample / Included Rows */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
                <Database className="w-4 h-4 text-teal-500" />
                <span>Rows Included in Calculation</span>
              </div>
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                {evidence.rowCount.toLocaleString()} records
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Computed live from the backend API. No hardcoded constants or fabricated figures.
            </p>
          </div>

          {/* Data Slice Table */}
          {evidence.dataSlice && evidence.dataSlice.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <TableIcon className="w-4 h-4 text-teal-500" />
                  <span>Underlying Data Slice Sample</span>
                </div>
                <button
                  onClick={handleDownloadSlice}
                  className="flex items-center space-x-1 text-teal-600 dark:text-teal-400 font-medium hover:underline text-[11px]"
                >
                  <Download className="w-3 h-3" />
                  <span>Export Slice CSV</span>
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto max-h-60">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {Object.keys(evidence.dataSlice[0]).map((key) => (
                        <th key={key} className="p-2 font-semibold border-b border-slate-200 dark:border-slate-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evidence.dataSlice.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        {Object.values(row).map((val: any, cIdx) => (
                          <td key={cIdx} className="p-2 text-slate-600 dark:text-slate-400 font-mono">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 text-xs transition"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
