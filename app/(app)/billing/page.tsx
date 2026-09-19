'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/lib/api';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function Page() {
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState(1);
  const [error, setError] = useState('');
  const query = useQuery({ queryKey: ['billing'], queryFn: () => billingApi.info() });
  const orderMutation = useMutation({
    mutationFn: (body: { plan: string; duration_months: number }) => billingApi.createOrder(body),
    onError: (e: Error) => setError(e.message),
  });

  useEffect(() => {
    if (document.querySelector('script[data-razorpay]')) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'true';
    document.body.appendChild(script);
  }, []);

  if (query.isPending) return <Skeleton className="h-64" />;
  if (query.isError) return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const data = query.data.data;

  async function choosePlan(plan: string) {
    setError('');
    try {
      const result = await orderMutation.mutateAsync({ plan, duration_months: duration });
      if (!window.Razorpay) throw new Error('Payment checkout is unavailable. Please try again.');
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!key) throw new Error('Payment configuration is missing. Please contact support.');
      const payment = new window.Razorpay({
        key,
        amount: result.data.order.amount,
        currency: result.data.order.currency,
        name: 'ERP',
        description: `${plan} plan`,
        order_id: result.data.order.id,
        handler: async (response: Record<string, string>) => {
          await billingApi.verifyPayment({
            subscription_id: result.data.subscription_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['billing'] }),
            queryClient.invalidateQueries({ queryKey: ['org'] }),
            queryClient.invalidateQueries({ queryKey: ['modules'] }),
          ]);
        },
        modal: { ondismiss: () => setError('Payment was cancelled.') },
      });
      payment.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to start payment');
    }
  }

  return <div className="space-y-5">
    <div>
      <h1 className="text-2xl font-bold">Billing & Subscription</h1>
      <p className="text-sm text-slate-500">Choose a plan to unlock its modules. Access changes only after payment is verified.</p>
    </div>
    {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="rounded-xl border bg-white p-6">
      <p className="text-sm text-slate-500">Current plan</p>
      <p className="text-3xl font-bold capitalize">{data.plan}</p>
      {data.trial_ends_at && <p className="mt-2 text-sm">Trial ends: {data.trial_ends_at}</p>}
      <label className="mt-4 flex items-center gap-2 text-sm">
        Billing period
        <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="rounded-lg border p-2">
          <option value={1}>Monthly</option>
          <option value={12}>Yearly</option>
        </select>
      </label>
    </div>
    {data.pricing?.length ? <div className="grid gap-4 md:grid-cols-3">{data.pricing.filter(plan => plan.duration_months === duration).map(plan => <div key={plan.id} className="rounded-xl border bg-white p-5">
      <h2 className="font-semibold capitalize">{plan.plan}</h2>
      <p className="mt-2 text-2xl font-bold">₹{plan.amount}</p>
      <p className="text-sm text-slate-500">{duration === 12 ? 'per year' : 'per month'}</p>
      <button onClick={() => choosePlan(plan.plan)} disabled={orderMutation.isPending || plan.plan === data.plan} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50">
        {plan.plan === data.plan ? 'Current plan' : orderMutation.isPending ? 'Starting checkout...' : 'Choose plan'}
      </button>
    </div>)}</div> : <EmptyState title="No pricing available" description="Pricing plans will appear when configured by an administrator." />}
  </div>;
}
