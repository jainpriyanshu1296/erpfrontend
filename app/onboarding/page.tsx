'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { publicApi } from '@/lib/api';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function OnboardingContent() {
  const params = useSearchParams();
  const [message, setMessage] = useState('Preparing secure payment...');
  const [error, setError] = useState('');

  useEffect(() => {
    const organizationId = params.get('organization_id');
    const subscriptionId = params.get('subscription_id');
    const hostname = params.get('hostname');
    if (!organizationId || !subscriptionId) {
      setError('Onboarding session is incomplete. Please register again.');
      return;
    }

    const onboardingOrganizationId = organizationId;
    const onboardingSubscriptionId = subscriptionId;
    let cancelled = false;
    async function start() {
      try {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Payment checkout unavailable'));
          document.body.appendChild(script);
        });
        const result = await publicApi.createOrder(onboardingOrganizationId, onboardingSubscriptionId);
        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!key || !window.Razorpay) throw new Error('Payment configuration is missing');
        if (cancelled) return;
        const checkout = new window.Razorpay({
          key,
          amount: result.data.order.amount,
          currency: result.data.order.currency,
          name: 'Daanoday ERP',
          description: 'Organization subscription',
          order_id: result.data.order.id,
          handler: async (response: Record<string, string>) => {
            setMessage('Confirming payment securely...');
            try {
              await publicApi.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              setMessage(`Payment verified. Open ${hostname || 'your tenant'} to sign in.`);
            } catch (verificationError) {
              setError(verificationError instanceof Error ? verificationError.message : 'Payment verification failed');
            }
          },
          modal: { ondismiss: () => setError('Payment was cancelled. You can safely retry from this page.') },
        });
        checkout.open();
      } catch (startError) {
        setError(startError instanceof Error ? startError.message : 'Unable to start payment');
      }
    }
    start();
    return () => { cancelled = true; };
  }, [params]);

  return <main className="flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-lg rounded-xl border bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-bold">Complete your subscription</h1>{error ? <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div> : <p className="mt-4 text-sm text-slate-600">{message}</p>}<a className="mt-6 inline-block text-sm text-primary" href="/login">Go to sign in</a></div></main>;
}

export default function OnboardingPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center p-6"><div className="text-sm text-slate-500">Loading onboarding...</div></main>}><OnboardingContent /></Suspense>;
}
