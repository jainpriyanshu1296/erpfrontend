'use client';
import { ReactNode } from 'react';
export function WorkflowCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="rounded-xl border bg-white p-5 shadow-sm"><div className="mb-5"><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>{children}</section>;
}
export function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="text-sm font-medium">{label}<div className="mt-1">{children}</div></label>; }
export const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500';
