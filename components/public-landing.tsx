'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, publicApi } from '@/lib/api';
import type { LandingDocument } from '@/lib/landing-content';

export function PublicLanding() {
  const content = useQuery({ queryKey: ['public-landing'], queryFn: () => api.get<LandingDocument>('/public/content/landing') });
  const pricing = useQuery({ queryKey: ['public-pricing'], queryFn: () => publicApi.pricing() });
  const page = content.data?.data.content;
  return <main className="min-h-screen bg-slate-950 text-white">
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6"><Link href="/" className="text-xl font-bold">{page?.brand || 'Daanoday ERP'}</Link><nav aria-label="Public navigation" className="flex gap-5 text-sm"><a href="#modules">Modules</a><a href="#plans">Plans</a><Link href="/login">Login</Link><Link href="/register">Get started</Link></nav></header>
    {content.isPending && <p role="status" className="mx-auto max-w-6xl px-6 py-20">Loading…</p>}
    {content.isError && <section role="alert" className="mx-auto max-w-6xl px-6 py-20"><p>Public content could not be loaded.</p><button className="mt-4 rounded border px-4 py-2" onClick={() => content.refetch()}>Retry</button></section>}
    {page && <>
      <section className="mx-auto max-w-6xl px-6 py-24"><p className="text-sm uppercase tracking-widest text-indigo-300">Manufacturing operations</p><h1 className="mt-6 max-w-4xl text-5xl font-bold leading-tight sm:text-7xl">{page.headline}</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{page.introduction}</p><Link href="/register" className="mt-8 inline-block rounded-lg bg-indigo-500 px-6 py-3 font-semibold">{page.cta}</Link></section>
      <section id="modules" className="mx-auto max-w-6xl px-6 py-12"><h2 className="text-3xl font-semibold">Connected modules</h2><ul className="mt-8 grid gap-4 md:grid-cols-3">{page.features.map((feature, index) => <li key={index} className="rounded-xl border border-slate-700 bg-slate-900 p-6">{feature}</li>)}</ul></section>
      <section className="mx-auto max-w-6xl px-6 py-12"><h2 className="text-3xl font-semibold">From materials to delivery</h2><ol className="mt-8 grid gap-4 md:grid-cols-5">{page.workflow.map((step, index) => <li key={index} className="border-t border-indigo-400 pt-4"><span className="block text-indigo-300">{index + 1}</span><p className="mt-2">{step}</p></li>)}</ol></section>
      <section className="mx-auto max-w-6xl px-6 py-12"><h2 className="text-3xl font-semibold">Built around your teams</h2><ul className="mt-6 space-y-4 text-lg text-slate-300">{page.benefits.map((benefit, index) => <li key={index}>{benefit}</li>)}</ul></section>
      <section id="plans" className="mx-auto max-w-6xl px-6 py-12"><h2 className="text-3xl font-semibold">Plans</h2>{pricing.isPending && <p className="mt-4">Loading pricing…</p>}{pricing.isError && <p className="mt-4" role="alert">Pricing is unavailable. <button className="underline" onClick={() => pricing.refetch()}>Retry</button></p>}{pricing.isSuccess && !pricing.data.data.length && <p className="mt-4">No plans are currently available.</p>}<div className="mt-8 grid gap-4 md:grid-cols-3">{pricing.data?.data.map(offer => <article key={`${offer.plan}-${offer.duration_months}`} className="rounded-xl border border-slate-700 p-6"><h3 className="text-xl font-semibold capitalize">{offer.plan}</h3><p className="mt-4 text-2xl">{offer.currency} {Number(offer.amount).toLocaleString()}</p><p className="mt-2 text-slate-400">{offer.duration_months} month(s) · optional modules priced separately</p><Link href="/register" className="mt-6 inline-block text-indigo-300">Select plan →</Link></article>)}</div></section>
      <section className="mx-auto max-w-6xl px-6 py-20"><h2 className="text-3xl font-semibold">{page.cta}</h2><Link href="/register" className="mt-6 inline-block rounded-lg bg-indigo-500 px-6 py-3">Get started</Link>{page.contact_email && <p className="mt-6">Contact: <a className="underline" href={`mailto:${page.contact_email}`}>{page.contact_email}</a></p>}</section>
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-sm text-slate-400">{page.footer}</footer>
    </>}
  </main>;
}
