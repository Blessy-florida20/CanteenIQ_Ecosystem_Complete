import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { runQueueSimulation } from '../services/api';

export const DigitalTwinQueuePage: React.FC = () => {
  const [numCounters, setNumCounters] = useState<number>(3);
  const [serviceTime, setServiceTime] = useState<number>(45.0); // seconds per transaction
  const [simData, setSimData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQueueSim();
  }, [numCounters, serviceTime]);

  const loadQueueSim = async () => {
    setIsLoading(true);
    try {
      const res = await runQueueSimulation(numCounters, serviceTime);
      setSimData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !simData) {
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
            <Clock className="w-6 h-6 text-teal-500" />
            <span>Canteen Digital Twin: Queue & Staffing Simulator</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Discrete-event queue model (M/M/c) simulating customer arrivals, wait times, and counter staffing SLAs
          </p>
        </div>
      </div>

      {/* Assumptions Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-300">
        <HelpCircle className="w-4 h-4 shrink-0 text-teal-500 mt-0.5" />
        <div>
          <b>Mathematical Modeling Note:</b> {simData.assumptions_note} Customer arrival intensities are derived from empirical transactions.
        </div>
      </div>

      {/* Controls & KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Panel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Counter Configuration
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Active Counters:</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{numCounters} counters</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={numCounters}
                onChange={(e) => setNumCounters(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Avg Service Time per Customer:</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{serviceTime} seconds</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                step="5"
                value={serviceTime}
                onChange={(e) => setServiceTime(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 space-y-1">
            <span className="font-bold">Target Service SLA:</span>
            <p className="text-[11px]">Maximum wait threshold: &lt; 3.0 minutes (180s) to minimize queue abandonment.</p>
          </div>
        </div>

        {/* Wait Time Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Hourly Wait Time Distribution (Average vs P90)
            </h3>
            <p className="text-[11px] text-slate-500">{simData.takeaway}</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={simData.hourly_simulation}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: 'Wait (sec)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip
                  formatter={(v: any) => [`${Math.round(v)}s (${(v / 60).toFixed(1)} mins)`, 'Wait Time']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Bar dataKey="avg_wait_seconds" fill="#0d9488" name="Average Wait (s)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="p90_wait_seconds" fill="#d97706" name="90th Percentile Wait (s)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hourly Staffing & Queue Metrics Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Hourly Operational Queue & Staffing Roster
        </h3>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <th className="p-3 font-semibold">Operating Hour</th>
                <th className="p-3 font-semibold">Arrivals (students/hr)</th>
                <th className="p-3 font-semibold">Counter Utilization %</th>
                <th className="p-3 font-semibold">Avg Wait Time</th>
                <th className="p-3 font-semibold">P90 Wait Time</th>
                <th className="p-3 font-semibold">Staffing Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {simData.hourly_simulation.map((row: any) => (
                <tr key={row.hour} className="border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                  <td className="p-3 font-sans font-semibold text-slate-900 dark:text-slate-100">{row.hour}</td>
                  <td className="p-3">{row.customer_arrivals_per_hour}</td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{row.counter_utilization_pct}%</td>
                  <td className="p-3 text-teal-600 dark:text-teal-400 font-bold">{Math.round(row.avg_wait_seconds)}s ({(row.avg_wait_seconds / 60).toFixed(1)}m)</td>
                  <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{Math.round(row.p90_wait_seconds)}s ({(row.p90_wait_seconds / 60).toFixed(1)}m)</td>
                  <td className="p-3 font-sans text-slate-700 dark:text-slate-300 font-medium">{row.staffing_recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
