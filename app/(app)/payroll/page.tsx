'use client';
import Link from 'next/link';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
export default function Page() { return <section className="space-y-5"><div><h1 className="text-2xl font-bold">Payroll</h1><p className="text-sm text-slate-500">Structures, assignments, runs, and payslips.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Structures','/payroll/structures'],['Assignments','/payroll/assignments'],['Runs','/payroll/runs'],['Payslips','/payroll/payslips']].map(([label,href]) => <Link key={href} href={href} className="rounded-xl border bg-white p-4 font-semibold hover:border-indigo-300">{label}</Link>)}</div><AnalyticsDashboard title="Payroll analytics" /></section>; }
