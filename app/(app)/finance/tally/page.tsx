'use client';

import { useState } from 'react';
import { Download, FileCode, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { WorkflowCard } from '@/components/workflow-card';

export default function TallySyncPage() {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(1); // 1st of current month
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadTallyXml = async (type: 'sales' | 'purchases' | 'masters') => {
    setDownloading(type);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      const params = new URLSearchParams();
      if (type !== 'masters') {
        if (dateFrom) params.append('from', dateFrom);
        if (dateTo) params.append('to', dateTo);
      }

      const url = `${base}/finance/tally/${type}.xml?${params.toString()}`;
      const res = await fetch(url, { credentials: 'include' });

      if (!res.ok) throw new Error('Failed to generate Tally XML');

      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `tally_${type}_${dateFrom}_to_${dateTo}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error exporting Tally XML');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Accounting Integration</p>
          <h1 className="text-2xl font-bold text-slate-800">Tally Prime One-Click Sync</h1>
          <p className="mt-1 text-sm text-slate-500">
            Export standard Tally Prime XML vouchers for seamless monthly CA audit and GST filing.
          </p>
        </div>
      </div>

      {/* Date Filter Card */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-800">1. Select Accounting Period</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-600">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Sales Vouchers */}
        <div className="flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileCode size={22} />
            </div>
            <h3 className="font-semibold text-slate-800">Sales Vouchers XML</h3>
            <p className="mt-1 text-xs text-slate-500">
              Includes Tax Invoices with customer party ledgers, taxable values, and CGST/SGST/IGST tax breakdowns.
            </p>
          </div>
          <button
            onClick={() => downloadTallyXml('sales')}
            disabled={downloading === 'sales'}
            className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Download size={16} />
            {downloading === 'sales' ? 'Exporting...' : 'Download Sales XML'}
          </button>
        </div>

        {/* Purchase Vouchers */}
        <div className="flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <FileCode size={22} />
            </div>
            <h3 className="font-semibold text-slate-800">Purchase Bills XML</h3>
            <p className="mt-1 text-xs text-slate-500">
              Includes vendor purchase orders & bills mapped with Sundry Creditor accounts.
            </p>
          </div>
          <button
            onClick={() => downloadTallyXml('purchases')}
            disabled={downloading === 'purchases'}
            className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Download size={16} />
            {downloading === 'purchases' ? 'Exporting...' : 'Download Purchase XML'}
          </button>
        </div>

        {/* Ledger Masters */}
        <div className="flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <FileCode size={22} />
            </div>
            <h3 className="font-semibold text-slate-800">Party Masters XML</h3>
            <p className="mt-1 text-xs text-slate-500">
              Exports all customer & vendor ledgers with GSTIN numbers, state codes, and billing addresses.
            </p>
          </div>
          <button
            onClick={() => downloadTallyXml('masters')}
            disabled={downloading === 'masters'}
            className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            <Download size={16} />
            {downloading === 'masters' ? 'Exporting...' : 'Download Masters XML'}
          </button>
        </div>
      </div>

      {/* Instructions Guide */}
      <WorkflowCard
        title="How to Import XML into Tally Prime"
        description="Hand this 2-step guide to your accountant or Chartered Accountant"
      >
        <div className="space-y-4 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">1</span>
            <p>
              Open your company in <strong>Tally Prime</strong> and press <strong>Alt + O</strong> (or click <strong>Import</strong> on top menu bar).
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">2</span>
            <p>
              Select <strong>Transactions</strong> (for Sales/Purchase XML) or <strong>Masters</strong> (for Ledger Masters XML).
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">3</span>
            <p>
              Browse and select the downloaded <strong>.xml</strong> file. Tally Prime will instantly import and verify all vouchers!
            </p>
          </div>
        </div>
      </WorkflowCard>
    </div>
  );
}
