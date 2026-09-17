'use client';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api-client';
import { ErrorState, Skeleton } from '@/components/shared';

interface DashboardData {
  organizations: number;
}

export default function Page() {
  const query = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.get<DashboardData>('/admin/dashboard'),
  });

  if (query.isPending) return <Skeleton className="h-48" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;

  const data = query.data.data;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">Administration</p>
        <h1 className="text-2xl font-bold text-white">System Overview</h1>
        <p className="text-sm text-slate-400">Master platform metrics.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400">Total Organizations</p>
          <p className="mt-2 text-3xl font-bold text-white">{data.organizations}</p>
        </div>
      </div>
    </div>
  );
}
