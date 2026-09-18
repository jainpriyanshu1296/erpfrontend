'use client';
import { ReactNode, useEffect, useState } from 'react';
import { 
  AlertCircle, Box, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, 
  Package, ShoppingCart, Users, X, Factory, Wallet, FileBarChart, Settings, 
  Bell, Cpu, MessageSquareCode, TrendingUp, MessageSquare, Menu 
} from 'lucide-react';
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
  { key: 'reports-smart', label: 'Smart Reports', path: '/reports/smart', icon: MessageSquareCode },
  { key: 'forecasting', label: 'Forecasting & AI', path: '/reports/forecasting', icon: TrendingUp },
  { key: 'notifications', label: 'Notifications', path: '/notifications', icon: Bell },
  { key: 'settings', label: 'Settings', path: '/settings/company', icon: Settings },
  { key: 'settings-modules', label: 'Feature Toggles', path: '/settings/modules', icon: Settings },
  { key: 'settings-automations', label: 'Process Automations', path: '/settings/automations', icon: Cpu },
  { key: 'settings-whatsapp', label: 'WhatsApp (WATI)', path: '/settings/whatsapp', icon: MessageSquare },
  { key: 'billing', label: 'Billing', path: '/billing', icon: Wallet },
];

export function AppShell({ children, org, modules }: { children: ReactNode; org?: OrgContext; modules?: Module[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
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
    if (key === 'settings-automations') return pathname === '/settings/automations';
    if (key === 'settings-whatsapp') return pathname === '/settings/whatsapp';
    if (key === 'reports-smart') return pathname === '/reports/smart';
    if (key === 'forecasting') return pathname === '/reports/forecasting';
    return pathname.startsWith(`/${key}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 md:pb-0">
      {/* Top Header */}
      <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="rounded p-2 text-slate-600 hover:bg-slate-100 md:hidden" 
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
          {/* Desktop collapse toggle */}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="hidden rounded p-2 hover:bg-slate-100 md:block" 
            title="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <span className="font-bold text-slate-800 text-sm md:text-base truncate max-w-[180px] sm:max-w-none">
            {org?.company_name || 'ERP Workspace'}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 md:px-3 md:py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
            {org?.plan || 'plan'}
          </span>
          <button
            onClick={async () => {
              try { await authApi.logout(); } finally {
                localStorage.removeItem('erp_token');
                localStorage.removeItem('erp_refresh_token');
                localStorage.removeItem('erp_org_slug');
                localStorage.removeItem('erp_tabs');
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

      {/* Desktop Sidebar */}
      <aside className={`fixed bottom-0 left-0 top-16 z-10 hidden border-r bg-white p-3 transition-all duration-200 md:block ${collapsed ? 'w-16' : 'w-64'}`}>
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {nav.map(item => {
            const Icon = item.icon;
            const isTally = item.key === 'tally';
            const isSetting = item.key.startsWith('settings');
            const isSmart = item.key === 'reports-smart' || item.key === 'forecasting';
            const locked = item.key !== 'dashboard' && !isTally && !isSetting && !isSmart && modules && !modules.some(m => m.module_key === item.key);
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

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex w-4/5 max-w-xs flex-col bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-bold text-slate-800 text-sm">{org?.company_name || 'ERP Workspace'}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="rounded p-1 text-slate-400">
                <X size={20} />
              </button>
            </div>
            <nav className="mt-3 flex-1 overflow-y-auto space-y-1">
              {nav.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => openTab(item)}
                    className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-sm ${
                      active(item.key) ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`pt-16 transition-all duration-200 ${collapsed ? 'md:pl-16' : 'md:pl-64'}`}>
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

      {/* Mobile Bottom Navigation Bar (PWA Friendly) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t bg-white px-2 shadow-lg md:hidden">
        <button
          onClick={() => router.push('/dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            pathname === '/dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => router.push('/production/work-orders')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            pathname.startsWith('/production') ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Factory size={18} />
          <span>Production</span>
        </button>

        <button
          onClick={() => router.push('/sales/quotations')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            pathname.startsWith('/sales') ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <ShoppingCart size={18} />
          <span>Sales</span>
        </button>

        <button
          onClick={() => router.push('/inventory/stock')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            pathname.startsWith('/inventory') ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Package size={18} />
          <span>Inventory</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500"
        >
          <Menu size={18} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
