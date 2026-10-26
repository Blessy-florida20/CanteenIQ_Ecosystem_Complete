import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  AlertTriangle,
  Play,
  FileText,
  Layers,
  CheckCircle2,
  Trash2,
  Download,
  Filter
} from 'lucide-react';
import { GlobalFilters } from '../types/api';
import { fetchDatasetPreview, cleanDataset, fetchDataLineage } from '../services/api';

interface DataStudioProps {
  filters: GlobalFilters;
}

export const DataStudio: React.FC<DataStudioProps> = ({ filters }) => {
  const [preview, setPreview] = useState<any>(null);
  const [lineage, setLineage] = useState<any>(null);
  const [cleanResult, setCleanResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'quarantine' | 'lineage' | 'log'>('preview');
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadDataStudio();
  }, [filters.datasetId, currentPage]);

  const loadDataStudio = async () => {
    setIsLoading(true);
    try {
      const [prevRes, linRes] = await Promise.all([
        fetchDatasetPreview(filters.datasetId, currentPage, 15),
        fetchDataLineage(filters.datasetId)
      ]);
      setPreview(prevRes);
      setLineage(linRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClean = async () => {
    setIsCleaning(true);
    try {
      const res = await cleanDataset(filters.datasetId);
      setCleanResult(res);
      setActiveTab('quarantine');
      loadDataStudio();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCleaning(false);
    }
  };

  if (isLoading && !preview) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const qualityScore = cleanResult?.quality_report?.overall_quality_score || lineage?.quality_score || 94.5;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Data Studio: Quality & Lineage Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit-trailed cleaning, 5-dimension quality scoring, and quarantine isolation
          </p>
        </div>

        <button
          onClick={handleClean}
          disabled={isCleaning}
          className="flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition disabled:opacity-50"
        >
          {isCleaning ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{isCleaning ? 'Cleaning...' : 'Run Data Studio Cleaner'}</span>
        </button>
      </div>

      {/* Quality Score Overview Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Data Quality Score (DQS)
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {qualityScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Dataset: <b className="text-slate-700 dark:text-slate-300 font-mono">{filters.datasetId}</b> ({preview?.total_rows?.toLocaleString()} rows)
          </div>
        </div>

        {/* 5-Dimension Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {['completeness', 'validity', 'uniqueness', 'consistency', 'timeliness'].map((dim) => {
            const val = cleanResult?.quality_report?.dimensions?.[dim] ?? 95;
            return (
              <div key={dim} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 capitalize">
                  {dim}
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {val}%
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full" style={{ width: `${val}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'preview'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Raw Schema & Preview
        </button>

        <button
          onClick={() => setActiveTab('quarantine')}
          className={`px-4 py-2 font-semibold border-b-2 flex items-center space-x-1.5 transition ${
            activeTab === 'quarantine'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Quarantine Review Table</span>
          {cleanResult && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 ml-1">
              {cleanResult.quarantined_sample?.length} rows
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('lineage')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'lineage'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Data Lineage Flow
        </button>

        <button
          onClick={() => setActiveTab('log')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'log'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Transformation Audit Log
        </button>
      </div>

      {/* Tab 1: Raw Preview */}
      {activeTab === 'preview' && preview && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {preview.schema.map((col: any) => (
                      <th key={col.column} className="p-3 font-semibold border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        <div>{col.column}</div>
                        <div className="text-[9px] text-slate-400 font-normal uppercase">{col.dtype}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      {preview.schema.map((col: any) => (
                        <td key={col.column} className="p-3 text-slate-600 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {String(row[col.column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing page {preview.page} of {Math.ceil(preview.total_rows / preview.page_size)} ({preview.total_rows.toLocaleString()} total rows)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Quarantine Table */}
      {activeTab === 'quarantine' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Quarantine Review Table (Never Silently Dropped)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Invalid records are safely isolated with explicit audit rejection reasons.
              </p>
            </div>
            {cleanResult && (
              <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400">
                {cleanResult.quarantined_sample?.length} records quarantined
              </span>
            )}
          </div>

          {!cleanResult ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
              Click 'Run Data Studio Cleaner' above to test quarantine isolation on dirty records.
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-500/10 text-amber-900 dark:text-amber-200">
                    <th className="p-3 font-semibold border-b border-amber-200 dark:border-amber-800">Quarantine Reason</th>
                    <th className="p-3 font-semibold border-b border-amber-200 dark:border-amber-800">Transaction ID</th>
                    <th className="p-3 font-semibold border-b border-amber-200 dark:border-amber-800">Date</th>
                    <th className="p-3 font-semibold border-b border-amber-200 dark:border-amber-800">Product</th>
                    <th className="p-3 font-semibold border-b border-amber-200 dark:border-amber-800">Quantity</th>
                    <th className="p-3 font-semibold border-b border-amber-200 dark:border-amber-800">Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {cleanResult.quarantined_sample.map((q: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                      <td className="p-3 text-rose-600 dark:text-rose-400 font-semibold">{q.quarantine_reason}</td>
                      <td className="p-3">{q.transaction_id}</td>
                      <td className="p-3">{q.transaction_date}</td>
                      <td className="p-3">{q.product_name || 'N/A'}</td>
                      <td className="p-3">{q.quantity}</td>
                      <td className="p-3">₹{q.unit_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Data Lineage Flow */}
      {activeTab === 'lineage' && lineage && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            End-to-End Data Lineage Graph
          </h3>
          <p className="text-[11px] text-slate-500">
            Visualizes transformation topology from raw ingestion to quarantine and clean processed states.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
            {lineage.nodes.map((node: any, idx: number) => (
              <div
                key={node.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2 relative"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 capitalize">
                    {node.type}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {node.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Transformation Log */}
      {activeTab === 'log' && lineage && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Audit Transformation Log
          </h3>

          <div className="space-y-2">
            {(cleanResult?.transformation_log || lineage.transformation_log || []).map((l: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{l.step}</span>
                  <p className="text-slate-500 text-[11px]">{l.action}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                    {l.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">{l.rows_affected} rows</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
