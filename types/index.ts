export interface ApiResponse<T> { success: boolean; data: T; message?: string; meta?: { total?: number; page?: number; limit?: number }; error?: string }
export interface OrgContext { id: string; slug: string; company_name: string; logo_url?: string; plan: string; trial_ends_at?: string; active_modules?: string[] }
export interface Module { module_key: string; module_name: string; min_plan: string; sort_order: number }
export interface TabItem { id: string; title: string; path: string; pinned?: boolean }
export interface DashboardSummary { items: number; vendors: number; plan: string }
export interface Notification { id: string; title: string; description?: string; severity: 'critical'|'warning'|'info'; is_read: boolean; created_at: string }
