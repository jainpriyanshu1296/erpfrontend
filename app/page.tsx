import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { PublicLanding } from '@/components/public-landing';

export default function Page() {
  const host = headers().get('host')?.split(':')[0].toLowerCase() || '';
  const isTenantHost = host.endsWith('.daanoday.com') && !['www.daanoday.com', 'api.daanoday.com', 'erp.daanoday.com'].includes(host);
  if (isTenantHost) redirect('/login');
  return <PublicLanding />;
}
