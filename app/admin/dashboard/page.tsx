'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ErrorState, Skeleton } from '@/components/shared';
export default function Page(){const query=useQuery({queryKey:['admin-dashboard'],queryFn:()=>api.get<{organizations:number}>('/admin/dashboard')});if(query.isPending)return <Skeleton className="h-48"/>;if(query.isError)return <ErrorState message={query.error.message} retry={()=>query.refetch()}/>;return <div className="space-y-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Administration</p><h1 className="text-2xl font-bold">System Overview</h1><p className="text-sm text-slate-500">Master organization metrics from the backend.</p></div><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">Organizations</p><p className="mt-2 text-3xl font-bold">{query.data.data.organizations}</p></div></div></div>}
