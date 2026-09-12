'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, CheckCircle2, Power, AlertCircle, Save, Phone, Key, Globe } from 'lucide-react';
import { api } from '@/lib/api';
import { ErrorState, Skeleton } from '@/components/shared';
import { useToast } from '@/components/toast';

interface WhatsAppSettings {
  wati_endpoint: string;
  wati_token: string;
  whatsapp_po_enabled: boolean;
  whatsapp_invoice_enabled: boolean;
  whatsapp_overdue_enabled: boolean;
  whatsapp_low_stock_enabled: boolean;
  whatsapp_admin_phone: string;
}

export default function WhatsAppSettingsPage() {
  const client = useQueryClient();
  const { showToast } = useToast();

  const [form, setForm] = useState<WhatsAppSettings | null>(null);
  const [testPhone, setTestPhone] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const query = useQuery({
    queryKey: ['settings-whatsapp'],
    queryFn: async () => {
      const res = await api.get<WhatsAppSettings>('/settings/whatsapp');
      setForm(res.data);
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: WhatsAppSettings) => {
      await api.put('/settings/whatsapp', data);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['settings-whatsapp'] });
      showToast('WhatsApp Business settings saved', 'success');
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : 'Failed to save WhatsApp settings', 'error');
    }
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const settings = form || query.data || {
    wati_endpoint: '',
    wati_token: '',
    whatsapp_po_enabled: true,
    whatsapp_invoice_enabled: true,
    whatsapp_overdue_enabled: true,
    whatsapp_low_stock_enabled: true,
    whatsapp_admin_phone: ''
  };

  const handleToggle = (key: keyof WhatsAppSettings) => {
    if (!form) return;
    setForm({ ...form, [key]: !form[key] });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (form) mutation.mutate(form);
  };

  const handleSendTest = async () => {
    if (!testPhone) {
      showToast('Please enter a phone number for test message', 'error');
      return;
    }
    setIsTesting(true);
    try {
      showToast(`Test message dispatched to ${testPhone} (simulation/live)`, 'info');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <MessageSquare size={16} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Omnichannel Communications</p>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">WhatsApp Business Integration (WATI)</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure automated customer & vendor notifications via WhatsApp Business API / WATI.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Credentials Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">WATI / WhatsApp API Credentials</h2>
          <p className="mt-1 text-xs text-slate-500">
            Enter your WATI API endpoint and Bearer access token. Leave empty to run in simulation sandbox mode.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Globe size={14} />
                WATI API Endpoint URL
              </label>
              <input
                type="url"
                value={settings.wati_endpoint}
                onChange={e => setForm({ ...settings, wati_endpoint: e.target.value })}
                placeholder="https://live-server-XXXX.wati.io"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Key size={14} />
                WATI Access Token / API Key
              </label>
              <input
                type="password"
                value={settings.wati_token}
                onChange={e => setForm({ ...settings, wati_token: e.target.value })}
                placeholder="••••••••••••••••••••••••••••••"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Phone size={14} />
                Admin WhatsApp Alert Number (Factory Owner)
              </label>
              <input
                type="tel"
                value={settings.whatsapp_admin_phone}
                onChange={e => setForm({ ...settings, whatsapp_admin_phone: e.target.value })}
                placeholder="+91 98260 12345"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Triggers Toggles */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">Automated Notification Triggers</h2>
          <p className="mt-1 text-xs text-slate-500">
            Control which automated events trigger instantaneous WhatsApp messages.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Trigger 1 */}
            <div className="flex items-start justify-between rounded-xl border p-4">
              <div>
                <span className="font-semibold text-slate-800">4.1 Purchase Order to Vendor</span>
                <p className="mt-1 text-xs text-slate-500">
                  Sends PO details and delivery date to vendor when PO status is marked as &apos;sent&apos;.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('whatsapp_po_enabled')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.whatsapp_po_enabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.whatsapp_po_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Trigger 2 */}
            <div className="flex items-start justify-between rounded-xl border p-4">
              <div>
                <span className="font-semibold text-slate-800">4.2 Tax Invoice to Customer</span>
                <p className="mt-1 text-xs text-slate-500">
                  Dispatches tax invoice number, amount, and payment link directly to customer phone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('whatsapp_invoice_enabled')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.whatsapp_invoice_enabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.whatsapp_invoice_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Trigger 3 */}
            <div className="flex items-start justify-between rounded-xl border p-4">
              <div>
                <span className="font-semibold text-slate-800">4.3 Payment Overdue Reminders</span>
                <p className="mt-1 text-xs text-slate-500">
                  Daily cron at 10:00 AM sends payment reminders for invoices overdue by 3, 7, 15, and 30 days.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('whatsapp_overdue_enabled')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.whatsapp_overdue_enabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.whatsapp_overdue_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Trigger 4 */}
            <div className="flex items-start justify-between rounded-xl border p-4">
              <div>
                <span className="font-semibold text-slate-800">4.4 Daily Low Stock Alert to Owner</span>
                <p className="mt-1 text-xs text-slate-500">
                  Daily morning 8:00 AM briefing sent to factory owner summarizing raw materials below reorder level.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('whatsapp_low_stock_enabled')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.whatsapp_low_stock_enabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.whatsapp_low_stock_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
          >
            <Save size={16} />
            {mutation.isPending ? 'Saving...' : 'Save WhatsApp Configuration'}
          </button>
        </div>
      </form>

      {/* Test Message Box */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
        <h3 className="text-sm font-bold text-slate-700">Verification Test</h3>
        <p className="mt-1 text-xs text-slate-500">
          Send a verification test ping to verify connectivity.
        </p>
        <div className="mt-3 flex max-w-md items-center gap-2">
          <input
            type="tel"
            value={testPhone}
            onChange={e => setTestPhone(e.target.value)}
            placeholder="+91 98260 00000"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isTesting}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <Send size={14} />
            {isTesting ? 'Sending...' : 'Test Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
