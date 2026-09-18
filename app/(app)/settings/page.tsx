'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, Users, LayoutGrid, Cpu, MessageSquare,
  Save, Plus, X, Power, CheckCircle2, Send, Phone, Key, Globe,
  Factory, ShoppingCart, PackageCheck, FileText, FileWarning, ShieldCheck,
  AlertCircle, Pencil, Trash2
} from 'lucide-react';
import { api } from '@/lib/api';
import { adminApi } from '@/lib/api-client';
import { Skeleton, ErrorState, EmptyState } from '@/components/shared';
import { useToast } from '@/components/toast';

const TABS = [
  { key: 'company',     label: 'Company',     icon: Building2 },
  { key: 'users',       label: 'Users',       icon: Users },
  { key: 'modules',     label: 'Modules',     icon: LayoutGrid },
  { key: 'automations', label: 'Automations', icon: Cpu },
  { key: 'whatsapp',    label: 'WhatsApp',    icon: MessageSquare },
];

// ─── Company ────────────────────────────────────────────────────────────────
function CompanyTab() {
  const { showToast } = useToast();
  const client = useQueryClient();
  const [form, setForm] = useState<Record<string, string> | null>(null);

  const query = useQuery({
    queryKey: ['org-info'],
    queryFn: async () => {
      const r = await api.get<Record<string, string>>('/org/info');
      setForm(r.data);
      return r.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.put('/org/info', data),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['org-info'] }); client.invalidateQueries({ queryKey: ['org'] }); showToast('Company info saved', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Save failed', 'error'),
  });

  if (query.isPending) return <Skeleton className="h-64" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const d = form || {};
  const set = (k: string, v: string) => setForm(f => ({ ...f!, [k]: v }));
  const inp = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500';

  return (
    <form onSubmit={e => { e.preventDefault(); mutation.mutate(d); }} className="space-y-5 max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ['company_name', 'Company Name', 'text'],
          ['owner_name',   'Owner Name',   'text'],
          ['owner_phone',  'Phone',        'tel'],
          ['gstin',        'GSTIN',        'text'],
          ['city',         'City',         'text'],
          ['state',        'State',        'text'],
        ].map(([k, label, type]) => (
          <label key={k} className="block text-xs font-medium text-slate-700">
            {label}
            <input type={type} value={d[k] || ''} onChange={e => set(k, e.target.value)}
              className={`mt-1 ${inp}`} />
          </label>
        ))}
        <label className="block text-xs font-medium text-slate-700 sm:col-span-2">
          Address
          <textarea rows={2} value={d.address || ''} onChange={e => set('address', e.target.value)}
            className={`mt-1 ${inp} resize-none`} />
        </label>
      </div>
      <button disabled={mutation.isPending}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
        <Save size={15} />{mutation.isPending ? 'Saving…' : 'Save Company Info'}
      </button>
    </form>
  );
}

// ─── Users ───────────────────────────────────────────────────────────────────
interface User { id: string; name: string; email: string; role: string; department?: string; is_active: number; }
const ROLES = ['admin','manager','accountant','purchase','inventory','production','sales','hr','operator','viewer'];

