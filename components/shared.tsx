'use client';
import { ReactNode, useEffect, useState } from 'react';
import { AlertCircle, Box, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Package, ShoppingCart, Users, X, Factory, Wallet, FileBarChart, Settings, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Module, OrgContext, TabItem } from '@/types';
import { authApi } from '@/lib/api';

export function Skeleton({ className = '' }: { className?: string }) { return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />; }
export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center"><Box className="mb-3 text-slate-400" /><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></div>; }
export function ErrorState({ message, retry }: { message: string; retry: () => void }) { return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"><AlertCircle className="mb-2" /><p>{message}</p><button onClick={retry} className="mt-3 rounded bg-red-600 px-3 py-2 text-white">Retry</button></div>; }
const nav = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'purchase', label: 'Purchase', path: '/purchase/requisitions', icon: ShoppingCart },
  { key: 'inventory', label: 'Inventory', path: '/inventory/stock', icon: Package },
  { key: 'production', label: 'Production', path: '/production/work-orders', icon: Factory },
  { key: 'jobwork', label: 'Job Work', path: '/jobwork/challans', icon: Box },
  { key: 'quality', label: 'Quality', path: '/quality/final', icon: FileBarChart },
  { key: 'sales', label: 'Sales & Dispatch', path: '/sales/quotations', icon: ShoppingCart },
  { key: 'hr', label: 'HR & Payroll', path: '/hr/attendance', icon: Users },
  { key: 'finance', label: 'Finance', path: '/finance/receivables', icon: Wallet },
  { key: 'tally', label: 'Tally Prime Sync', path: '/finance/tally', icon: Wallet },
  { key: 'reports', label: 'Reports', path: '/reports/records', icon: FileBarChart },
  { key: 'notifications', label: 'Notifications', path: '/notifications', icon: Bell },
  { key: 'settings', label: 'Settings', path: '/settings/company', icon: Settings },
  { key: 'settings-modules', label: 'Feature Toggles', path: '/settings/modules', icon: Settings },
  { key: 'billing', label: 'Billing', path: '/billing', icon: Wallet },
];

export function AppShell({ children, org, modules }: { children: ReactNode; org?: OrgContext; modules?: Module[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [tabs, setTabs] = useState<TabItem[]>([{ id: 'dashboard', title: 'Dashboard', path: '/dashboard', pinned: true }]);

  useEffect(() => {
    const stored = localStorage.getItem('erp_tabs');
    if (stored) {
      try { setTabs(JSON.parse(stored)); } catch { /* ignore */ }
    }
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('erp_dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('erp_tabs', JSON.stringify(tabs));
  }, [tabs]);

  // Keyboard shortcut Ctrl+W to close active unpinned tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        const currentTab = tabs.find(t => t.path === pathname);
        if (currentTab && !currentTab.pinned) {
          e.preventDefault();
          closeTab(currentTab);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, pathname]);

  function openTab(item: typeof nav[number]) {
    setTabs(current => {
      if (current.some(tab => tab.path === item.path)) return current;
      return [...current.slice(-9), { id: item.key, title: item.label, path: item.path }];
    });
    router.push(item.path);
  }

  function closeTab(tab: TabItem) {
    if (tab.pinned) return;
    const next = tabs.filter(item => item.id !== tab.id);
    setTabs(next);
    if (pathname === tab.path) {
      router.push(next[next.length - 1]?.path || '/dashboard');
    }
  }

  const active = (key: string) => {
    if (key === 'dashboard') return pathname === '/dashboard';
    if (key === 'tally') return pathname === '/finance/tally';
    if (key === 'settings-modules') return pathname === '/settings/modules';
    return pathname.startsWith(`/${key}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setCollapsed(!collapsed)} className="rounded p-2 hover:bg-slate-100" title="Toggle Sidebar">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <span className="font-bold text-slate-800">{org?.company_name || 'ERP Workspace'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            {org?.plan || 'plan'}
          </span>
          <button
            onClick={async () => {
              try { await authApi.logout(); } finally {
                localStorage.removeItem('erp_token');
                localStorage.removeItem('erp_refresh_token');
                router.push('/login');
              }
            }}
            className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-red-600"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <aside className={`fixed bottom-0 left-0 top-16 z-10 border-r bg-white p-3 transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'}`}>
        <nav className="space-y-1">
          {nav.map(item => {
            const Icon = item.icon;
            const isTally = item.key === 'tally';
            const isSetting = item.key.startsWith('settings');
            const locked = item.key !== 'dashboard' && !isTally && !isSetting && modules && !modules.some(m => m.module_key === item.key);
            return (
              <button
                disabled={locked}
                key={item.key}
                onClick={() => openTab(item)}
                title={item.label}
                className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-sm transition-colors ${
                  active(item.key) ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                } ${locked ? 'cursor-not-allowed opacity-40' : ''}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className={`pt-16 transition-all duration-200 ${collapsed ? 'pl-16' : 'pl-64'}`}>
        {/* Multi-Tab Workspace Bar */}
        <div className="sticky top-16 z-10 flex h-11 items-center gap-1.5 overflow-x-auto border-b bg-slate-100 px-3 shadow-inner">
          {tabs.map(tab => {
            const isActive = pathname === tab.path;
            return (
              <div
                key={tab.id}
                className={`group flex shrink-0 items-center gap-2 rounded-t-md border-t-2 px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'border-indigo-600 bg-white text-indigo-700 shadow-sm'
                    : 'border-transparent bg-slate-200/70 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Link href={tab.path} className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-indigo-600' : 'bg-transparent'}`} />
                  {tab.title}
                </Link>
                {!tab.pinned && (
                  <button
                    onClick={() => closeTab(tab)}
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-300 hover:text-slate-700"
                    title="Close tab (Ctrl+W)"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
