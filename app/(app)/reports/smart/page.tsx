'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MessageSquareCode, Search, Play, Download, Table as TableIcon, BarChart3, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '@/lib/api';
import { ErrorState, Skeleton } from '@/components/shared';
import { useToast } from '@/components/toast';

interface SmartQueryDef {
  id: string;
  title: string;
  question: string;
  category: string;
  chartType: string;
  xAxisKey: string;
  yAxisKey: string;
}

interface QueryResult {
  query_id: string;
  title: string;
  rows: Record<string, unknown>[];
  summary: string;
}

export default function SmartReportsPage() {
  const { showToast } = useToast();
  const [selectedQueryId, setSelectedQueryId] = useState<string>('top_customers_revenue');
  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const queriesListQuery = useQuery({
    queryKey: ['smart-queries-catalog'],
    queryFn: async () => {
      const res = await api.get<SmartQueryDef[]>('/reports/smart-queries');
      return res.data;
    }
  });

  const executeMutation = useMutation({
    mutationFn: async (payload: { query_id: string; params: { days: number } }) => {
      const res = await api.post<QueryResult>('/reports/execute-smart-query', payload);
      return res.data;
    }
  });

  const catalog = queriesListQuery.data || [];
  const activeQueryDef = catalog.find(q => q.id === selectedQueryId) || catalog[0];

  const handleRunQuery = (queryId: string) => {
    setSelectedQueryId(queryId);
    executeMutation.mutate({
      query_id: queryId,
      params: { days: daysFilter }
    });
  };

  const filteredCatalog = catalog.filter(
    q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) || q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resultData = executeMutation.data;
  const rows = resultData?.rows || [];

  const handleExportCsv = () => {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const csvContent = 'data:text/csv;charset=utf-8,' +
      [keys.join(','), ...rows.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedQueryId}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report exported as CSV', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <MessageSquareCode size={16} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Smart Factory Assistant</p>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">Natural Language Factory Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pre-built smart queries answering everyday factory questions through instant SQL aggregation.
        </p>
      </div>

      {/* Query Search & Catalog */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-800">Select Factory Question</h2>
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search question..."
              className="w-full rounded-lg border border-slate-300 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filteredCatalog.map(q => {
            const isSelected = q.id === selectedQueryId;
            return (
              <button
                key={q.id}
                onClick={() => handleRunQuery(q.id)}
                className={`flex flex-col justify-between rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                    {q.category}
                  </span>
                  <p className="mt-2 text-xs font-semibold text-slate-800">
                    &ldquo;{q.question}&rdquo;
                  </p>
                </div>
                <p className="mt-3 text-[11px] text-indigo-600 font-medium">{q.title}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Date Horizon:</label>
            <select
              value={daysFilter}
              onChange={e => setDaysFilter(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none"
            >
              <option value={30}>Last 30 Days</option>
              <option value={60}>Last 60 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={180}>Last 6 Months</option>
              <option value={365}>Last 1 Year</option>
            </select>
          </div>

          <button
            onClick={() => handleRunQuery(selectedQueryId)}
            disabled={executeMutation.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            <Play size={13} />
            {executeMutation.isPending ? 'Executing SQL...' : 'Run Query'}
          </button>
        </div>
      </div>

      {/* Query Execution Output */}
      {resultData && (
        <div className="space-y-6">
          {/* Summary Alert */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-indigo-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{resultData.title}</h3>
                <p className="mt-0.5 text-xs text-indigo-700">{resultData.summary}</p>
              </div>
              {rows.length > 0 && (
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  <Download size={13} />
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Visualization if chart keys are present */}
          {rows.length > 0 && activeQueryDef?.xAxisKey && activeQueryDef?.yAxisKey && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800">Visual Trend Chart</h3>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rows} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey={activeQueryDef.xAxisKey}
                      stroke="#94a3b8"
                      fontSize={10}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey={activeQueryDef.yAxisKey} fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Results Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800">Data Table ({rows.length} records)</h3>
            </div>

            {rows.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      {Object.keys(rows[0]).map(key => (
                        <th key={key} className="p-3">{key.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        {Object.keys(rows[0]).map(key => (
                          <td key={key} className="p-3 font-medium text-slate-700">
                            {String(row[key] ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">No records returned for the selected filter.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
