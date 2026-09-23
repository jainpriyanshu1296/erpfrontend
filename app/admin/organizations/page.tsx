'use client';
import { FieldErrors } from '@/components/field-errors';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Plus, X, Building2 } from 'lucide-react';
import { adminApi } from '@/lib/api-client';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';
import { useToast } from '@/components/toast';

interface Org {
  id: string; slug: string; company_name: string; owner_email: string;
  owner_phone?: string; plan: string; status: string; is_active: number; is_suspended: number; created_at: string;
}
interface OrgModule {
  id: number; module_key: string; module_name: string; min_plan: string; is_active: number;
}

const PLANS = ['free', 'starter', 'growth', 'pro'];
const inp = 'w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 placeholder:text-slate-500';

function CreateOrgModal({ onClose }: { onClose: () => void }) {
  const client = useQueryClient();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    company_name: '', owner_name: '', owner_email: '', owner_phone: '',
    slug: '', password: '', plan: 'free', duration_months: '1',
  });

  const mutation = useMutation({
    mutationFn: () => adminApi.post('/admin/organizations', {...form,duration_months:Number(form.duration_months)}),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['admin-orgs'] });
      showToast('Organization created successfully', 'success');
      onClose();
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed to create org', 'error'),
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Auto-generate slug from company name
  const handleCompanyName = (v: string) => {
    setForm(f => ({
      ...f,
      company_name: v,
      slug: f.slug || v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 p-5">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-indigo-400" />
            <h2 className="font-bold text-white">Create New Organization</h2>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-400">
              Company Name *
              <input className={`mt-1 ${inp}`} value={form.company_name}
                onChange={e => handleCompanyName(e.target.value)} placeholder="Acme Manufacturing Pvt Ltd" /><FieldErrors error={mutation.error} field="company_name" />
            </label>
            <label className="block text-xs font-medium text-slate-400">
              Org Slug * <span className="text-slate-500">(URL identifier)</span>
              <input className={`mt-1 ${inp}`} value={form.slug}
                onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="acme-manufacturing" /><FieldErrors error={mutation.error} field="slug" />
            </label>
            <label className="block text-xs font-medium text-slate-400">
              Owner Name
              <input className={`mt-1 ${inp}`} value={form.owner_name}
                onChange={e => set('owner_name', e.target.value)} placeholder="Ramesh Kumar" /><FieldErrors error={mutation.error} field="owner_name" />
            </label>
            <label className="block text-xs font-medium text-slate-400">
              Owner Email *
              <input type="email" className={`mt-1 ${inp}`} value={form.owner_email}
                onChange={e => set('owner_email', e.target.value)} placeholder="ramesh@acme.com" /><FieldErrors error={mutation.error} field="owner_email" />
            </label>
            <label className="block text-xs font-medium text-slate-400">
              Owner Phone
              <input type="tel" className={`mt-1 ${inp}`} value={form.owner_phone}
                onChange={e => set('owner_phone', e.target.value)} placeholder="+91 98260 12345" /><FieldErrors error={mutation.error} field="owner_phone" />
            </label>
            <label className="block text-xs font-medium text-slate-400">
              Plan
              <select className={`mt-1 ${inp}`} value={form.plan} onChange={e => set('plan', e.target.value)}>
                {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select><FieldErrors error={mutation.error} field="plan" />
            </label>
            <label className="block text-xs font-medium text-slate-400 sm:col-span-2">
              Billing duration (months)
              <input type="number" min="1" max="120" className={`mt-1 ${inp}`} value={form.duration_months} onChange={e=>set('duration_months',e.target.value)} /><FieldErrors error={mutation.error} field="duration_months" />
            </label>
            <label className="block text-xs font-medium text-slate-400 sm:col-span-2">
              Admin Password * <span className="text-slate-500">(owner login password)</span>
              <input type="password" className={`mt-1 ${inp}`} value={form.password}
                onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" /><FieldErrors error={mutation.error} field="password" />
            </label>
          </div>

          {mutation.isError && <p role="alert" className="text-sm text-red-300">{mutation.error instanceof Error ? mutation.error.message : 'Unable to create organization'}</p>}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">What happens on create:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>New org database is provisioned automatically</li>
              <li>Admin user created with the email + password above</li>
              <li>Login URL: <span className="font-mono text-indigo-400">erp.daanoday.com/login</span> → slug: <span className="font-mono text-indigo-400">{form.slug || 'your-slug'}</span></li>
              <li>Modules available based on selected plan</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-3 justify-end border-t border-slate-700 p-5">
          <button onClick={onClose} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">Cancel</button>
          <button
            disabled={mutation.isPending || !form.company_name || !form.owner_email || !form.slug || !form.password}
            onClick={() => mutation.mutate()}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {mutation.isPending ? 'Creating…' : 'Create Organization'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrgRow({ org }: { org: Org }) {
  const client = useQueryClient();
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  const modulesQuery = useQuery({
    queryKey: ['admin-org-modules', org.id],
    queryFn: () => adminApi.get<OrgModule[]>(`/admin/organizations/${org.id}/modules`),
    enabled: expanded,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.post(`/admin/organizations/${id}/suspend`, { reason }),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['admin-orgs'] }); setConfirmSuspend(false); setSuspendReason(''); showToast('Organization suspended', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.post(`/admin/organizations/${id}/activate`, {}),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['admin-orgs'] }); showToast('Organization activated', 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });
  const retryMutation=useMutation({
    mutationFn:(id:string)=>adminApi.post(`/admin/organizations/${id}/retry-provisioning`,{}),
    onSuccess:()=>{client.invalidateQueries({queryKey:['admin-orgs']});showToast('Organization provisioned','success');},
    onError:(e:unknown)=>showToast(e instanceof Error?e.message:'Provisioning retry failed','error'),
  });

  const planMutation = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) =>
      adminApi.put(`/admin/organizations/${id}/plan`, { plan }),
    onSuccess: (_, { plan }) => { client.invalidateQueries({ queryKey: ['admin-orgs'] }); showToast(`Plan updated to ${plan}`, 'success'); },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const moduleToggleMutation = useMutation({
    mutationFn: ({ orgId, module_key, is_active }: { orgId: string; module_key: string; is_active: boolean }) =>
      adminApi.put(`/admin/organizations/${orgId}/modules`, { module_key, is_active }),
    onSuccess: (_, { module_key, is_active }) => {
      client.invalidateQueries({ queryKey: ['admin-org-modules', org.id] });
      showToast(`${module_key} ${is_active ? 'enabled' : 'disabled'}`, 'success');
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const suspended = Boolean(org.is_suspended);

  return (
    <div className="border-b border-slate-700 last:border-0">
      <div className="flex flex-wrap items-center gap-3 p-4 hover:bg-slate-800/40">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{org.company_name}</p>
          <p className="text-xs text-slate-400">
            {org.owner_email} · <span className="font-mono">{org.slug}</span>
            {org.owner_phone && <span> · {org.owner_phone}</span>}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Created: {String(org.created_at).slice(0, 10)}</p>
        </div>

        <select value={org.plan}
          onChange={e => planMutation.mutate({ id: org.id, plan: e.target.value })}
          disabled={planMutation.isPending || suspended}
          className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-40">
          {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>

        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${suspended || org.status==='pending' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {suspended ? 'Suspended' : org.status}
        </span>

        {org.status==='pending' && <button onClick={()=>retryMutation.mutate(org.id)} disabled={retryMutation.isPending} className="rounded border border-amber-600 px-3 py-1 text-xs text-amber-300 disabled:opacity-50">Retry provisioning</button>}

        {suspended ? (
          <button onClick={() => activateMutation.mutate(org.id)} disabled={activateMutation.isPending}
            className="rounded border border-green-600 px-3 py-1 text-xs text-green-400 hover:bg-green-500/10 disabled:opacity-50">
            Activate
          </button>
        ) : (
          <button onClick={() => setConfirmSuspend(true)}
            className="rounded border border-red-700 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10">
            Suspend
          </button>
        )}

        <button onClick={() => setExpanded(e => !e)} className="rounded p-1 text-slate-400 hover:text-white">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {confirmSuspend && (
        <div className="mx-4 mb-3 rounded-lg border border-red-700/40 bg-red-500/10 p-3">
          <p className="text-xs text-red-400 mb-2">Reason for suspension:</p>
          <div className="flex gap-2">
            <input value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
              placeholder="e.g. Payment overdue"
              className="flex-1 rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-white outline-none" />
            <button onClick={() => { setConfirmSuspend(false); setSuspendReason(''); }}
              className="rounded border border-slate-600 px-3 py-1.5 text-xs text-slate-400">Cancel</button>
            <button
              onClick={() => suspendMutation.mutate({ id: org.id, reason: suspendReason || 'Suspended by administrator' })}
              disabled={suspendMutation.isPending}
              className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
              {suspendMutation.isPending ? '…' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="mx-4 mb-4 rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Module Access</p>
          {modulesQuery.isPending ? (
            <p className="text-xs text-slate-500">Loading modules…</p>
          ) : modulesQuery.isError ? (
            <p className="text-xs text-red-400">Failed to load modules</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(modulesQuery.data?.data || []).map(mod => {
                const on = Boolean(mod.is_active);
                return (
                  <div key={mod.module_key} className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2">
                    <div>
                      <p className="text-xs font-medium text-white">{mod.module_name}</p>
                      <p className="text-[10px] text-slate-500">min plan: {mod.min_plan}</p>
                    </div>
                    <button
                      onClick={() => moduleToggleMutation.mutate({ orgId: org.id, module_key: mod.module_key, is_active: !on })}
                      disabled={moduleToggleMutation.isPending}
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${on ? 'bg-indigo-600' : 'bg-slate-600'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${on ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  const query = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: () => adminApi.get<Org[]>('/admin/organizations'),
  });

  if (query.isPending) return <Skeleton className="h-72" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const rows = (query.data?.data || []).filter(r =>
    !search || r.company_name.toLowerCase().includes(search.toLowerCase()) ||
    r.owner_email.toLowerCase().includes(search.toLowerCase()) ||
    r.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {showCreate && <CreateOrgModal onClose={() => setShowCreate(false)} />}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">Administration</p>
          <h1 className="text-2xl font-bold text-white">Organizations</h1>
          <p className="text-sm text-slate-400">Manage plans, module access, and org status.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus size={16} /> New Organization
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by company, email or slug…"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', val: query.data?.data?.length || 0, color: 'text-white' },
          { label: 'Active', val: (query.data?.data || []).filter(o => !o.is_suspended).length, color: 'text-green-400' },
          { label: 'Suspended', val: (query.data?.data || []).filter(o => o.is_suspended).length, color: 'text-red-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      {!rows.length ? (
        <EmptyState title="No organizations found" description="Create the first organization with the button above." />
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50">
          {rows.map(row => <OrgRow key={row.id} org={row} />)}
        </div>
      )}
    </div>
  );
}
