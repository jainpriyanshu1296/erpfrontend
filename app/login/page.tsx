'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
export default function LoginPage() {
  const router = useRouter(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try { const result = await authApi.login({ email: String(form.get('email')), password: String(form.get('password')), org_slug: String(form.get('org_slug')) }); localStorage.setItem('erp_token', result.data.token); localStorage.setItem('erp_refresh_token', result.data.refresh_token); localStorage.setItem('erp_org_slug', result.data.org.slug); router.push('/dashboard'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Login failed'); } finally { setBusy(false); }
  }
  return <main className="flex min-h-screen items-center justify-center p-6"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-xl border bg-white p-8 shadow-sm"><div><h1 className="text-2xl font-bold">ERP Workspace</h1><p className="mt-1 text-sm text-slate-500">Sign in to your organization</p></div>{error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}<input required name="org_slug" placeholder="Organization slug" className="w-full rounded-lg border p-3" /><input required type="email" name="email" placeholder="Email" className="w-full rounded-lg border p-3" /><input required type="password" name="password" placeholder="Password" className="w-full rounded-lg border p-3" /><button disabled={busy} className="w-full rounded-lg bg-primary p-3 font-semibold text-white disabled:opacity-50">{busy ? 'Signing in...' : 'Sign in'}</button><div className="flex justify-between text-sm"><a className="text-primary" href="/forgot-password">Forgot password?</a><a className="text-primary" href="/register">Create organization</a></div></form></main>;
}
