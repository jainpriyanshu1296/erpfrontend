import { OperationalWorkspace } from '@/components/operational-workspace';
export default function ImportExportPage() {
  return <OperationalWorkspace title="Exports" description="Monitor live export jobs and generate downloadable results." endpoint="/closure/exports" columns={['id','entity_type','status','created_by','created_at']} action={{ label: 'Generate', path: '/closure/exports/:id/run' }} />;
}
