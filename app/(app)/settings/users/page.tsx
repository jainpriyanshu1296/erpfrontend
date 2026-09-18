'use client';
import { ModuleWorkspace } from '@/components/module-workspace';

export default function Page() {
  return (
    <ModuleWorkspace
      title="Users & Roles"
      description="Manage organization users and access roles."
      endpoint="/settings/users"
      columns={['name', 'email', 'role', 'department', 'is_active', 'created_at']}
      fields={[
        { key: 'name', label: 'Full Name', required: true },
        { key: 'email', label: 'Email', required: true },
        { key: 'password', label: 'Password', type: 'password', required: true },
        {
          key: 'role', label: 'Role', type: 'select', required: true,
          options: ['admin', 'manager', 'accountant', 'purchase', 'inventory', 'production', 'sales', 'hr', 'operator', 'viewer']
        },
        { key: 'department', label: 'Department' },
        { key: 'phone', label: 'Phone' },
      ]}
    />
  );
}
