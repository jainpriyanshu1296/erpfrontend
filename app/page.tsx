import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Page() {
  const host = headers().get('host')?.split(':')[0].toLowerCase() || '';
  const isTenantHost = host.endsWith('.daanoday.com') && !['www.daanoday.com', 'api.daanoday.com'].includes(host);
  if (isTenantHost || host === 'localhost' || host === '127.0.0.1') redirect('/login');
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-bold">Daanoday ERP</span>
        <div className="flex gap-3 text-sm"><a href="/modules" className="rounded-lg px-4 py-2 text-slate-300 hover:text-white">Modules</a><a href="/pricing" className="rounded-lg px-4 py-2 text-slate-300 hover:text-white">Pricing</a><a href="/register" className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold">Get started</a></div>
      </header>
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Manufacturing operations platform</p><h1 className="mt-5 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">Run your factory, inventory and finance from one workspace.</h1><p className="mt-6 max-w-2xl text-lg text-slate-300">A configurable ERP SaaS for growing manufacturing organizations, with tenant isolation, subscription-controlled modules and reliable workflows.</p><div className="mt-8 flex gap-3"><a href="/register" className="rounded-lg bg-indigo-500 px-5 py-3 font-semibold">Create organization</a><a href="/modules" className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-200">Explore modules</a></div></section>
    </main>
  );
}
