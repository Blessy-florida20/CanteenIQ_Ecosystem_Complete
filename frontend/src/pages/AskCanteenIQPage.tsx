import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Sparkles,
  Send,
  Table as TableIcon,
  Calculator,
  Filter,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { GlobalFilters } from '../types/api';
import { askAssistant } from '../services/api';

interface AskCanteenIQPageProps {
  filters: GlobalFilters;
}

export const AskCanteenIQPage: React.FC<AskCanteenIQPageProps> = ({ filters }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    "What are the top 5 products by revenue?",
    "Which category has the highest profit margin?",
    "What are peak hours for canteen footfall?",
    "Show total net sales and profit summary"
  ];

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const res = await askAssistant(q, filters.datasetId);
      setResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>100% Offline Rule/Intent Engine (No Paid APIs or External LLMs)</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Ask CanteenIQ Analytics Assistant
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Query canteen trends, menu rankings, profit margins, and peak volumes using natural language
        </p>
      </div>

      {/* Query Search Box */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center space-x-3">
        <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder="Ask a question (e.g. 'What are the top 5 products by revenue?')..."
          className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none py-2"
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={isLoading || !query.trim()}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition flex items-center space-x-1.5 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Suggested Query Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Try asking:</span>
        {sampleQuestions.map((q) => (
          <button
            key={q}
            onClick={() => {
              setQuery(q);
              handleSearch(q);
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-teal-400 text-[11px] font-medium transition shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Answer Response Card */}
      {response && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                Intent: {response.intent}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
              <Calculator className="w-3.5 h-3.5 text-teal-500" />
              <span>{response.formula_used}</span>
            </div>
          </div>

          {/* Text Answer */}
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
            {response.text_answer}
          </p>

          {/* Table Data if available */}
          {response.table_data && response.table_data.length > 0 && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {Object.keys(response.table_data[0]).map((key) => (
                      <th key={key} className="p-2.5 font-semibold">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {response.table_data.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                      {Object.values(row).map((val: any, cIdx) => (
                        <td key={cIdx} className="p-2.5 font-sans text-slate-700 dark:text-slate-300">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