function UsersTab() {
  const { showToast } = useToast();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer', department: '', phone: '' });

  const query = useQuery({
    queryKey: ['org-users'],
    queryFn: async () => { const r = await api.get<User[]>('/settings/users'); return r.data || []; },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/settings/users', data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['org-users'] });
      setOpen(false);
      setForm({ name: '', email: '', password: '', role: 'viewer', department: '', phone: '' });
      showToast('User created', 'success');
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/settings/users/${id}`),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['org-users'] }); showToast('User deactivated', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const inp = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500';

  if (query.isPending) return <Skeleton className="h-48" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const users = query.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus size={15} />Add User
        </button>
      </div>

      {open && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">New User</h3>
            <button onClick={() => setOpen(false)}><X size={16} className="text-slate-400" /></button>
          </div>
          <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }} className="grid gap-3 sm:grid-cols-2">
            {[
              ['name',       'Full Name',  'text',     true],
              ['email',      'Email',      'email',    true],
              ['password',   'Password',   'password', true],
              ['phone',      'Phone',      'tel',      false],
              ['department', 'Department', 'text',     false],
            ].map(([k, label, type, req]) => (
              <label key={k} className="block text-xs font-medium text-slate-700">
                {label}{req ? ' *' : ''}
                <input type={type as string} required={!!req}
                  value={form[k as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  className={`mt-1 ${inp}`} />
              </label>
            ))}
            <label className="block text-xs font-medium text-slate-700">
              Role *
              <select required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className={`mt-1 ${inp}`}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </label>
            <div className="flex gap-2 sm:col-span-2 justify-end">
              <button type="button" onClick={() => setOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
              <button disabled={createMutation.isPending}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {createMutation.isPending ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!users.length ? (
        <EmptyState title="No users yet" description="Add team members to give them access." />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs text-slate-500">
              <tr>
                {['Name','Email','Role','Department','Status',''].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 capitalize">{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.department || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_active ? (
                      <button onClick={() => deactivateMutation.mutate(u.id)}
                        className="rounded p-1 text-red-400 hover:bg-red-50" title="Deactivate">
                        <Trash2 size={15} />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Modules ─────────────────────────────────────────────────────────────────
interface OrgModule { id: number; module_key: string; module_name: string; min_plan: string; sort_order: number; is_enabled: boolean | number; }

function ModulesTab() {
  const { showToast } = useToast();
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ['org-modules-settings'],
    queryFn: async () => { const r = await api.get<OrgModule[]>('/org/modules'); return r.data || []; },
  });

  const toggleMutation = useMutation({
    mutationFn: (key: string) => api.put(`/org/modules/${key}/toggle`, {}),
    onSuccess: (_, key) => {
      client.invalidateQueries({ queryKey: ['org-modules-settings'] });
      client.invalidateQueries({ queryKey: ['modules'] });
      showToast(`Module '${key}' updated`, 'success');
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  if (query.isPending) return <Skeleton className="h-64" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const modules = query.data || [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map(mod => {
        const enabled = Boolean(mod.is_enabled);
        const isCore = mod.module_key === 'dashboard';
        return (
          <div key={mod.module_key}
            className={`flex flex-col justify-between rounded-xl border p-5 transition-all ${enabled ? 'border-slate-200 bg-white shadow-sm' : 'border-dashed border-slate-300 bg-slate-50 opacity-70'}`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {mod.min_plan}
                </span>
                <span className={`flex items-center gap-1 text-xs font-semibold ${enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {enabled ? <CheckCircle2 size={13} /> : <Power size={13} />}
                  {enabled ? 'Active' : 'Off'}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-800">{mod.module_name}</h3>
            </div>
            <div className="mt-4 border-t pt-3">
              {isCore ? (
                <span className="text-xs italic text-slate-400">Core — always on</span>
              ) : (
                <button disabled={toggleMutation.isPending} onClick={() => toggleMutation.mutate(mod.module_key)}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${enabled ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  <Power size={13} />{enabled ? 'Disable' : 'Enable'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Automations ──────────────────────────────────────────────────────────────
interface AutoRules { auto_wo_on_so: boolean; auto_pr_on_shortfall: boolean; auto_backflush_on_wo: boolean; auto_qc_debit_note: boolean; auto_stock_reserve: boolean; auto_invoice_on_dispatch: boolean; }

const AUTO_LIST = [
  { key: 'auto_wo_on_so' as const,            icon: Factory,       badge: 'Production', title: 'Auto Work Order on Sales Order',        desc: 'SO confirmed → Work Order auto-drafted based on BOM.' },
  { key: 'auto_pr_on_shortfall' as const,     icon: ShoppingCart,  badge: 'Purchase',   title: 'Auto PR on BOM Shortfall',              desc: 'Low stock against BOM requirement → Purchase Requisition auto-drafted.' },
  { key: 'auto_backflush_on_wo' as const,     icon: PackageCheck,  badge: 'Inventory',  title: 'Auto Backflush on WO Complete',         desc: 'WO done → raw materials auto-consumed, finished goods auto-credited.' },
  { key: 'auto_qc_debit_note' as const,       icon: FileWarning,   badge: 'Quality',    title: 'Auto Debit Note on QC Rejection',       desc: 'Rejected GRN qty → Vendor Debit Note auto-drafted.' },
  { key: 'auto_stock_reserve' as const,       icon: ShieldCheck,   badge: 'Sales',      title: 'Hard Stock Reserve on SO Confirm',      desc: 'SO confirmed → stock locked, prevents double-booking.' },
  { key: 'auto_invoice_on_dispatch' as const, icon: FileText,      badge: 'Finance',    title: 'Auto Invoice on Dispatch',              desc: 'Delivery Challan saved → GST Invoice auto-drafted.' },
];

function AutomationsTab() {
  const { showToast } = useToast();
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ['settings-automations'],
    queryFn: async () => { const r = await api.get<AutoRules>('/settings/automations'); return r.data; },
  });

  const mutation = useMutation({
    mutationFn: (data: AutoRules) => api.put('/settings/automations', data),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['settings-automations'] }); showToast('Automation rules saved', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  if (query.isPending) return <Skeleton className="h-64" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const rules: AutoRules = query.data || { auto_wo_on_so: false, auto_pr_on_shortfall: false, auto_backflush_on_wo: false, auto_qc_debit_note: false, auto_stock_reserve: false, auto_invoice_on_dispatch: false };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {AUTO_LIST.map(item => {
        const Icon = item.icon;
        const on = rules[item.key];
        return (
          <div key={item.key}
            className={`flex items-start justify-between rounded-xl border p-5 gap-4 transition-all ${on ? 'border-indigo-200 bg-white shadow-sm' : 'border-dashed border-slate-300 bg-slate-50 opacity-75'}`}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">{item.badge}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
            <button disabled={mutation.isPending}
              onClick={() => mutation.mutate({ ...rules, [item.key]: !on })}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${on ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${on ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
interface WASettings { wati_endpoint: string; wati_token: string; whatsapp_admin_phone: string; whatsapp_po_enabled: boolean; whatsapp_invoice_enabled: boolean; whatsapp_overdue_enabled: boolean; whatsapp_low_stock_enabled: boolean; }

const WA_TRIGGERS = [
  { key: 'whatsapp_po_enabled' as const,      label: 'PO to Vendor',          desc: 'Sends PO details when status = sent.' },
  { key: 'whatsapp_invoice_enabled' as const, label: 'Invoice to Customer',   desc: 'Sends invoice + amount on creation.' },
  { key: 'whatsapp_overdue_enabled' as const, label: 'Overdue Reminders',     desc: 'Daily reminders for overdue invoices.' },
  { key: 'whatsapp_low_stock_enabled' as const,label: 'Low Stock Alert',      desc: 'Morning brief to owner — items below reorder.' },
];

function WhatsAppTab() {
  const { showToast } = useToast();
  const client = useQueryClient();
  const [form, setForm] = useState<WASettings | null>(null);
  const [testPhone, setTestPhone] = useState('');

  const query = useQuery({
    queryKey: ['settings-whatsapp'],
    queryFn: async () => { const r = await api.get<WASettings>('/settings/whatsapp'); setForm(r.data); return r.data; },
  });

  const mutation = useMutation({
    mutationFn: (data: WASettings) => api.put('/settings/whatsapp', data),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['settings-whatsapp'] }); showToast('WhatsApp settings saved', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  if (query.isPending) return <Skeleton className="h-48" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const s = form || query.data!;
  const set = (k: keyof WASettings, v: string | boolean) => setForm(f => ({ ...f!, [k]: v }));
  const inp = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500';

  return (
    <form onSubmit={e => { e.preventDefault(); mutation.mutate(s); }} className="space-y-6 max-w-2xl">
      <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-800">WATI Credentials</h3>
        <label className="block text-xs font-medium text-slate-700">
          <span className="flex items-center gap-1"><Globe size={13} /> Endpoint URL</span>
          <input type="url" value={s.wati_endpoint} onChange={e => set('wati_endpoint', e.target.value)}
            placeholder="https://live-server-XXXX.wati.io" className={`mt-1 ${inp}`} />
        </label>
        <label className="block text-xs font-medium text-slate-700">
          <span className="flex items-center gap-1"><Key size={13} /> Access Token</span>
          <input type="password" value={s.wati_token} onChange={e => set('wati_token', e.target.value)}
            placeholder="••••••••••••••••" className={`mt-1 ${inp}`} />
        </label>
        <label className="block text-xs font-medium text-slate-700">
          <span className="flex items-center gap-1"><Phone size={13} /> Owner Alert Number</span>
          <input type="tel" value={s.whatsapp_admin_phone} onChange={e => set('whatsapp_admin_phone', e.target.value)}
            placeholder="+91 98260 12345" className={`mt-1 ${inp}`} />
        </label>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-slate-800">Notification Triggers</h3>
        {WA_TRIGGERS.map(t => (
          <div key={t.key} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{t.label}</p>
              <p className="text-xs text-slate-500">{t.desc}</p>
            </div>
            <button type="button" onClick={() => set(t.key, !s[t.key])}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${s[t.key] ? 'bg-emerald-600' : 'bg-slate-300'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${s[t.key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <input type="tel" value={testPhone} onChange={e => setTestPhone(e.target.value)}
          placeholder="Test number +91..." className="rounded-lg border px-3 py-2 text-sm w-48 outline-none focus:border-emerald-500" />
        <button type="button" onClick={() => showToast(`Test sent to ${testPhone}`, 'info')}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <Send size={13} />Test
        </button>
        <button disabled={mutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 ml-auto">
          <Save size={15} />{mutation.isPending ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState<string>('company');

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Organization</p>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500">Manage your workspace, users, modules and integrations.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${active ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              <Icon size={16} />{t.label}
            </button>
          );
        })}
      </div>

      <div>
        {tab === 'company'     && <CompanyTab />}
        {tab === 'users'       && <UsersTab />}
        {tab === 'modules'     && <ModulesTab />}
        {tab === 'automations' && <AutomationsTab />}
        {tab === 'whatsapp'    && <WhatsAppTab />}
      </div>
    </div>
  );
}
