import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileCode,
  Presentation,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { GlobalFilters } from '../types/api';
import { generateReport, listReports } from '../services/api';

interface ReportsExportsPageProps {
  filters: GlobalFilters;
}

export const ReportsExportsPage: React.FC<ReportsExportsPageProps> = ({ filters }) => {
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await listReports();
      setReportsList(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (type: 'excel' | 'pdf' | 'docx' | 'pptx') => {
    setIsGenerating(type);
    setStatusMsg(`Generating official ${type.toUpperCase()} deliverable...`);
    try {
      const res = await generateReport(type, filters.datasetId);
      setStatusMsg(res.message);
      await loadReports();
    } catch (err) {
      console.error(err);
      setStatusMsg(`Failed to generate ${type.toUpperCase()}`);
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <FileText className="w-6 h-6 text-teal-500" />
          <span>Reports & Academic Deliverables Engine</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Compiles live analytical results into professional Excel, ReportLab PDF, Word report, and 22-slide PowerPoint presentation
        </p>
      </div>

      {/* Generation Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Excel Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Multi-Tab Excel Workbook
            </h3>
            <p className="text-[11px] text-slate-500">
              Contains Executive KPIs, category summaries, product rankings, and 500 cleaned transaction samples.
            </p>
          </div>

          <button
            onClick={() => handleGenerate('excel')}
            disabled={isGenerating === 'excel'}
            className="w-full flex items-center justify-center space-x-2 text-xs font-semibold py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
          >
            {isGenerating === 'excel' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Generate Excel (.xlsx)</span>
          </button>
        </div>

        {/* PDF Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Executive PDF Report
            </h3>
            <p className="text-[11px] text-slate-500">
              ReportLab-rendered executive decision brief with KPI tables, charts summary, and recommendations.
            </p>
          </div>

          <button
            onClick={() => handleGenerate('pdf')}
            disabled={isGenerating === 'pdf'}
            className="w-full flex items-center justify-center space-x-2 text-xs font-semibold py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50"
          >
            {isGenerating === 'pdf' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Generate PDF Report</span>
          </button>
        </div>

        {/* DOCX Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Academic Project Report
            </h3>
            <p className="text-[11px] text-slate-500">
              Editable Word document (.docx) formatted with complete chapter outlines and live computed metrics.
            </p>
          </div>

          <button
            onClick={() => handleGenerate('docx')}
            disabled={isGenerating === 'docx'}
            className="w-full flex items-center justify-center space-x-2 text-xs font-semibold py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
          >
            {isGenerating === 'docx' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Generate DOCX Report</span>
          </button>
        </div>

        {/* PPTX Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Presentation className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              22-Slide Presentation
            </h3>
            <p className="text-[11px] text-slate-500">
              python-pptx generated 16:9 widescreen presentation ready for 10-12 minute academic viva defense.
            </p>
          </div>

          <button
            onClick={() => handleGenerate('pptx')}
            disabled={isGenerating === 'pptx'}
            className="w-full flex items-center justify-center space-x-2 text-xs font-semibold py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition disabled:opacity-50"
          >
            {isGenerating === 'pptx' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Generate PPTX (22 Slides)</span>
          </button>
        </div>
      </div>

      {/* Status Notification */}
      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Generated Reports Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Generated Report Deliverables on Disk ({reportsList.length} files)
        </h3>

        {reportsList.length === 0 ? (
          <p className="text-xs text-slate-400">No reports generated yet. Click any button above to compile deliverables.</p>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <th className="p-3 font-semibold">Filename</th>
                  <th className="p-3 font-semibold">Size</th>
                  <th className="p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {reportsList.map((r) => (
                  <tr key={r.filename} className="border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                    <td className="p-3 font-sans font-semibold text-slate-900 dark:text-slate-100">{r.filename}</td>
                    <td className="p-3 text-slate-500">{(r.size_bytes / 1024).toFixed(1)} KB</td>
                    <td className="p-3 font-sans">
                      <a
                        href={r.download_url}
                        download={r.filename}
                        className="inline-flex items-center space-x-1 text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
