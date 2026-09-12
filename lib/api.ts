import { api } from './api-client';
import type { DashboardSummary, Module, Notification, OrgContext } from '@/types';
export const authApi = {
  login: (body: { email: string; password: string; org_slug: string }) => api.post<{ token: string; refresh_token: string; org: OrgContext }>('/auth/login', body),
  register: (body: Record<string, string>) => api.post<{ token: string; refresh_token: string; org: OrgContext }>('/auth/register', body),
  logout: () => api.post<null>('/auth/logout', {}),
  forgotPassword: (body: { email: string; org_slug: string }) => api.post<null>('/auth/forgot-password', body),
  resetPassword: (body: { token: string; password: string; org_slug: string }) => api.post<null>('/auth/reset-password', body)
};
export const orgApi = {
  info: () => api.get<OrgContext>('/org/info'),
  modules: () => api.get<Module[]>('/org/modules'),
  summary: () => api.get<DashboardSummary>('/dashboard/summary'),
  alerts: () => api.get<Notification[]>('/dashboard/alerts')
};
export const recordsApi = (endpoint: string) => ({
  list: (params?: Record<string, string>) => api.get<unknown[]>(endpoint, params),
  create: (body: unknown) => api.post<unknown>(endpoint, body),
  update: (id: string, body: unknown) => api.put<unknown>(`${endpoint}/${id}`, body)
});
export const workflowApi = {
  submitRequisition: (id: string) => api.post<unknown>(`/purchase/requisitions/${id}/submit`, {}),
  createOrderFromRequisition: (body: unknown) => api.post<unknown>('/purchase/orders/from-requisition', body),
  saveRequisitionItems: (id: string, items: unknown[]) => api.post<unknown>(`/purchase/requisitions/${id}/items`, { items }),
  createGrnFromOrder: (body: unknown) => api.post<unknown>('/purchase/grn/from-order', body),
  approvePurchaseOrder: (id: string) => api.post<unknown>(`/purchase/orders/${id}/approve`, {}),
  postGrn: (id: string, body: unknown) => api.post<unknown>(`/purchase/grn/${id}/post`, body),
  createOrderFromQuotation: (quotationId: string) => api.post<unknown>('/sales/orders/from-quotation', { quotation_id: quotationId }),
  createInvoiceFromOrder: (orderId: string) => api.post<unknown>('/sales/invoices/from-order', { order_id: orderId }),
  stockAdjust: (body: unknown) => api.post<unknown>('/inventory/stock/adjust', body),
  calculateGst: (body: unknown) => api.post<unknown>('/finance/gst/calculate', body),
  calculateMrp: (body: unknown) => api.post<{ planned_quantity: number }>('/production/mrp/calculate', body),
  calculatePayroll: (body: unknown) => api.post<unknown>('/hr/payroll/calculate', body),
  recordPayment: (id: string, body: unknown) => api.post<unknown>(`/sales/invoices/${id}/payments`, body),
  markNotificationRead: (id: string) => api.patch<unknown>(`/notifications/${id}/read`, {}),
  markAllNotificationsRead: () => api.post<unknown>('/notifications/read-all', {})
  ,saveBomComponents: (id: string, components: unknown[]) => api.post<unknown>(`/production/bom/${id}/components`, { components })
  ,saveInvoiceLines: (id: string, body: unknown) => api.post<unknown>(`/sales/invoices/${id}/lines`, body)
  ,suspendOrganization: (id: string, reason: string) => api.post<unknown>(`/admin/organizations/${id}/suspend`, { reason })
  ,activateOrganization: (id: string) => api.post<unknown>(`/admin/organizations/${id}/activate`, {})
  ,getWorkOrderOperations: (woId: string) => api.get<unknown[]>(`/production/work-orders/${woId}/operations`)
  ,addWorkOrderOperation: (woId: string, body: unknown) => api.post<unknown>(`/production/work-orders/${woId}/operations`, body)
  ,updateWorkOrderOperation: (woId: string, opId: string, body: unknown) => api.put<unknown>(`/production/work-orders/${woId}/operations/${opId}`, body)
  ,getJobworkAging: () => api.get<unknown[]>('/jobwork/compliance/aging')
};
export { api };
