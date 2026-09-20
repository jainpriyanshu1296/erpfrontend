'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export type ModuleNavItem = { label: string; href: string };

export function ModuleSidebar({ title, items, children }: { title: string; items: ModuleNavItem[]; children: ReactNode }) {
  const pathname = usePathname();
  return <div className="grid min-h-[calc(100vh-9rem)] gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
    <aside className="h-fit rounded-xl border bg-white p-3 shadow-sm lg:sticky lg:top-20">
      <div className="border-b px-3 py-3"><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Workspace</p><h2 className="mt-1 text-lg font-bold text-slate-900">{title}</h2></div>
      <nav className="mt-2 space-y-1" aria-label={`${title} navigation`}>
        {items.map(item => {
          const active = pathname === item.href || (item.href !== `/${title.toLowerCase().split(' ')[0]}` && pathname.startsWith(`${item.href}/`));
          return <Link key={item.href} href={item.href} className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'}`}>{item.label}</Link>;
        })}
      </nav>
    </aside>
    <main className="min-w-0">{children}</main>
  </div>;
}
