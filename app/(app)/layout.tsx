'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AppShell, ErrorState, Skeleton } from '@/components/shared';
import { orgApi } from '@/lib/api';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Client-side auth guard — redirect to login if no token
  useEffect(() => {
    // The backend validates the HttpOnly session cookie through the organization query.
  }, [router]);

  const org = useQuery({ queryKey: ['org'], queryFn: () => orgApi.info() });
  const modules = useQuery({ queryKey: ['modules'], queryFn: () => orgApi.modules(), enabled: org.isSuccess });

  if (org.isPending || modules.isPending) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-8 h-64 w-full" />
      </div>
    );
  }

  if (org.isError || modules.isError) {
    return (
      <div className="p-8">
        <ErrorState
          message="Unable to load organization. Please sign in again."
          retry={() => {
            localStorage.removeItem('erp_tabs');
            window.location.href = '/login';
          }}
        />
      </div>
    );
  }

  return <AppShell org={org.data.data} modules={modules.data.data}>{children}</AppShell>;
}
