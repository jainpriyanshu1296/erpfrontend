'use client';
import { useQuery } from '@tanstack/react-query';
import { AppShell, ErrorState, Skeleton } from '@/components/shared';
import { orgApi } from '@/lib/api';
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const org = useQuery({ queryKey: ['org'], queryFn: () => orgApi.info() });
  const modules = useQuery({ queryKey: ['modules'], queryFn: () => orgApi.modules(), enabled: org.isSuccess });
  if (org.isPending || modules.isPending) return <div className="p-8"><Skeleton className="h-10 w-64" /><Skeleton className="mt-8 h-64 w-full" /></div>;
  if (org.isError || modules.isError) return <div className="p-8"><ErrorState message="Unable to load organization context. Sign in again or check the backend." retry={() => window.location.reload()} /></div>;
  return <AppShell org={org.data.data} modules={modules.data.data}>{children}</AppShell>;
}
