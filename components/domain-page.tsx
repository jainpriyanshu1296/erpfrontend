'use client';
import { ModuleWorkspace } from '@/components/module-workspace';

type Props = {
  title: string;
  description: string;
  endpoint: string;
  columns: string[];
  fields?: Array<{ key: string; label: string; type?: 'number' | 'select' | 'text' | 'date' | 'password'; required?: boolean; options?: string[] }>;
  statusOptions?: string[];
  detailPath?: string;
  transitionEndpoint?: string;
};

/** Configuration wrapper keeps domain pages consistent with the audited workspace UX. */
export function DomainPage({ title, description, endpoint, columns, fields = [], statusOptions = [], detailPath, transitionEndpoint }: Props) {
  return <ModuleWorkspace title={title} description={description} endpoint={endpoint} columns={columns} fields={fields} statusOptions={statusOptions} detailPath={detailPath} transitionEndpoint={transitionEndpoint} actionEndpoint={transitionEndpoint ? endpoint : undefined} />;
}
