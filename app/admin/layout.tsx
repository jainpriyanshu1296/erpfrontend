'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LayoutDashboard, Building2, PackageCheck, LogOut, AlertCircle } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('erp_admin_token');
    setToken(saved);
    setLoading(false);
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${base}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid administrator credentials');
      }

      // Only erp_admin_token — never touches erp_token (org session)
      localStorage.setItem('erp_admin_token', data.data.token);
      setToken(data.data.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('erp_admin_token');
    setToken(null);
    // Stay on /admin/dashboard — layout will show login form automatically
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated — show admin login form (no redirect, no loop)
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <Shield size={24} />
            </div>
          </div>
          <h1 className="mt-4 text-center text-xl font-bold text-white">Superadmin Console</h1>
          <p className="mt-1 text-center text-xs text-slate-400">
            Master platform credentials required
          </p>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@erp.com"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Access Admin Console'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-4 text-center">
            <Link href="/login" className="text-xs text-slate-400 hover:text-white">
              Return to Organization Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const adminNav = [
    { label: 'System Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Organizations', path: '/admin/organizations', icon: Building2 },
    { label: 'Global Modules', path: '/admin/modules', icon: PackageCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Shield size={18} />
          </div>
          <div>
            <span className="font-bold text-white">Master Admin Console</span>
            <span className="ml-2 rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Superadmin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs text-slate-400 hover:text-white">
            View Org App
          </Link>
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-red-500/20 hover:text-red-400"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 z-10 w-60 border-r border-slate-800 bg-slate-950 p-4">
        <nav className="space-y-1">
          {adminNav.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="pl-60 pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
