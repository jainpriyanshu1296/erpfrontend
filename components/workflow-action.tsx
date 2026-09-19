'use client';
import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ErrorState } from '@/components/shared';
import { Field, inputClass } from '@/components/workflow-card';

type Input = { key: string; label: string; type?: string; required?: boolean };
export function WorkflowAction({ title, endpoint, fields, submitLabel = 'Submit' }: { title: string; endpoint: string; fields: Input[]; submitLabel?: string }) {
  const [form, setForm] = useState<Record<string, string>>({});
  const mutation = useMutation({ mutationFn: () => api.post(endpoint.replace(/\{(\w+)\}/g, (_, key) => form[key] || ''), Object.fromEntries(Object.entries(form).filter(([key]) => !endpoint.includes(`{${key}}`)).map(([key, value]) => [key, ['quantity', 'amount'].includes(key) ? Number(value) : value]))), onSuccess: () => setForm({}) });
  return <section className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="font-semibold">{title}</h2><form onSubmit={(event: FormEvent) => { event.preventDefault(); mutation.mutate(); }} className="mt-4 grid gap-4 sm:grid-cols-2">{fields.map(field => <Field key={field.key} label={field.label}><input required={field.required} type={field.type || 'text'} value={form[field.key] || ''} onChange={event => setForm({ ...form, [field.key]: event.target.value })} className={inputClass} /></Field>)}<button disabled={mutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white sm:col-span-2">{mutation.isPending ? 'Saving...' : submitLabel}</button></form>{mutation.isSuccess && <p className="mt-3 text-sm text-emerald-600">Saved successfully.</p>}{mutation.isError && <ErrorState message={mutation.error.message} retry={() => mutation.reset()} />}</section>;
}
