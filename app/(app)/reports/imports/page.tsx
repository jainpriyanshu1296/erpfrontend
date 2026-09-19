import { OperationalWorkspace } from '@/components/operational-workspace';

export default function ImportsPage() {
  return <OperationalWorkspace
    title="Imports"
    description="Track validated import jobs and their row-level processing results."
    endpoint="/closure/imports"
    columns={['id', 'entity_type', 'source_name', 'status', 'total_rows', 'processed_rows', 'created_at']}
    action={{ label: 'Process', path: '/closure/imports/:id/process' }}
    create={{ fields: [
      { key: 'entity_type', label: 'Entity', required: true },
      { key: 'source_name', label: 'Source file', required: true },
      { key: 'payload_json', label: 'Rows JSON' }
    ] }}
  />;
}
