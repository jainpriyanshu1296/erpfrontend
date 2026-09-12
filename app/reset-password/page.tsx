'use client';
import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

function ResetPasswordForm() {
  const params = useSearchParams(); const router = useRouter(); const [error, setError] = useState(''); const [done, setDone] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget); const password = String(form.get('password')); const confirmation = String(form.get('confirmation'));
    if (password.length < 8 || password !== confirmation) { setError('Password must be at least 8 characters and match confirmation.'); return; }
    try { await authApi.resetPassword({ token: params.get('token') || '', org_slug: params.get('org_slug') || '', password }); setDone(true); window.setTimeout(() => router.push('/login'), 1200); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to reset password'); }
  }

  return <main className="flex min-h-screen items-center justify-center p-6"><form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-xl border bg-white p-8 shadow-sm"><h1 className="text-2xl font-bold">Choose a new password</h1>{done && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Password reset. Redirecting to sign in...</div>}{error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}<input required minLength={8} type="password" name="password" placeholder="New password" className="w-full rounded-lg border p-3" /><input required minLength={8} type="password" name="confirmation" placeholder="Confirm password" className="w-full rounded-lg border p-3" /><button disabled={done} className="w-full rounded-lg bg-primary p-3 font-semibold text-white">Reset password</button></form></main>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="p-8 text-center text-sm text-slate-500">Loading reset form...</main>}><ResetPasswordForm /></Suspense>;
}
