'use client';
import { FormEvent, useState } from 'react';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      await authApi.forgotPassword({ email: String(form.get('email')), org_slug: String(form.get('org_slug')) });
      setMessage('If the account exists, reset instructions have been sent.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to send reset instructions'); }
  }
  return <main className="flex min-h-screen items-center justify-center p-6"><form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-xl border bg-white p-8 shadow-sm"><h1 className="text-2xl font-bold">Reset password</h1><p className="text-sm text-slate-500">Enter your organization and account email.</p>{message && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}{error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}<input required name="org_slug" placeholder="Organization slug" className="w-full rounded-lg border p-3" /><input required type="email" name="email" placeholder="Email" className="w-full rounded-lg border p-3" /><button className="w-full rounded-lg bg-primary p-3 font-semibold text-white">Send reset instructions</button><a href="/login" className="block text-center text-sm text-primary">Back to sign in</a></form></main>;
}
