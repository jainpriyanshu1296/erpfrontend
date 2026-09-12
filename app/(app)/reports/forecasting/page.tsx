'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, AlertTriangle, ShieldCheck, DollarSign, Activity, RefreshCw, Layers } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { api } from '@/lib/api';
import { ErrorState, Skeleton } from '@/components/shared';
import { useToast } from '@/components/toast';

interface DemandItem {
  item_id: string;
  item_name: string;
  item_code: string;
  confidence: string;
  wma_baseline: number;
  annual_avg: number;
  historical_months: { month: string; actual_qty: number }[];
  forecast: { month: string; predicted_qty: number; seasonal_index: number }[];
}

interface ReorderItem {
  item_id: string;
  item_name: string;
  item_code: string;
  current_stock: number;
  avg_daily_consumption: number;
  lead_time_days: number;
  safety_days: number;
  current_reorder_level: number;
  suggested_reorder_level: number;
  status: 'CRITICAL_STOCKOUT_RISK' | 'UNDER_PROTECTED' | 'OPTIMAL';
  message: string;
}

interface CashFlowHorizon {
  horizon: string;
  label: string;
  expected_inflow: number;
  expected_outflow: number;
  net_cash_position: number;
}

export default function ForecastingPage() {
  const { showToast } = useToast();
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  const demandQuery = useQuery({
    queryKey: ['forecasting-demand'],
    queryFn: async () => {
      const res = await api.get<DemandItem[]>('/forecasting/demand');
      return res.data;
    }
  });

  const reorderQuery = useQuery({
    queryKey: ['forecasting-reorder'],
    queryFn: async () => {
      const res = await api.get<ReorderItem[]>('/forecasting/reorder-suggestions');
      return res.data;
    }
  });

  const cashflowQuery = useQuery({
    queryKey: ['forecasting-cashflow'],
    queryFn: async () => {
      const res = await api.get<CashFlowHorizon[]>('/forecasting/cashflow');
      return res.data;
    }
  });

  if (demandQuery.isPending || reorderQuery.isPending || cashflowQuery.isPending) {
    return <Skeleton className="h-96" />;
  }

  if (demandQuery.isError) return <ErrorState message={demandQuery.error.message} retry={() => demandQuery.refetch()} />;

  const demandItems = demandQuery.data || [];
  const currentItem = demandItems[selectedItemIndex] || demandItems[0];

  // Prepare chart data combining past 6 months + 3 future forecast months
  const chartData = currentItem ? [
    ...(currentItem.historical_months || []).slice(-6).map(m => ({
      name: m.month,
      actual: m.actual_qty,
      forecast: null
    })),
    ...(currentItem.forecast || []).map(f => ({
      name: `${f.month} (P)`,
      actual: null,
      forecast: f.predicted_qty
    }))
  ] : [];

  const reorderItems = reorderQuery.data || [];
  const cashflow = cashflowQuery.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <TrendingUp size={16} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Local Mathematical AI</p>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">Manufacturing Forecasting & Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pure SQL aggregate algorithms computing demand trends, dynamic lead-time safety stock, and cash runway.
        </p>
      </div>

      {/* 2.1 Demand Forecasting Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">2.1 Weighted Moving Average Demand Forecast</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Formula: (M1×1 + M2×2 + M3×3)/6 × Seasonal Index
            </p>
          </div>

          {demandItems.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Select Item:</label>
              <select
                value={selectedItemIndex}
                onChange={e => setSelectedItemIndex(Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none"
              >
                {demandItems.map((it, idx) => (
                  <option key={it.item_id} value={idx}>{it.item_name} ({it.item_code})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {currentItem ? (
          <div className="mt-6">
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Confidence Score</span>
                <p className="text-sm font-bold text-indigo-600">{currentItem.confidence}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">WMA Baseline</span>
                <p className="text-sm font-bold text-slate-800">{currentItem.wma_baseline} units/mo</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Annual Monthly Avg</span>
                <p className="text-sm font-bold text-slate-800">{currentItem.annual_avg} units/mo</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="actual" fill="#6366f1" name="Actual Sales (Trailing)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="forecast" fill="#10b981" name="Forecast Demand (Next 3 Mo)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-slate-400">No historical sales orders found to calculate demand forecast.</p>
        )}
      </div>

      {/* 2.2 Smart Reorder Level Suggestions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b pb-4">
          <h2 className="text-base font-bold text-slate-800">2.2 Dynamic Lead-Time Reorder Suggestions</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Formula: avg_daily_consumption × (vendor_lead_time + 3 days safety stock)
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3">Item</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Avg Daily Usage</th>
                <th className="p-3">Vendor Lead Time</th>
                <th className="p-3">Current Reorder</th>
                <th className="p-3">Suggested Reorder</th>
                <th className="p-3">Safety Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reorderItems.map(it => (
                <tr key={it.item_id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-semibold text-slate-800">
                    {it.item_name}
                    <span className="block text-[10px] text-slate-400">{it.item_code}</span>
                  </td>
                  <td className="p-3">{it.current_stock}</td>
                  <td className="p-3">{it.avg_daily_consumption}/day</td>
                  <td className="p-3">{it.lead_time_days} days</td>
                  <td className="p-3 font-medium text-slate-700">{it.current_reorder_level}</td>
                  <td className="p-3 font-bold text-indigo-600">{it.suggested_reorder_level}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        it.status === 'CRITICAL_STOCKOUT_RISK'
                          ? 'bg-red-100 text-red-700'
                          : it.status === 'UNDER_PROTECTED'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {it.status === 'CRITICAL_STOCKOUT_RISK' ? <AlertTriangle size={11} /> : <ShieldCheck size={11} />}
                      {it.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2.4 Cash Flow Runway Projection */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b pb-4">
          <h2 className="text-base font-bold text-slate-800">2.4 Cash Flow Runway Projection (30 / 60 / 90 Days)</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Expected Customer Inflows vs Pending Vendor Outflows
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="expected_inflow" fill="#10b981" name="Expected Inflow (₹)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expected_outflow" fill="#f43f5e" name="Expected Outflow (₹)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col justify-center space-y-3">
            {cashflow.map(cf => (
              <div key={cf.horizon} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <div>
                  <span className="font-semibold text-slate-800">{cf.label}</span>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                    <span>In: ₹{cf.expected_inflow}</span>
                    <span>Out: ₹{cf.expected_outflow}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase">Net Working Capital</span>
                  <p className={`text-sm font-bold ${cf.net_cash_position >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ₹{cf.net_cash_position}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
